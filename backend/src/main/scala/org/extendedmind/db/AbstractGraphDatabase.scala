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
import org.neo4j.graphdb.traversal.Evaluators

abstract class AbstractGraphDatabase extends Neo4jWrapper {

  // IMPLICITS
  
  // Settings
  def settings: Settings
  implicit val implSettings = settings

  // Implicit Neo4j Scala wrapper serialization exclusions
  implicit val serializeExclusions: Option[List[String]] = Some(
    // Always exclude the direct setting of uuid, modified, completed, public and exclusive
    List("uuid", "modified", "completed", "public", "exclusive")
  )
  // Implicit Neo4j Scala wrapper converters
  implicit val customConverters: Option[Map[String, AnyRef => AnyRef]] = 
    // Convert trimmed Base64 UUID to java.util.UUID
    Some(Map("uuid" -> (uuid => Some(UUIDUtils.getUUID(uuid.asInstanceOf[String]))))
  )
  
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
  
  // CONVERSION

  protected def updateNode(node: Node, caseClass: AnyRef): Response[Node] = {
    try{
      Right(Neo4jWrapper.serialize[Node](caseClass, node))
    } catch {
      case e: Exception => fail(INTERNAL_SERVER_ERROR, "Exception while updating node", e)
   }
  }
  
  protected def toCaseClass[T: Manifest](node: Node): Response[T] = {
    try{
      Right(Neo4jWrapper.deSerialize[T](node))
    } catch {
      case e: Exception => fail(INTERNAL_SERVER_ERROR, "Exception while converting node " + node.getId(), e)
    }
  }
  
  protected def getSetResult(node: Node, includeUUID: Boolean): Response[SetResult] ={
    withTx{
      implicit neo4j =>
        val uuid = if(includeUUID) 
                      Some(UUIDUtils.getUUID(node.getProperty("uuid").asInstanceOf[String])) 
                   else None
        Right(SetResult(uuid,
                        node.getProperty("modified").asInstanceOf[Long]))
    }
  }
  
  // GENERAL
  
  protected def getTokenNode(token: Token): Response[Node] = {
    withTx {
      implicit neo =>
        val nodeIter = findNodesByLabelAndProperty(MainLabel.TOKEN, "accessKey", token.accessKey: java.lang.Long)
        if (nodeIter.toList.isEmpty)
          fail(INVALID_PARAMETER, "No tokens found with given token")
        else if (nodeIter.toList.size > 1)
          fail(INTERNAL_SERVER_ERROR, "Ḿore than one token found with given token")
        else {
          Right(nodeIter.toList(0))
        }
    }
  }
}