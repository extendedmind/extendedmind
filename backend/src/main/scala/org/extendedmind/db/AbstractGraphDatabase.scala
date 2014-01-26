package org.extendedmind.db

import java.util.UUID
import scala.collection.JavaConverters._
import scala.collection.JavaConversions._
import org.apache.commons.codec.binary.Base64
import org.extendedmind._
import org.extendedmind.Response._
import org.extendedmind.domain._
import org.extendedmind.security._
import org.neo4j.graphdb.Node
import org.neo4j.scala.Neo4jWrapper
import org.neo4j.graphdb.GraphDatabaseService
import org.neo4j.graphdb.DynamicRelationshipType
import org.neo4j.graphdb.Direction
import org.neo4j.kernel.extension.KernelExtensionFactory
import org.neo4j.extension.uuid.UUIDKernelExtensionFactory
import org.neo4j.extension.timestamp.TimestampKernelExtensionFactory
import org.neo4j.server.configuration.ServerConfigurator
import org.neo4j.server.configuration.Configurator
import org.neo4j.server.WrappingNeoServerBootstrapper
import org.neo4j.kernel._
import org.neo4j.scala._
import org.neo4j.graphdb.traversal._
import scala.collection.mutable.ListBuffer
import org.neo4j.graphdb.Relationship
import org.neo4j.graphdb.RelationshipType
import spray.util.LoggingContext
import java.lang.Boolean

case class OwnerNodes(user: Node, collective: Option[Node])

abstract class AbstractGraphDatabase extends Neo4jWrapper {

  // IMPLICITS

  // Settings
  def settings: Settings
  implicit val implSettings = settings

  // Implicit Neo4j Scala wrapper serialization exclusions
  implicit val serializeExclusions: Option[scala.List[String]] = Some(
    // Always exclude the direct setting of the following:
    scala.List("uuid", "modified", "deleted", // Container
        "visibility", // ShareableItem
        "relationships", // ExtendedItem
        "completed", "assignee", "assigner", // Task
        "archived", // List
        "parent", "tagType" // Tag
        ))
  // Implicit Neo4j Scala wrapper converters
  implicit val customConverters: Option[Map[String, AnyRef => AnyRef]] =
    // Convert trimmed Base64 UUID to java.util.UUID
    Some(Map("uuid" -> (uuid => Some(UUIDUtils.getUUID(uuid.asInstanceOf[String])))))

  // INITIALIZATION

  protected def kernelExtensions(setupAutoindexing: Boolean = true): java.util.ArrayList[KernelExtensionFactory[_]] = {
    val extensions = new java.util.ArrayList[KernelExtensionFactory[_]](2);
    extensions.add(new UUIDKernelExtensionFactory(false, false, setupAutoindexing));
    extensions.add(new TimestampKernelExtensionFactory(setupAutoindexing));
    extensions
  }

  protected def startServer() {
    if (settings.startNeo4jServer) {
      val config: ServerConfigurator = new ServerConfigurator(ds.gds.asInstanceOf[GraphDatabaseAPI]);
      config.configuration().setProperty(
        Configurator.WEBSERVER_PORT_PROPERTY_KEY, settings.neo4jServerPort);
      val srv: WrappingNeoServerBootstrapper =
        new WrappingNeoServerBootstrapper(ds.gds.asInstanceOf[GraphDatabaseAPI], config);
      srv.start();
    }
  }
  
  // LOAD DATABASE TO MEMORY
  
  def loadDatabase(): Boolean = {
    withTx {
      implicit neo4j =>
        // Sixty seconds wait for first load
        neo4j.gds.isAvailable(1000*60)
    }
  }
  
  def checkDatabase(): Boolean = {
    withTx {
      implicit neo4j =>
        neo4j.gds.isAvailable(1000)
    }
  }
  
  // SHUTDOWN
  
  def shutdownServer(): Unit = {
    withTx {
      implicit neo4j =>
        neo4j.gds.shutdown()
    }
  }

  // CONVERSION

  protected def updateNode(node: Node, caseClass: AnyRef): Response[Node] = {
    try {
      Right(Neo4jWrapper.serialize[Node](caseClass, node))
    } catch {
      case e: Exception => fail(INTERNAL_SERVER_ERROR, "Exception while updating node", e)
    }
  }

  protected def toCaseClass[T: Manifest](node: Node): Response[T] = {
    try {
      Right(Neo4jWrapper.deSerialize[T](node))
    } catch {
      case e: Exception => fail(INTERNAL_SERVER_ERROR, "Exception while converting node " + node.getId(), e)
    }
  }

  protected def getSetResult(node: Node, includeUUID: Boolean): SetResult = {
    withTx {
      implicit neo4j =>
        val uuid = if (includeUUID)
          Some(UUIDUtils.getUUID(node.getProperty("uuid").asInstanceOf[String]))
        else None
        SetResult(uuid, node.getProperty("modified").asInstanceOf[Long])
    }
  }
  
  def forceUUID(setResult: SetResult, uuid: Option[UUID], label: Label): Response[SetResult] = {
    if (uuid.isEmpty) Right(setResult)
    else{
      withTx {
        implicit neo4j =>
          val node = getNode(setResult.uuid.get, label)
          if (node.isLeft) Left(node.left.get)
          else{
            node.right.get.setProperty("uuid", UUIDUtils.getTrimmedBase64UUID(uuid.get))
            Right(SetResult(uuid, node.right.get.getProperty("modified").asInstanceOf[Long]))
          }
      }
    }
  }
  
  protected def getUUID(node: Node): UUID = {
    UUIDUtils.getUUID(node.getProperty("uuid").asInstanceOf[String])
  }
  
  protected def getEndNodeUUIDList(relationships: scala.List[Relationship]): scala.List[UUID] = {
    relationships map (relationship => getUUID(relationship.getEndNode()))
  }

  // GENERAL

  protected def getNodes(nodeUUIDList: scala.List[UUID], label: Label, acceptDeleted: Boolean = false): Response[scala.List[Node]] = {
    Right(nodeUUIDList map (uuid => {
      val nodeResponse = getNode(uuid, label)
      if (nodeResponse.isLeft) return Left(nodeResponse.left.get)
      else nodeResponse.right.get
    }))
  }
  
  protected def getTokenNode(token: Token, acceptDeleted: Boolean = false)
        (implicit log: LoggingContext): Response[Node] = {
    getNode("accessKey", token.accessKey: java.lang.Long, MainLabel.TOKEN, None, acceptDeleted)
  }

  protected def getNodeOption(nodeUUID: Option[UUID], label: Label, acceptDeleted: Boolean = false): Response[Option[Node]] = {
    if (nodeUUID.isDefined){
      val nodeResponse = getNode(nodeUUID.get, label, acceptDeleted)
      if (nodeResponse.isLeft) return Left(nodeResponse.left.get)
      else Right(Some(nodeResponse.right.get))
    }
    else Right(None)
  }
  
  protected def getNode(nodeUUID: UUID, label: Label, acceptDeleted: Boolean = false): Response[Node] = {
    val uuidString = UUIDUtils.getTrimmedBase64UUID(nodeUUID)
    getNode("uuid", uuidString, label, Some(nodeUUID.toString()), acceptDeleted)
  }
  
  protected def getNode(nodeProperty: String, nodeValue: AnyRef, label: Label, nodeStringValue: Option[String], 
                        acceptDeleted: Boolean)(implicit log: LoggingContext): Response[Node] = {
    withTx {
      implicit neo =>
        val nodeList = findNodesByLabelAndProperty(label, nodeProperty, nodeValue).toList
        if (nodeList.isEmpty)
          fail(INVALID_PARAMETER, label.labelName.toLowerCase() + " not found with given " + nodeProperty + 
              (if (nodeStringValue.isDefined) ": " + nodeStringValue.get else ""))
        else if (nodeList.size > 1){
          // Check if nodeList contains the same node multiple times
          if (nodeList.distinct.size() > 1){
            fail(INTERNAL_SERVER_ERROR, "Ḿore than one " + label.labelName.toLowerCase() + " found with given " + nodeProperty + 
              (if (nodeStringValue.isDefined) ": " + nodeStringValue.get else ""))
          }else{
            log.warning("Found " + nodeList.size + " duplicate values in index for " + label.labelName + ":" + nodeProperty)
            Right(nodeList(0))
          }
        }else {
          if (!acceptDeleted && nodeList(0).hasProperty("deleted")){
            fail(INVALID_PARAMETER, label.labelName.toLowerCase() + " deleted with given " + nodeProperty + 
                (if (nodeStringValue.isDefined) ": " + nodeStringValue.get else ""))
          }else{
            Right(nodeList(0))
          }
        }
    }
  }
  
  protected def getRelationship(first: Node, second: Node, relationshipType: RelationshipType*)(implicit neo4j: DatabaseService): 
            Response[Option[Relationship]] = {
    val relationshipList = first.getRelationships(relationshipType:_*).toList
    var returnValue: Option[Relationship] = None
    relationshipList.foreach(relationship => {
      if (relationship.getEndNode() == second || relationship.getStartNode() == second){
        if (returnValue.isDefined){
          return fail(INTERNAL_SERVER_ERROR, "More than one relationship of types " + relationshipType 
                      + " found between nodes " + getUUID(first) 
                      + " and " + getUUID(second))
        }
        returnValue = Some(relationship)
      }
    })
    Right(returnValue)
  }

  protected def getOwnerUUID(owner: Owner): UUID = {
    if (owner.collectiveUUID.isDefined) owner.collectiveUUID.get
    else owner.userUUID
  }
  
  protected def getOwnerNode(ownerNodes: OwnerNodes): Node = {
    if (ownerNodes.collective.isDefined) ownerNodes.collective.get
    else ownerNodes.user
  }

}