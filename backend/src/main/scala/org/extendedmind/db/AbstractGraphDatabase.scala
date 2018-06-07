/**
 * Copyright (c) 2013-2017 Extended Mind Technologies Oy
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
import org.neo4j.kernel._
import org.neo4j.scala._
import org.neo4j.graphdb.traversal._
import scala.collection.mutable.ListBuffer
import org.neo4j.graphdb.Relationship
import org.neo4j.graphdb.RelationshipType
import spray.util.LoggingContext
import scala.reflect.runtime.universe._
import java.lang.Boolean
import akka.event.LoggingAdapter
import org.neo4j.index.lucene.QueryContext
import org.neo4j.extension.timestamp.TimestampCustomPropertyHandler
import org.neo4j.graphdb.index.IndexHits
import org.neo4j.graphdb.event.TransactionEventHandler
import org.neo4j.extension.uuid.UUIDTransactionEventHandler
import org.neo4j.extension.timestamp.TimestampTransactionEventHandler
import scala.collection.mutable.HashMap
import com.vdurmont.semver4j.Semver
import com.vdurmont.semver4j.Semver.SemverType
import java.time.format.DateTimeFormatter
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.ZoneOffset

case class OwnerNodes(user: Node, foreignOwner: Option[Node])

abstract class AbstractGraphDatabase extends Neo4jWrapper {

  // IMPLICITS

  // Settings
  def settings: Settings
  implicit val implSettings = settings

  // Implicit Neo4j Scala wrapper serialization exclusions
  implicit val serializeExclusions: Option[scala.List[String]] = Some(
    // Always exclude the direct setting of the following:
    scala.List("uuid", "created", "modified", "deleted", // Container
      "creator", // ItemLike
      "visibility", // ShareableItem
      "relationships", "revision", // ExtendedItem
      "completed", "reminders", // Task
      "favorited", // Note
      "archived", // List
      "parent", "tagType", // Tag
      "targetItem", "proposedBy", "proposedTo", "accepted" // Agreement
      ))
  // Implicit Neo4j Scala wrapper converters
  implicit val customConverters: Option[Map[String, AnyRef => AnyRef]] =
    // Convert trimmed Base64 UUID to java.util.UUID
    Some(Map("uuid" -> (uuid => Some(IdUtils.getUUID(uuid.asInstanceOf[String])))))

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
      // For some of our item relationships, the end node should not be updated when a new relationship is created
      val skipEndNodeUpdateOnNewRelationshipsFor = new java.util.ArrayList[RelationshipType](2)
      skipEndNodeUpdateOnNewRelationshipsFor.add(ItemRelationship.HAS_TAG)
      skipEndNodeUpdateOnNewRelationshipsFor.add(ItemRelationship.HAS_PARENT)
      val addCreatedTimestampToNewNodes = true
      eventHandlers.add(new TimestampTransactionEventHandler(
          addCreatedTimestampToNewNodes,
          skipEndNodeUpdateOnNewRelationshipsFor,
          customPropertyHandlers));
    }
    eventHandlers
  }

  // LOAD DATABASE TO MEMORY

  sealed abstract class DatabaseStatus
  case object DB_READY extends DatabaseStatus
  case object DB_NEW_SLAVE extends DatabaseStatus
  case object DB_ERROR extends DatabaseStatus

  def loadDatabase()(implicit log: LoggingAdapter): Boolean = {
    initializeDatabase(transactionEventHandlers(), None, None, None)._1 match {
      case DB_READY => {
        withTx {
          implicit neo4j =>
            val statistics = getStatisticsInTx
            log.info("users: " + statistics.users +
              ", items: " + statistics.items +
              ", common collective " + statistics.commonCollective._1 + ": " + statistics.commonCollective._2)
        }
        true
      }
      case DB_NEW_SLAVE => true
      case DB_ERROR => false
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
    val userCountResult = neo4j.gds.execute("start n=node(*) match (n:USER) return count(n) as userCount").next()
    // Use index to get items
    val itemCount = neo4j.gds.index().forNodes("items").query("*:*").size()
    val collectiveNode = getCommonCollectiveNode

    Statistics(userCountResult.get("userCount").asInstanceOf[Long],
               itemCount,
               (getUUID(collectiveNode), collectiveNode.getProperty("title").asInstanceOf[String]))
  }

  def getInfo(latest: Boolean, history: Boolean): Response[Info] = {
    withTx {
      implicit neo4j =>
        val infoNode = getInfoNode
        val commonCollectiveNode =
          infoNode.getRelationships().find(relationship => relationship.getEndNode.hasLabel(OwnerLabel.COLLECTIVE)).get.getEndNode

        val commonCollectiveInfo = (getUUID(commonCollectiveNode), commonCollectiveNode.getProperty("title").asInstanceOf[String])
        if (!latest && !history){
          Right(Info(commonCollectiveInfo, settings.version.getValue, settings.build, infoNode.getProperty("created").asInstanceOf[Long], settings.ui, None))
        }else{
          val versions = infoNode.getRelationships().filter(relationship => {
            relationship.getEndNode.hasLabel(MainLabel.VERSION)
          }).map(versionRel => versionRel.getEndNode)
          val latestVersionNodeByPlatform = new HashMap[String, (Node, Semver)]
          val allVersionNodes = new ListBuffer[(String, Node, Semver)]
          versions.foreach(versionNode => {
            val platform = versionNode.getProperty("platform").asInstanceOf[String]
            val version = new Semver(versionNode.getProperty("version").asInstanceOf[String], SemverType.LOOSE)
            if (!latest || !history){
              if (latestVersionNodeByPlatform.isDefinedAt(platform)){
                if (version.isGreaterThan(latestVersionNodeByPlatform.get(platform).get._2)){
                  // This is a greater version value, change it
                  latestVersionNodeByPlatform.put(platform, (versionNode, version))
                }
              }else{
                latestVersionNodeByPlatform.put(platform, (versionNode, version))
              }
            }
            allVersionNodes.append((platform, versionNode, version))
          })
          // Now filter out the rest
          val versionInfos: scala.List[VersionInfo] =
            if (latest && !history){
              latestVersionNodeByPlatform.map(latestMapInfo =>
                VersionInfo(
                  latestMapInfo._1,
                  getPlatformVersionInfo(latestMapInfo._2._1, latestMapInfo._2._2, squirrel = false).get)
                ).toList
            }else{
              allVersionNodes.map(versionInfo => {
                VersionInfo(
                  versionInfo._1,
                  getPlatformVersionInfo(versionInfo._2, versionInfo._3, squirrel = false).get)
              }).toList
            }
          Right(Info(commonCollectiveInfo, settings.version.getValue, settings.build, infoNode.getProperty("created").asInstanceOf[Long], settings.ui, Some(versionInfos)))
        }
    }
  }

  def putVersion(platform: String, versionInfo: PlatformVersionInfo): Response[SetResult] = {
    for {
      result <- putVersionNode(platform, versionInfo).right
    } yield result._2
  }

  def getUpdateVersion(platform: String, version: String, userType: Option[Byte]): Response[Option[PlatformVersionInfo]] = {
    val previousVersion = new Semver(version, SemverType.LOOSE)
    withTx {
      implicit neo4j =>
        val infoNode = getInfoNode
        val platformVersionRelationships = infoNode.getRelationships().filter(relationship => {
          val versionNode = relationship.getEndNode
          versionNode.hasLabel(MainLabel.VERSION) &&
          versionNode.getProperty("platform").asInstanceOf[String] == platform &&
          (!versionNode.hasProperty("userType") ||
            (userType.isDefined && userType.get <= versionNode.getProperty("userType").asInstanceOf[Byte]))
        })
        val latestVersionInfo = if (platformVersionRelationships.size > 0){
          val latestVersionRelationship = platformVersionRelationships.reduceLeft((rel1, rel2) => {
            if (new Semver(rel1.getEndNode.getProperty("version").asInstanceOf[String], SemverType.LOOSE).isGreaterThan(
                new Semver(rel2.getEndNode.getProperty("version").asInstanceOf[String], SemverType.LOOSE)))
              rel1
            else
              rel2
          })
          val latestVersionNode = latestVersionRelationship.getEndNode
          val latestVersion = new Semver(latestVersionNode.getProperty("version").asInstanceOf[String], SemverType.LOOSE)
          if (latestVersion.isGreaterThan(previousVersion))
            getPlatformVersionInfo(latestVersionNode, latestVersion, squirrel = true)
          else
            None
        }else{
          None
        }
        Right(latestVersionInfo)
    }
  }

  // ID GENERATION

  def generateShortId(implicit neo4j: DatabaseService): Long = {
    val idNodes = findNodesByLabel(MainLabel.ID).toList
    val idNode = {
      if (idNodes.size == 0){
        val idNode = createNode(MainLabel.ID)
        // Set value to start from first three digit value "021", by setting this to 579,
        // which translates to 9Z. Values 579 and below are reserved for internal use,
        // and can be set by the admin.
        idNode.setProperty("value", 579l)
        idNode
      }else{
        idNodes(0)
      }
    }
    val newShortId: Long = idNode.getProperty("value").asInstanceOf[Long] + 1
    idNode.setProperty("value", newShortId)
    newShortId
  }

  // NODE PROPERTIES

  protected def setNodeProperty(node: Node, key: String, stringValue: Option[String], longValue: Option[Long]): SetResult = {
    withTx {
      implicit neo4j =>
        if (stringValue.isDefined){
          node.setProperty(key, stringValue.get)
        }else if (longValue.isDefined){
          node.setProperty(key, longValue.get)
        }else if (node.hasProperty(key)){
          node.removeProperty(key)
        }
        updateNodeModified(node)
    }
  }


  // CONVERSION

  protected def updateNode(node: Node, caseClass: AnyRef)(implicit neo4j: DatabaseService): Response[(Node, SetResult)] = {
    try {
      val updatedNode: Node = Neo4jWrapper.serialize[Node](caseClass, node)
      Right(updatedNode, updateNodeModified(updatedNode))
    } catch {
      case e: Exception => fail(INTERNAL_SERVER_ERROR, ERR_BASE_UPDATE_NODE, "Exception while updating node", e)
    }
  }

  protected def updateNodeModified(node: Node)(implicit neo4j: DatabaseService): SetResult = {
    val timestamp: Long = System.currentTimeMillis()
    node.setProperty("modified", timestamp)
    SetResult(None, None, timestamp)
  }

  protected def setNodeCreated(node: Node)(implicit neo4j: DatabaseService): SetResult = {
      // Set UUID
    val uuid: UUID = UUID.randomUUID()
    node.setProperty("uuid", IdUtils.getTrimmedBase64UUID(uuid))

    // Set created and modified to same value
    val timestamp: Long = System.currentTimeMillis()
    node.setProperty("created", timestamp)
    node.setProperty("modified", timestamp)
    SetResult(Some(uuid), Some(timestamp), timestamp)
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

  protected def getIdToUuids(associated: Option[scala.List[Node]]): Option[scala.List[IdToUUID]] = {
    withTx {
      implicit neo4j =>
        if (associated.isEmpty) None
        else {
          Some(associated.get.map(associatedNode => {
            IdToUUID(getUUID(associatedNode), associatedNode.getProperty("id").asInstanceOf[String])
          }))
        }
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
            node.right.get.setProperty("uuid", IdUtils.getTrimmedBase64UUID(uuid.get))
            Right(SetResult(uuid, None, node.right.get.getProperty("modified").asInstanceOf[Long]))
          }
      }
    }
  }

  protected def getUUID(node: Node): UUID = {
    IdUtils.getUUID(node.getProperty("uuid").asInstanceOf[String])
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
    val uuidString = IdUtils.getTrimmedBase64UUID(nodeUUID)
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
                  + IdUtils.getUUID(node.getProperty("uuid").asInstanceOf[String])
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

  protected def getNodeOption(nodeProperty: String, nodeValue: AnyRef, label: Label,
    nodeStringValue: Option[String], acceptDeleted: Boolean)(implicit neo4j: DatabaseService): Response[Option[Node]] = {
    val nodeList = findNodesByLabelAndProperty(label, nodeProperty, nodeValue).toList
    if (nodeList.isEmpty){
      Right(None)
    }else if (nodeList.size > 1) {
      fail(INTERNAL_SERVER_ERROR, ERR_BASE_NODE_LABEL_MORE_THAN_1, "Ḿore than one " + label.labelName.toLowerCase() + " found with given " + nodeProperty +
        (if (nodeStringValue.isDefined) ": " + nodeStringValue.get else ""))
    } else {
      if (!acceptDeleted && nodeList(0).hasProperty("deleted")) {
        Right(None)
      } else {
        Right(Some(nodeList(0)))
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

  protected def getOwnerUUID(ownerNodes: OwnerNodes): UUID = {
    getUUID(getOwnerNode(ownerNodes))
  }

  protected def getOwnerNode(ownerNodes: OwnerNodes): Node = {
    if (ownerNodes.foreignOwner.isDefined) ownerNodes.foreignOwner.get
    else ownerNodes.user
  }

  protected def deleteItem(itemNode: Node)(implicit neo4j: DatabaseService): DeleteItemResult = {
    val result = updateNodeModified(itemNode)
    if (itemNode.hasProperty("deleted")) {
      DeleteItemResult(itemNode.getProperty("deleted").asInstanceOf[Long], result)
    } else {
      itemNode.setProperty("deleted", result.modified)
      DeleteItemResult(result.modified, result)
    }
  }

  protected def undeleteItem(itemNode: Node)(implicit neo4j: DatabaseService): SetResult = {
    if (itemNode.hasProperty("deleted")) {
      itemNode.removeProperty("deleted")
    }
    updateNodeModified(itemNode)
  }

  protected def getItemNode(ownerUUID: UUID, itemUUID: UUID, mandatoryLabel: Option[Label] = None,
    acceptDeleted: Boolean = false, exactLabelMatch: Boolean = true)(implicit neo4j: DatabaseService): Response[Node] = {
    val itemNode =
      if (mandatoryLabel.isDefined) getItemNode(ownerUUID, itemUUID, mandatoryLabel.get, acceptDeleted)
      else getItemNode(ownerUUID, itemUUID, MainLabel.ITEM, acceptDeleted)
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

  protected def getItemNodeList(ownerUUID: UUID, itemUUIDList: scala.List[UUID], mandatoryLabel: Option[Label] = None,
    acceptDeleted: Boolean = false, exactLabelMatch: Boolean = true)(implicit neo4j: DatabaseService): Response[scala.List[Node]] = {

    Right(itemUUIDList.map(itemUUID => {
      val itemNodeResult = getItemNode(ownerUUID, itemUUID, mandatoryLabel, acceptDeleted, exactLabelMatch)
      if (itemNodeResult.isLeft) return Left(itemNodeResult.left.get)
      itemNodeResult.right.get
    }))
  }

  protected def getItemNode(ownerUUID: UUID, itemUUID: UUID, label: Label, acceptDeleted: Boolean)(implicit neo4j: DatabaseService): Response[Node] = {
    val itemsIndex = neo4j.gds.index().forNodes("items")
    val itemHits: IndexHits[Node] = itemsIndex.query("owner:\"" + IdUtils.getTrimmedBase64UUIDForLucene(ownerUUID) + "\" AND item:\"" + IdUtils.getTrimmedBase64UUIDForLucene(itemUUID) + "\"")

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

  protected def initializeDatabase(
                   transactionEventHandlers: java.util.ArrayList[TransactionEventHandler[_]],
                   overrideCommonCollective: Option[Collective] = None,
                   overrideAdminUser: Option[User] = None,
                   overrideAdminUserPassword: Option[String] = None): (DatabaseStatus, Option[UUID], Option[UUID])

  protected def putVersionNode(platform: String, versionInfo: PlatformVersionInfo): Response[(Node, SetResult)] = {
    withTx {
      implicit neo4j =>
        val infoNode = getInfoNode
        val previousVersionNode = infoNode.getRelationships().find(relationship => {
          relationship.getEndNode.hasLabel(MainLabel.VERSION) &&
          relationship.getEndNode.getProperty("platform").asInstanceOf[String] == platform &&
          relationship.getEndNode.getProperty("version").asInstanceOf[String] == versionInfo.version
        }).flatMap(versionRel => Some(versionRel.getEndNode))

        Right(previousVersionNode.fold({
          val versionNode = createNode(MainLabel.VERSION)
          val result = setVersionNodeProperties(versionNode, platform, versionInfo)
          infoNode --> SecurityRelationship.IS_ORIGIN --> versionNode;
          (versionNode, result)
        })(previousVersionNode => {
          val result = setVersionNodeProperties(previousVersionNode, platform, versionInfo)
          (previousVersionNode, result)
        }))
    }
  }

  protected def setVersionNodeProperties(versionNode: Node, platform: String, versionInfo: PlatformVersionInfo)(implicit neo4j: DatabaseService): SetResult = {
    versionNode.setProperty("platform", platform)
    versionNode.setProperty("version", versionInfo.version)
    if (versionInfo.userType.isDefined)
      versionNode.setProperty("userType", versionInfo.userType.get)
    else if (versionNode.hasProperty("userType"))
      versionNode.removeProperty("userType")
    if (versionInfo.updateUrl.isDefined) versionNode.setProperty("updateUrl", versionInfo.updateUrl.get)
    if (versionInfo.fullUrl.isDefined) versionNode.setProperty("fullUrl", versionInfo.fullUrl.get)
    if (versionInfo.notes.isDefined)
      versionNode.setProperty("notes", versionInfo.notes.get)
    else if (versionNode.hasProperty("notes"))
      versionNode.removeProperty("notes")
    if (versionInfo.name.isDefined)
      versionNode.setProperty("name", versionInfo.name.get)
    else if (versionNode.hasProperty("name"))
      versionNode.removeProperty("name")
    updateNodeModified(versionNode)
  }

  val dateTimeFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern( "yyyy-MM-dd'T'HH:mm:ss" );

  protected def getPlatformVersionInfo(versionNode: Node, version: Semver, squirrel: Boolean)(implicit neo4j: DatabaseService): Option[PlatformVersionInfo] = {
    if (squirrel && !versionNode.hasProperty("updateUrl")){
      None
    }else{
      val url = if (squirrel) Some(versionNode.getProperty("updateUrl").asInstanceOf[String]) else None
      val name = if (versionNode.hasProperty("name")) Some(versionNode.getProperty("name").asInstanceOf[String])
                 else if (squirrel) Some(version.getValue)
                 else None
      val notes = if (versionNode.hasProperty("notes")) Some(versionNode.getProperty("notes").asInstanceOf[String]) else None
      val updateUrl = if (versionNode.hasProperty("updateUrl") && !squirrel) Some(versionNode.getProperty("updateUrl").asInstanceOf[String]) else None
      val fullUrl = if (!squirrel && versionNode.hasProperty("fullUrl")) Some(versionNode.getProperty("fullUrl").asInstanceOf[String]) else None
      val userType = if (!squirrel && versionNode.hasProperty("userType")) Some(versionNode.getProperty("userType").asInstanceOf[Byte]) else None
      val modified = versionNode.getProperty("modified").asInstanceOf[Long]
      val pubDate: LocalDateTime = LocalDateTime.ofInstant(Instant.ofEpochMilli(modified), ZoneOffset.UTC);
      val pubDateString = dateTimeFormatter.format(pubDate)
      Some(PlatformVersionInfo(url, name, notes, Some(pubDateString), version.getValue, userType, updateUrl, fullUrl))
    }
  }

  protected def getCommonCollectiveUUID()(implicit neo4j: DatabaseService): UUID = {
    getUUID(getCommonCollectiveNode())
  }

  protected def getCommonCollectiveNode()(implicit neo4j: DatabaseService): Node = {
    getInfoNode.getRelationships().find(relationship => relationship.getEndNode.hasLabel(OwnerLabel.COLLECTIVE)).get.getEndNode
  }

  protected def getInfoNode(implicit neo4j: DatabaseService): Node = {
    findNodesByLabel(MainLabel.INFO).toList(0)
  }
}
