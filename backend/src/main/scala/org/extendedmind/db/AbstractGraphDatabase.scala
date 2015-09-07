/**
 * Copyright (c) 2013-2015 Extended Mind Technologies Oy
 *
 * This file is part of Extended Mind.
 *
 * Extended Mind is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

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
import scala.reflect.runtime.universe._
import java.lang.Boolean
import org.neo4j.cypher.javacompat.ExecutionEngine
import akka.event.LoggingAdapter
import org.neo4j.index.lucene.QueryContext
import org.neo4j.extension.timestamp.TimestampCustomPropertyHandler
import org.neo4j.graphdb.index.IndexHits
import org.neo4j.graphdb.event.TransactionEventHandler
import org.neo4j.extension.uuid.UUIDTransactionEventHandler
import org.neo4j.extension.timestamp.TimestampTransactionEventHandler

case class OwnerNodes(user: Node, foreignOwner: Option[Node])

abstract class AbstractGraphDatabase extends Neo4jWrapper {

  // IMPLICITS

  // Settings
  def settings: Settings
  implicit val implSettings = settings

  var engine: ExecutionEngine = null;

  // Implicit Neo4j Scala wrapper serialization exclusions
  implicit val serializeExclusions: Option[scala.List[String]] = Some(
    // Always exclude the direct setting of the following:
    scala.List("uuid", "created", "modified", "deleted", // Container
      "visibility", // ShareableItem
      "relationships", // ExtendedItem
      "completed", "assignee", "assigner", "reminders", // Task
      "favorited", // Note
      "archived", // List
      "parent", "tagType", // Tag
      "targetItem", "proposedBy", "proposedTo", "accepted" // Agreement
      ))
  // Implicit Neo4j Scala wrapper converters
  implicit val customConverters: Option[Map[String, AnyRef => AnyRef]] =
    // Convert trimmed Base64 UUID to java.util.UUID
    Some(Map("uuid" -> (uuid => Some(UUIDUtils.getUUID(uuid.asInstanceOf[String])))))

  // INITIALIZATION

  protected def transactionEventHandlers(): java.util.ArrayList[TransactionEventHandler[_]] = {
    val eventHandlers = new java.util.ArrayList[TransactionEventHandler[_]](2);
    eventHandlers.add(new UUIDTransactionEventHandler(false, false));

    if (settings.disableTimestamps) {
      println("WARNING: Automatic timestamps disabled!")
    } else {
      val customPropertyHandlers = new java.util.ArrayList[TimestampCustomPropertyHandler](1)
      // soft delete of list or tag needs to cause items associated with it to also modify themselves
      val deletedModificationTags = new java.util.ArrayList[RelationshipType](2)
      deletedModificationTags.add(ItemRelationship.HAS_TAG)
      deletedModificationTags.add(ItemRelationship.HAS_PARENT)
      val deletedHandler = new TimestampCustomPropertyHandler("deleted", deletedModificationTags, Direction.INCOMING)
      customPropertyHandlers.add(deletedHandler)
      eventHandlers.add(new TimestampTransactionEventHandler(true, customPropertyHandlers));
    }
    eventHandlers
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

  def loadDatabase(implicit log: LoggingAdapter): Boolean = {
    withTx {
      implicit neo4j =>
        // Sixty seconds wait for first load
        val available = neo4j.gds.isAvailable(1000 * 60)
        engine = new ExecutionEngine(ds.gds)
        val statistics = getStatisticsInTx
        log.info("users: " + statistics.users +
          ", items: " + statistics.items)
        // Add transaction event handlers here
        transactionEventHandlers.foreach(eventHandler => neo4j.gds.registerTransactionEventHandler(eventHandler))
        available
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
    shutdown(ds)
  }

  // STATISTICS AND INFO

  def getStatistics(): Response[Statistics] = {
    withTx {
      implicit neo4j =>
        Right(getStatisticsInTx)
    }
  }

  def getStatisticsInTx(implicit neo4j: DatabaseService): Statistics = {
    if (engine == null) engine = new ExecutionEngine(neo4j.gds)
    val userCountResult = engine.execute("start n=node(*) match (n:USER) return count(n) as userCount").iterator().next()
    // Use index to get items
    val itemCount = neo4j.gds.index().forNodes("items").query("*:*").size()

    Statistics(userCountResult.get("userCount").asInstanceOf[Long],
      itemCount)
  }

  def getInfo(): Response[Info] = {
    withTx {
      implicit neo4j =>
        val infoNodes = findNodesByLabel(MainLabel.INFO).toList
        if (infoNodes.size == 1){
          val infoNode = infoNodes(0)
          val platforms = infoNode.getPropertyKeys.filter(property => {
            property != "created" && property != "modified" && property != "uuid"
          })
          val frontend = platforms.map(platform => VersionInfo(platform, infoNode.getProperty(platform).asInstanceOf[String]))
          if (frontend.isEmpty){
            Right(Info(None, None))
          }else{
            Right(Info(None, Some(frontend.toList)))
          }
        }else {
          Right(Info(None, None))
        }
    }
  }

  def putInfo(info: Info): Response[SetResult] = {
    for {
      // Don't set history tag of parent to list
      infoNode <- putInfoNode(info).right
      result <- Right(getSetResult(infoNode, false)).right
    } yield result
  }



  // CONVERSION

  protected def updateNode(node: Node, caseClass: AnyRef): Response[Node] = {
    try {
      Right(Neo4jWrapper.serialize[Node](caseClass, node))
    } catch {
      case e: Exception => fail(INTERNAL_SERVER_ERROR, ERR_BASE_UPDATE_NODE, "Exception while updating node", e)
    }
  }

  protected def toCaseClass[T: Manifest](node: Node)(implicit tag: TypeTag[T]): Response[T] = {
    try {
      Right(Neo4jWrapper.deSerialize[T](node))
    } catch {
      case e: Exception => {
        val id: String = if (node.hasProperty("uuid")) getUUID(node).toString else node.getId.toString
        fail(INTERNAL_SERVER_ERROR, ERR_BASE_CONVERT_NODE, "Exception while converting node " + id + " to " + tag.tpe, e)
      }
    }
  }

  protected def getSetResult(node: Node, newNode: Boolean, archived: Option[Long] = None, associated: Option[scala.List[Node]] = None): SetResult = {
    withTx {
      implicit neo4j =>
        val uuid =
          if (newNode)
            Some(UUIDUtils.getUUID(node.getProperty("uuid").asInstanceOf[String]))
          else None
        val created =
          if (newNode)
            Some(node.getProperty("created").asInstanceOf[Long])
          else
            None

        val idToUUIDList = {
          if (associated.isEmpty) None
          else {
            Some(associated.get.map(associatedNode => {
              IdToUUID(getUUID(associatedNode), associatedNode.getProperty("id").asInstanceOf[String])
            }))
          }
        }
        SetResult(uuid, created, node.getProperty("modified").asInstanceOf[Long], archived, idToUUIDList)
    }
  }

  def forceUUID(setResult: SetResult, uuid: Option[UUID], label: Label): Response[SetResult] = {
    if (uuid.isEmpty) Right(setResult)
    else {
      withTx {
        implicit neo4j =>
          val node = getNode(setResult.uuid.get, label)
          if (node.isLeft) Left(node.left.get)
          else {
            node.right.get.setProperty("uuid", UUIDUtils.getTrimmedBase64UUID(uuid.get))
            Right(SetResult(uuid, None, node.right.get.getProperty("modified").asInstanceOf[Long]))
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

  protected def getNodes(nodeUUIDList: scala.List[UUID], label: Label, acceptDeleted: Boolean = false, skipLabel: Option[Label] = None): Response[scala.List[Node]] = {
    val nodeList = nodeUUIDList map (uuid => {
      val nodeResponse = getNode(uuid, label, acceptDeleted)
      if (nodeResponse.isLeft) return Left(nodeResponse.left.get)
      else nodeResponse.right.get
    })

    if (skipLabel.isDefined) {
      Right(nodeList filter (node => {
        !node.hasLabel(skipLabel.get)
      }))
    } else {
      Right(nodeList)
    }
  }

  protected def getNodeOption(nodeUUID: Option[UUID], label: Label, acceptDeleted: Boolean = false): Response[Option[Node]] = {
    if (nodeUUID.isDefined) {
      val nodeResponse = getNode(nodeUUID.get, label, acceptDeleted)
      if (nodeResponse.isLeft) return Left(nodeResponse.left.get)
      else Right(Some(nodeResponse.right.get))
    } else Right(None)
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
          fail(INVALID_PARAMETER, ERR_BASE_NODE_LABEL_NOT_FOUND, label.labelName.toLowerCase() + " not found with given " + nodeProperty +
            (if (nodeStringValue.isDefined) ": " + nodeStringValue.get else ""))
        else if (nodeList.size > 1) {
          // Check if nodeList contains the same node multiple times
          if (nodeList.distinct.size() > 1) {
            // Print debug information
            if (nodeProperty == "uuid" && label.name == "REQUEST") {
              nodeList.foreach(node => {
                println("Invite request for " + node.getProperty("email").asInstanceOf[String]
                  + " has duplicate uuid "
                  + UUIDUtils.getUUID(node.getProperty("uuid").asInstanceOf[String])
                  + " with id " + node.getId())
              })
            }
            fail(INTERNAL_SERVER_ERROR, ERR_BASE_NODE_LABEL_MORE_THAN_1, "Ḿore than one " + label.labelName.toLowerCase() + " found with given " + nodeProperty +
              (if (nodeStringValue.isDefined) ": " + nodeStringValue.get else ""))
          } else {
            log.warning("Found " + nodeList.size + " duplicate values in index for " + label.labelName + ":" + nodeProperty)
            Right(nodeList(0))
          }
        } else {
          if (!acceptDeleted && nodeList(0).hasProperty("deleted")) {
            fail(INVALID_PARAMETER, ERR_BASE_NODE_LABEL_DELETED, label.labelName.toLowerCase() + " deleted with given " + nodeProperty +
              (if (nodeStringValue.isDefined) ": " + nodeStringValue.get else ""))
          } else {
            Right(nodeList(0))
          }
        }
    }
  }

  protected def getRelationship(first: Node, second: Node, relationshipType: RelationshipType*)(implicit neo4j: DatabaseService): Response[Option[Relationship]] = {
    val relationshipList = first.getRelationships(relationshipType: _*).toList
    var returnValue: Option[Relationship] = None
    relationshipList.foreach(relationship => {
      if (relationship.getEndNode() == second || relationship.getStartNode() == second) {
        if (returnValue.isDefined) {
          return fail(INTERNAL_SERVER_ERROR, ERR_BASE_NODE_REL_MORE_THAN_1, "More than one relationship of types " + relationshipType
            + " found between nodes " + getUUID(first)
            + " and " + getUUID(second))
        }
        returnValue = Some(relationship)
      }
    })
    Right(returnValue)
  }

  protected def getOwnerUUID(owner: Owner): UUID = {
    if (owner.foreignOwnerUUID.isDefined) owner.foreignOwnerUUID.get
    else owner.userUUID
  }

  protected def getOwnerNode(ownerNodes: OwnerNodes): Node = {
    if (ownerNodes.foreignOwner.isDefined) ownerNodes.foreignOwner.get
    else ownerNodes.user
  }

  protected def deleteItem(itemNode: Node)(implicit neo4j: DatabaseService): Long = {
    if (itemNode.hasProperty("deleted")) {
      itemNode.getProperty("deleted").asInstanceOf[Long]
    } else {
      val timestamp = System.currentTimeMillis()
      itemNode.setProperty("deleted", timestamp)
      timestamp
    }
  }

  protected def undeleteItem(itemNode: Node)(implicit neo4j: DatabaseService): Unit = {
    if (itemNode.hasProperty("deleted")) {
      itemNode.removeProperty("deleted")
    }
  }

  protected def getItemNode(owner: Owner, itemUUID: UUID, mandatoryLabel: Option[Label] = None,
    acceptDeleted: Boolean = false, exactLabelMatch: Boolean = true)(implicit neo4j: DatabaseService): Response[Node] = {
    val itemNode =
      if (mandatoryLabel.isDefined) getItemNode(getOwnerUUID(owner), itemUUID, mandatoryLabel.get, acceptDeleted)
      else getItemNode(getOwnerUUID(owner), itemUUID, MainLabel.ITEM, acceptDeleted)
    if (itemNode.isLeft) return itemNode

    // If searching for just ITEM, needs to fail for tasks and notes
    if (exactLabelMatch && mandatoryLabel.isEmpty &&
      (itemNode.right.get.hasLabel(ItemLabel.NOTE)
        || itemNode.right.get.hasLabel(ItemLabel.TASK)
        || itemNode.right.get.hasLabel(ItemLabel.LIST)
        || itemNode.right.get.hasLabel(ItemLabel.TAG))) {
      return fail(INVALID_PARAMETER, ERR_ITEM_ALREADY_EXTENDED, "item already either note, task, list or tag with UUID " + itemUUID)
    }
    itemNode
  }

  protected def getItemNode(ownerUUID: UUID, itemUUID: UUID, label: Label, acceptDeleted: Boolean)(implicit neo4j: DatabaseService): Response[Node] = {
    val itemsIndex = neo4j.gds.index().forNodes("items")
    val itemHits: IndexHits[Node] = itemsIndex.query("owner:\"" + UUIDUtils.getTrimmedBase64UUID(ownerUUID) + "\" AND item:\"" + UUIDUtils.getTrimmedBase64UUID(itemUUID) + "\"")

    if (itemHits.size == 0) {
      fail(INVALID_PARAMETER, ERR_ITEM_NOT_FOUND, "Could not find item " + itemUUID + " for owner " + ownerUUID)
    } else if (itemHits.size > 1) {
      fail(INTERNAL_SERVER_ERROR, ERR_ITEM_MORE_THAN_1, "More than one item found with item " + itemUUID + " and owner + " + ownerUUID)
    } else {
      val itemNode = itemHits.next
      if (!itemNode.hasLabel(label)) {
        fail(INVALID_PARAMETER, ERR_ITEM_NO_LABEL, "Item " + itemUUID + " does not have label " + label.labelName)
      } else if (!acceptDeleted && itemNode.hasProperty("deleted")) {
        fail(INVALID_PARAMETER, ERR_ITEM_DELETED, "Item " + itemUUID + " is deleted")
      } else {
        Right(itemNode)
      }
    }
  }

  protected def getDeleteItemResult(item: Node, deleted: Long, addUUID: Boolean = false): DeleteItemResult = {
    withTx {
      implicit neo4j =>
        DeleteItemResult(deleted, getSetResult(item, addUUID))
    }
  }

  protected def putInfoNode(info: Info): Response[Node] = {
    withTx {
      implicit neo4j =>
        val infoNodes = findNodesByLabel(MainLabel.INFO).toList
        if (infoNodes.size == 0){
          val infoNode = createNode(MainLabel.INFO)
          putInfoNodeValues(infoNode, info)
          Right(infoNode)
        }else if (infoNodes.size == 1){
          putInfoNodeValues(infoNodes(0), info)
          Right(infoNodes(0))
        }else {
          fail(INTERNAL_SERVER_ERROR, ERR_BASE_INFO_MORE_THAN_1, "More than one info node found.")
        }
    }
  }

  protected def putInfoNodeValues(infoNode: Node, info: Info)(implicit neo4j: DatabaseService): Unit = {
    // First remove missing keys
    infoNode.getPropertyKeys.foreach(property => {
      val versionInfo =
        if (info.frontend.isDefined)
          info.frontend.get.find({ versionInfo => versionInfo.platform == property })
        else None
      if (property != "created" && property != "modified" && property != "uuid" && versionInfo.isEmpty){
        infoNode.removeProperty(property)
      }
    })
    // Then set new keys
    if (info.frontend.isDefined){
      info.frontend.get.foreach(versionInfo => {
        infoNode.setProperty(versionInfo.platform, versionInfo.version)
      })
    }
  }
}