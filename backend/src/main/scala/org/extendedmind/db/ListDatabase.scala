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
import scala.collection.JavaConversions.iterableAsScalaIterable
import org.extendedmind.Response._
import org.extendedmind._
import org.extendedmind.domain._
import org.neo4j.graphdb.Direction
import org.neo4j.graphdb.RelationshipType
import org.neo4j.graphdb.Node
import org.neo4j.graphdb.traversal.Evaluators
import org.neo4j.graphdb.traversal.TraversalDescription
import org.neo4j.scala.DatabaseService
import scala.collection.mutable.ListBuffer
import org.neo4j.graphdb.traversal.Evaluation
import org.extendedmind.security.IdUtils

trait ListDatabase extends UserDatabase with TagDatabase {

  // PUBLIC

  def putNewList(owner: Owner, list: List): Response[SetResult] = {
    withTx {
      implicit neo =>
        for {
          // Don't set history tag of parent to list
          listResult <- putNewExtendedItem(owner, list, ItemLabel.LIST, skipParentHistoryTag = true).right
          unit <- Right(addToItemsIndex(owner, listResult._1, listResult._2)).right
        } yield listResult._2
    }
  }

  def putExistingList(owner: Owner, listUUID: UUID, list: List): Response[SetResult] = {
    withTx {
      implicit neo =>
        for {
          // Don't set history tag of parent to list
          listResult <- putExistingExtendedItem(owner, listUUID, list, ItemLabel.LIST, skipParentHistoryTag = true).right
          revision <- Right(evaluateListRevision(list, listResult._1, listResult._3)).right
          result <- Right(listResult._2.copy(revision = revision)).right
          unit <- Right(updateItemsIndex(listResult._1, result)).right
        } yield result
    }
  }

  def getList(owner: Owner, listUUID: UUID): Response[List] = {
    withTx {
      implicit neo =>
        for {
          listNode <- getItemNode(getOwnerUUID(owner), listUUID, Some(ItemLabel.LIST)).right
          list <- toCaseClass[List](listNode).right
          fullList <- addTransientListProperties(listNode, owner, list).right
        } yield fullList
    }
  }

  def deleteList(owner: Owner, listUUID: UUID): Response[DeleteItemResult] = {
    withTx {
      implicit neo =>
        for {
          listNode <- getItemNode(getOwnerUUID(owner), listUUID, Some(ItemLabel.LIST), acceptDeleted=true).right
          agreementNodes <- getListAgreementNodes(listNode).right
          unit <- validateListDeletable(listNode, agreementNodes).right
          deleted <- Right(deleteItem(listNode)).right
          childNodes <- Right(getChildren(listNode, None, true)).right
          childNodeResults <- Right(childNodes.map(childNode => setNodeModified(childNode, deleted.result.modified, skipOlderModified=true))).right
          unit <- Right(updateItemsIndex(listNode, deleted.result)).right
          unit <- Right(updateItemsIndex(childNodes, deleted.result)).right
        } yield deleted
    }
  }

  def undeleteList(owner: Owner, listUUID: UUID): Response[SetResult] = {
    withTx {
      implicit neo =>
        for {
          itemNode <- getItemNode(getOwnerUUID(owner), listUUID, Some(ItemLabel.LIST), acceptDeleted = true).right
          result <- Right(undeleteItem(itemNode)).right
          childNodes <- Right(getChildren(itemNode, None, true)).right
          childNodeResults <- Right(childNodes.map(childNode => setNodeModified(childNode, result.modified, skipOlderModified=true))).right
          unit <- Right(updateItemsIndex(itemNode, result)).right
          unit <- Right(updateItemsIndex(childNodes, result)).right
        } yield result
    }
  }

  def archiveList(owner: Owner, listUUID: UUID, parent: Option[UUID]): Response[ArchiveListResult] = {
    withTx {
      implicit neo =>
        for {
          listResult <- validateListArchivable(owner, listUUID, parent).right
          tagResult <- putNewTag(owner, Tag(listResult._2, None, None, HISTORY, None)).right
          archiveResult <- archiveListNode(listResult._1, listResult._4, tagResult.uuid.get, listResult._3).right
          setResults <- Right(updateItemsIndex(archiveResult._1)).right
          tag <- getTag(owner, tagResult.uuid.get).right
          unit <- Right(updateItemsIndex(listResult._1, archiveResult._3)).right
        } yield ArchiveListResult(archiveResult._2,
              setResults,
              tag,
              archiveResult._3)
    }
  }

  def unarchiveList(owner: Owner, listUUID: UUID, parent: Option[UUID]): Response[UnarchiveListResult] = {
    withTx {
      implicit neo =>
        for {
          listResult <- validateListUnarchivable(owner, listUUID, parent).right
          unarchiveResult <- unarchiveListNode(listResult._1, listResult._4, listResult._2, listResult._3).right
          unit <- Right(updateItemsIndex(listResult._2, unarchiveResult._3.result)).right
          setResults <- Right(updateItemsIndex(unarchiveResult._1)).right
          unit <- Right(updateItemsIndex(listResult._1, unarchiveResult._2)).right
        } yield UnarchiveListResult(setResults, unarchiveResult._3, unarchiveResult._2)
    }
  }

  def listToTask(owner: Owner, listUUID: UUID, list: List): Response[Task] = {
    withTx {
      implicit neo =>
        for {
          convertResult <- convertListToTask(owner, listUUID, list).right
          revision <- Right(evaluateTaskRevision(convertResult._3, convertResult._1, convertResult._4, force=true)).right
          unit <- Right(updateItemsIndex(convertResult._1, convertResult._2)).right
        } yield (convertResult._3.copy(revision = revision))
    }
  }

  def listToNote(owner: Owner, listUUID: UUID, list: List): Response[Note] = {
    withTx {
      implicit neo =>
        for {
          convertResult <- convertListToNote(owner, listUUID, list).right
          revision <- Right(evaluateNoteRevision(convertResult._3, convertResult._1, convertResult._4, force=true)).right
          unit <- Right(updateItemsIndex(convertResult._1, convertResult._2)).right
        } yield (convertResult._3.copy(revision = revision))
    }
  }

  // PRIVATE

  override def toList(listNode: Node, owner: Owner)(implicit neo4j: DatabaseService): Response[List] = {
    for {
      list <- toCaseClass[List](listNode).right
      completeList <- addTransientListProperties(listNode, owner, list).right
    } yield completeList
  }

  protected def addTransientListProperties(listNode: Node, owner: Owner, list: List)(implicit neo4j: DatabaseService): Response[List] = {
    for {
      ownerNodes <- getOwnerNodes(owner).right
      parentRel <- Right(getItemRelationship(listNode, ownerNodes, ItemRelationship.HAS_PARENT, ItemLabel.LIST)).right
      latestRevisionRel <- Right(getLatestExtendedItemRevisionRelationship(listNode)).right
      assigneeRel <- Right(getAssigneeRelationship(listNode)).right
      tagsRels <- getTagRelationships(listNode, ownerNodes).right
      agreementInfos <- getListAgreementInformations(ownerNodes, listNode).right
      task <- Right(list.copy(
        creator = getItemCreatorUUID(listNode),
        revision = latestRevisionRel.flatMap(latestRevisionRel => Some(latestRevisionRel.getEndNode.getProperty("number").asInstanceOf[Long])),
        relationships =
          (if (parentRel.isDefined || assigneeRel.isDefined || tagsRels.isDefined)
            Some(ExtendedItemRelationships(
              parent = parentRel.flatMap(parentRel => Some(getUUID(parentRel.getEndNode))),
              origin = None,
              assignee = assigneeRel.flatMap(assigneeRel => {
                if (ownerNodes.foreignOwner.isEmpty && getUUID(assigneeRel.getEndNode) == getUUID(ownerNodes.user)) None
                else Some(getUUID(assigneeRel.getEndNode))
              }),
              assigner = assigneeRel.flatMap(assigneeRel => Some(IdUtils.getUUID(assigneeRel.getProperty("assigner").asInstanceOf[String]))),
              tags = tagsRels.flatMap(tagsRels => if (tagsRels.ownerTags.isDefined) Some(getEndNodeUUIDList(tagsRels.ownerTags.get)) else None),
              collectiveTags = tagsRels.flatMap(tagsRels => getCollectiveTagEndNodeUUIDList(tagsRels.collectiveTags))))
          else None),
        visibility = {
          val listVisibilityResult = getListVisibility(agreementInfos, owner)
          if (listVisibilityResult.isLeft) return Left(listVisibilityResult.left.get)
          else listVisibilityResult.right.get
        }
      )).right
    } yield task
  }

  protected def validateListArchivable(owner: Owner, listUUID: UUID, parent: Option[UUID])(implicit neo4j: DatabaseService): Response[(Node, String, Option[Node], OwnerNodes)] = {
    for {
      ownerNodes <- getOwnerNodes(owner).right
      listNode <- getItemNode(getOwnerUUID(owner), listUUID, Some(ItemLabel.LIST)).right
      parentNode <- getNodeOption(parent, ItemLabel.LIST).right
      listNode <- validateListArchivable(listNode, parentNode).right
      listTitle <- Right(listNode.getProperty("title").asInstanceOf[String]).right
    } yield (listNode, listTitle, parentNode, ownerNodes)
  }

  protected def validateListArchivable(listNode: Node, parentNode: Option[Node])(implicit neo4j: DatabaseService): Response[Node] = {
    if (hasChildren(listNode, Some(ItemLabel.LIST))){
      fail(INVALID_PARAMETER, ERR_LIST_ARCHIVE_CHILDREN, "List " + getUUID(listNode) + " has child lists, can not archive")
    }else if (listNode.hasProperty("archived")){
      fail(INVALID_PARAMETER, ERR_LIST_ALREADY_ARCHIVED, "List " + getUUID(listNode) + " is already archived")
    }else if (parentNode.isDefined && !parentNode.get.hasProperty("archived")){
      fail(INVALID_PARAMETER, ERR_LIST_PARENT_NOT_ARCHIVED, "Parent list " + getUUID(parentNode.get) + " is not archived")
    }else{
      Right(listNode)
    }
  }

  protected def validateListUnarchivable(owner: Owner, listUUID: UUID, parent: Option[UUID])(implicit neo4j: DatabaseService): Response[(Node, Node, Option[Node], OwnerNodes)] = {
    for {
      ownerNodes <- getOwnerNodes(owner).right
      listNode <- getItemNode(getOwnerUUID(owner), listUUID, Some(ItemLabel.LIST)).right
      parentNode <- getNodeOption(parent, ItemLabel.LIST).right
      listNode <- validateListUnarchivable(listNode, parentNode).right
      historyTag <- getArchivedListHistoryTag(listNode).right
    } yield (listNode, historyTag, parentNode, ownerNodes)
  }

  protected def validateListUnarchivable(listNode: Node, parentNode: Option[Node])(implicit neo4j: DatabaseService): Response[Node] = {
    if (hasChildren(listNode, Some(ItemLabel.LIST))){
      fail(INVALID_PARAMETER, ERR_LIST_UNARCHIVE_CHILDREN, "List " + getUUID(listNode) + " has child lists, can not unarchive")
    }else if (!listNode.hasProperty("archived")){
      fail(INVALID_PARAMETER, ERR_LIST_NOT_ARCHIVED, "List " + getUUID(listNode) + " is not archived")
    }else if (parentNode.isDefined && parentNode.get.hasProperty("archived")){
      fail(INVALID_PARAMETER, ERR_LIST_PARENT_ARCHIVED, "Parent list " + getUUID(parentNode.get) + " is archived")
    }else{
      Right(listNode)
    }
  }

  protected def getArchivedListHistoryTag(listNode: Node)(implicit neo4j: DatabaseService): Response[Node] = {
    val historyTagTraversal = neo4j.gds.traversalDescription()
        .depthFirst()
        .relationships(RelationshipType.withName(ItemRelationship.HAS_TAG.name), Direction.OUTGOING)
        .evaluator(Evaluators.excludeStartPosition())
        .evaluator(PropertyEvaluator(
          MainLabel.ITEM, "deleted",
          foundEvaluation=Evaluation.EXCLUDE_AND_PRUNE,
          notFoundEvaluation=Evaluation.INCLUDE_AND_CONTINUE))
        .depthFirst()
        .evaluator(Evaluators.toDepth(1))
        .traverse(listNode)

    val historyTagList = historyTagTraversal.nodes().toList
    if (historyTagList.isEmpty || historyTagList.length == 0){
      fail(INTERNAL_SERVER_ERROR, ERR_LIST_NO_ACTIVE_HISTORY, "Archived list does not have an active history tag")
    } else if (historyTagList.length > 1){
      fail(INTERNAL_SERVER_ERROR, ERR_LIST_MORE_THAN_ONE_ACTIVE_HISTORY, "Archived list has more than one active history tag")
    }else{
      Right(historyTagList(0))
    }
  }

  protected def archiveListNode(listNode: Node, ownerNodes: OwnerNodes, tagUUID: UUID, parentNode: Option[Node])(implicit neo4j: DatabaseService): Response[(scala.List[Node], Long, SetResult)] = {
    val tagNodeResult = getItemNode(getOwnerUUID(ownerNodes), tagUUID, Some(ItemLabel.TAG))
    if (tagNodeResult.isLeft) fail(INTERNAL_SERVER_ERROR, ERR_LIST_MISSING_HISTORY_TAG, "Failed to find newly created history tag for list " + getUUID(listNode))
    else {
      // First: remove previous parent relationship
      val oldParentRelationship = getParentRelationship(listNode)
      if (oldParentRelationship.isDefined){
        deleteParentRelationship(oldParentRelationship.get)
      }

      // See if list gets archived timestamp from parent
      val archivedTimestampFromParent = {
        if (parentNode.isDefined){
          val archivedResult = createParentRelationship(listNode, ownerNodes, parentNode.get, skipParentHistoryTag = true)
          if (archivedResult.isLeft) return Left(archivedResult.left.get)
          archivedResult.right.get
        }else{
          None
        }
      }

      // Mark all as archived and add a history tag
      val tagNode = tagNodeResult.right.get
      val childNodes = getChildren(listNode, None, true)
      val archivedTimestamp =
        if (archivedTimestampFromParent.isDefined) archivedTimestampFromParent.get
        else System.currentTimeMillis
      val modifiedTimestamp = if (archivedTimestampFromParent.isDefined) System.currentTimeMillis else archivedTimestamp
      childNodes foreach (childNode => {
        childNode.setProperty("archived", archivedTimestamp)
        createTagRelationships(childNode, scala.List(tagNode))
        setNodeModified(childNode, modifiedTimestamp)
      })
      createTagRelationships(listNode, scala.List(tagNode))
      if (archivedTimestampFromParent.isEmpty)
        listNode.setProperty("archived", archivedTimestamp)
      Right((childNodes, archivedTimestamp, setNodeModified(listNode, modifiedTimestamp)))
    }
  }

  protected def unarchiveListNode(listNode: Node, ownerNodes: OwnerNodes, historyTag: Node, parentNode: Option[Node])(implicit neo4j: DatabaseService): Response[(scala.List[Node], SetResult, DeleteItemResult)] = {
    // First: remove previous parent relationship
    val oldParentRelationship = getParentRelationship(listNode)
    if (oldParentRelationship.isDefined){
      deleteParentRelationship(oldParentRelationship.get)
    }

    // Then, set new parent relationship
    if (parentNode.isDefined){
      val parentSetResult = createParentRelationship(listNode, ownerNodes, parentNode.get, skipParentHistoryTag = true)
      if (parentSetResult.isLeft) return Left(parentSetResult.left.get)
    }

    val childNodes = getChildren(listNode, None, true)
    val modifiedTimestamp = System.currentTimeMillis
    // Remove archived from all children and list node
    childNodes foreach (childNode => {
      childNode.removeProperty("archived")
      setNodeModified(childNode, modifiedTimestamp)
    })
    listNode.removeProperty("archived")
    // Mark the tag as deleted
    Right((childNodes, setNodeModified(listNode, modifiedTimestamp), deleteItem(historyTag)))
  }

  protected def validateListDeletable(listNode: Node, agreementNodes: Option[scala.List[Node]])(implicit neo4j: DatabaseService): Response[Unit] = {
    // Can't delete if list has child lists or agreements
    if (hasChildren(listNode, Some(ItemLabel.LIST)))
      fail(INVALID_PARAMETER, ERR_LIST_DELETE_CHILDREN, "can not delete list with child lists")
    else if (agreementNodes.isDefined)
      fail(INVALID_PARAMETER, ERR_LIST_DELETE_AGREEMENTS, "List " + getUUID(listNode) + " has agreements, can not delete")
    else
      Right()
  }

  protected def updateItemsIndex(itemNodes: scala.List[Node])(implicit neo4j: DatabaseService): Option[scala.List[SetResult]] = {
    if (itemNodes.isEmpty) {
      None
    } else {
      val itemsIndex = neo4j.gds.index().forNodes("items")
      Some(itemNodes map (itemNode => {
        val setResult = SetResult(
            Some(getUUID(itemNode)),
            None,
            itemNode.getProperty("modified").asInstanceOf[Long])
        updateModifiedIndex(itemsIndex, itemNode, setResult.modified)
        setResult
      }))
    }
  }

  protected def convertListToTask(owner: Owner, listUUID: UUID, list: List): Response[(Node, SetResult, Task, OwnerNodes)] = {
    withTx {
      implicit neo4j =>
        for {
          listResult <- putExistingExtendedItem(owner, listUUID, list, ItemLabel.LIST).right
          result <- validateListConvertable(listResult._1).right
          taskNode <- Right(setLabel(listResult._1, Some(MainLabel.ITEM), Some(ItemLabel.TASK), Some(scala.List(ItemLabel.LIST)))).right
          result <- Right(updateNodeModified(taskNode)).right
          task <- toTask(taskNode, owner).right
        } yield (taskNode, result, task, listResult._3)
    }
  }

  protected def convertListToNote(owner: Owner, listUUID: UUID, list: List): Response[(Node, SetResult, Note, OwnerNodes)] = {
    withTx {
      implicit neo4j =>
        for {
          listResult <- putExistingExtendedItem(owner, listUUID, list, ItemLabel.LIST).right
          result <- validateListConvertable(listResult._1).right
          noteNode <- Right(setLabel(listResult._1, Some(MainLabel.ITEM), Some(ItemLabel.NOTE), Some(scala.List(ItemLabel.LIST)))).right
          unit <- Right(moveDescriptionToContent(noteNode)).right
          result <- Right(updateNodeModified(noteNode)).right
          note <- toNote(noteNode, owner).right
        } yield (noteNode, result, note, listResult._3)
    }
  }

  protected def validateListConvertable(listNode: Node)(implicit neo4j: DatabaseService): Response[Unit] = {
    // Can't convert a list that has children
    if (hasChildren(listNode, None))
      fail(INVALID_PARAMETER, ERR_LIST_CONVERT_CHILDREN, "can not convert a list that has child items")
    else
      Right()
  }

  protected def getListAgreementInformations(ownerNodes: OwnerNodes, listNode: Node)(implicit neo4j: DatabaseService): Response[Option[scala.List[AgreementInformation]]] = {
    for {
      agreementNodes <- getListAgreementNodes(listNode).right
      userNode <- (if (agreementNodes.isDefined) getNodeOption(Some(getUUID(ownerNodes.user)), OwnerLabel.USER)
                   else Right(None)).right
      agreementInformations <- getListAgreementInformations(agreementNodes, userNode).right
    } yield agreementInformations
  }

  protected def getListAgreementNodes(listNode: Node)(implicit neo4j: DatabaseService): Response[Option[scala.List[Node]]] = {
    val agreementNodes = neo4j.gds.traversalDescription()
          .depthFirst()
          .relationships(RelationshipType.withName(AgreementRelationship.CONCERNING.name), Direction.INCOMING)
          .evaluator(Evaluators.excludeStartPosition())
          .evaluator(LabelEvaluator(scala.List(MainLabel.AGREEMENT)))
          .evaluator(Evaluators.toDepth(1))
          .traverse(listNode)
          .nodes.toList
    if (agreementNodes.size > 0){
      Right(Some(agreementNodes))
    }else{
      Right(None)
    }
  }

  protected def getListAgreementInformations(agreementNodes: Option[scala.List[Node]], userNode: Option[Node])(implicit neo4j: DatabaseService): Response[Option[scala.List[AgreementInformation]]] = {
    if (userNode.isEmpty || agreementNodes.isEmpty){
      Right(None)
    }else{
      val agreementInformations = agreementNodes.get.map(agreementNode => {
        val agreementInfoResult = getAgreementInformation(agreementNode, userNode.get, false)
        if (agreementInfoResult.isLeft) return Left(agreementInfoResult.left.get)
        else agreementInfoResult.right.get
      })
      Right(Some(agreementInformations))
    }
  }

  protected def getListVisibility(agreementInformations: Option[scala.List[AgreementInformation]], owner: Owner)(implicit neo4j: DatabaseService): Response[Option[SharedItemVisibility]] = {
    if (agreementInformations.isDefined){
      val agreements = agreementInformations.get.map(agreementInformation => {
        val agreement = toAgreement(agreementInformation, showProposedBy = owner.isLimitedAccess, skipCreatedAndModified = true)
        if (agreement.isLeft) return Left(agreement.left.get)
        else agreement.right.get
      })
      Right(Some(SharedItemVisibility(None, None, None, None, None, None, None, None, None, None, Some(agreements))))
    }else{
      Right(None)
    }
  }

  protected def evaluateListRevision(list: List, listNode: Node, ownerNodes: OwnerNodes, force: Boolean = false)(implicit neo4j: DatabaseService): Option[Long] = {
    evaluateNeedForRevision(list.revision, listNode, ownerNodes, force).flatMap(latestRevisionRel => {
      // Create a revision containing only the fields that can be set using putExistingNote, and the modified timestamp
      val listBytes = pickleList(getListForPickling(list))
      val revisionNode = createExtendedItemRevision(listNode, ownerNodes, ItemLabel.LIST, listBytes, latestRevisionRel)
      Some(revisionNode.getProperty("number").asInstanceOf[Long])
    })
  }

  private def getListForPickling(list: List): List = {
    // Create a revision containing only the fields that can be set using putExistingList
    list.copy(modified = None,
      archived = None,
      deleted = None,
      creator = None,
      revision = None,
      visibility = None,
      relationships =
        if (list.relationships.isDefined)
          Some(list.relationships.get.copy(
              assigner = None,
              origin = None))
        else None)
  }
}