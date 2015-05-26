/**
 * Copyright (c) 2013-2014 Extended Mind Technologies Oy
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
import org.neo4j.graphdb.DynamicRelationshipType
import org.neo4j.graphdb.Node
import org.neo4j.graphdb.traversal.Evaluators
import org.neo4j.graphdb.traversal.TraversalDescription
import org.neo4j.kernel.Traversal
import org.neo4j.scala.DatabaseService
import scala.collection.mutable.ListBuffer
import org.neo4j.graphdb.traversal.Evaluation

trait ListDatabase extends UserDatabase with TagDatabase {

  // PUBLIC

  def putNewList(owner: Owner, list: List): Response[SetResult] = {
    for {
      // Don't set history tag of parent to list      
      listResult <- putNewExtendedItem(owner, list, ItemLabel.LIST, skipParentHistoryTag = true).right
      result <- Right(getSetResult(listResult._1, true, listResult._2)).right
      unit <- Right(addToItemsIndex(owner, listResult._1, result)).right
    } yield result
  }

  def putExistingList(owner: Owner, listUUID: UUID, list: List): Response[SetResult] = {
    for {
      // Don't set history tag of parent to list
      listResult <- putExistingExtendedItem(owner, listUUID, list, ItemLabel.LIST, skipParentHistoryTag = true).right
      result <- Right(getSetResult(listResult._1, false, listResult._2)).right
      unit <- Right(updateItemsIndex(listResult._1, result)).right
    } yield result
  }

  def getList(owner: Owner, listUUID: UUID): Response[List] = {
    withTx {
      implicit neo =>
        for {
          listNode <- getItemNode(owner, listUUID, Some(ItemLabel.LIST)).right
          list <- toCaseClass[List](listNode).right
          fullList <- addTransientListProperties(listNode, owner, list).right
        } yield fullList
    }
  }

  def deleteList(owner: Owner, listUUID: UUID): Response[DeleteItemResult] = {
    for {
      listNode <- validateListDeletable(owner, listUUID).right
      deletedListNode <- deleteListNode(owner, listNode).right
      result <- Right(getDeleteItemResult(deletedListNode._1, deletedListNode._2)).right
      unit <- Right(updateItemsIndex(deletedListNode._1, result.result)).right
      unit <- Right(updateItemsIndex(deletedListNode._3, result.result)).right
    } yield result
  }
  
  def undeleteList(owner: Owner, listUUID: UUID): Response[SetResult] = {
    for {
      undeleteListResult <- undeleteListNode(owner, listUUID).right
      result <- Right(getSetResult(undeleteListResult._1, false)).right
      unit <- Right(updateItemsIndex(undeleteListResult._1, result)).right
      unit <- Right(updateItemsIndex(undeleteListResult._2, result)).right
    } yield result
  }

  def archiveList(owner: Owner, listUUID: UUID, parent: Option[UUID]): Response[ArchiveListResult] = {
    for {
      listResult <- validateListArchivable(owner, listUUID, parent).right
      tagResult <- putNewTag(owner, Tag(listResult._2,
                             None, None, HISTORY, None)).right
      archivedChildren <- archiveListNode(listResult._1, owner, tagResult.uuid.get, listResult._3).right
      setResults <- Right(updateItemsIndex(archivedChildren)).right
      tag <- getTag(owner, tagResult.uuid.get).right
      result <- Right(getArchiveListResult(listResult._1, tag, setResults)).right
      unit <- Right(updateItemsIndex(listResult._1, result.result)).right
    } yield result
  }
  
  def unarchiveList(owner: Owner, listUUID: UUID, parent: Option[UUID]): Response[UnarchiveListResult] = {
    for {
      listResult <- validateListUnarchivable(owner, listUUID, parent).right
      unarchiveResult <- unarchiveListNode(listResult._1, owner, listResult._2, listResult._3).right
      tagDeleteResult <- Right(getDeleteItemResult(listResult._2, unarchiveResult._2, true)).right
      unit <- Right(updateItemsIndex(listResult._2, tagDeleteResult.result)).right
      setResults <- Right(updateItemsIndex(unarchiveResult._1)).right
      result <- Right(UnarchiveListResult(setResults, tagDeleteResult, getSetResult(listResult._1, false))).right
      unit <- Right(updateItemsIndex(listResult._1, result.result)).right
    } yield result
  }

  def listToTask(owner: Owner, listUUID: UUID, list: List): Response[Task] = {
    for {
      convertResult <- convertListToTask(owner, listUUID, list).right
      result <- Right(getSetResult(convertResult._1, false)).right
      unit <- Right(updateItemsIndex(convertResult._1, result)).right
    } yield (convertResult._2.copy(modified = Some(result.modified)))
  }

  def listToNote(owner: Owner, listUUID: UUID, list: List): Response[Note] = {
    for {
      convertResult <- convertListToNote(owner, listUUID, list).right
      result <- Right(getSetResult(convertResult._1, false)).right
      unit <- Right(updateItemsIndex(convertResult._1, result)).right
    } yield (convertResult._2.copy(modified = Some(result.modified)))
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
      parentRelatioship <- Right(getItemRelationship(listNode, owner, ItemRelationship.HAS_PARENT, ItemLabel.LIST)).right
      tags <- getTagRelationships(listNode, owner).right
      agreementInfos <- getListAgreementInformations(owner, listNode).right
      task <- Right(list.copy(
        relationships =
          (if (parentRelatioship.isDefined || tags.isDefined)
            Some(ExtendedItemRelationships(
            parent = (if (parentRelatioship.isEmpty) None else (Some(getUUID(parentRelatioship.get.getEndNode())))),
            None,
            tags = (if (tags.isEmpty) None else (Some(getEndNodeUUIDList(tags.get))))))
          else None),
        visibility = {
          val listVisibilityResult = getListVisibility(agreementInfos, owner)
          if (listVisibilityResult.isLeft) return Left(listVisibilityResult.left.get)
          else listVisibilityResult.right.get
        }
      )).right
    } yield task
  }
  
  protected def validateListArchivable(owner: Owner, listUUID: UUID): Response[Node] = {
    withTx {
      implicit neo =>
        for {
          listNode <- getItemNode(owner, listUUID, Some(ItemLabel.LIST)).right
          parentNode <- getNodeOption(parent, ItemLabel.LIST).right
          listNode <- validateListArchivable(listNode, parentNode).right
          listTitle <- Right(listNode.getProperty("title").asInstanceOf[String]).right
        } yield (listNode, listTitle, parentNode)
    }
  }

  protected def validateListArchivable(owner: Owner, listUUID: UUID, parent: Option[UUID]): Response[(Node, String, Option[Node])] = {
    withTx {
      implicit neo =>
        for {
          listNode <- getItemNode(owner, listUUID, Some(ItemLabel.LIST)).right
          parentNode <- getNodeOption(parent, ItemLabel.LIST).right
          listNode <- validateListArchivable(listNode, parentNode).right
          listTitle <- Right(listNode.getProperty("title").asInstanceOf[String]).right
        } yield (listNode, listTitle, parentNode)
    }
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
  
  protected def validateListUnarchivable(owner: Owner, listUUID: UUID, parent: Option[UUID]): Response[(Node, Node, Option[Node])] = {
    withTx {
      implicit neo =>
        for {
          listNode <- getItemNode(owner, listUUID, Some(ItemLabel.LIST)).right
          parentNode <- getNodeOption(parent, ItemLabel.LIST).right
          listNode <- validateListUnarchivable(listNode, parentNode).right
          historyTag <- getArchivedListHistoryTag(listNode).right
        } yield (listNode, historyTag, parentNode)
    }
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
        .relationships(DynamicRelationshipType.withName(ItemRelationship.HAS_TAG.name), Direction.OUTGOING)
        .evaluator(Evaluators.excludeStartPosition())
        .evaluator(PropertyEvaluator(
          MainLabel.ITEM, "deleted",
          Evaluation.EXCLUDE_AND_PRUNE,
          Evaluation.INCLUDE_AND_CONTINUE))
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

  protected def archiveListNode(listNode: Node, owner: Owner, tagUUID: UUID, parentNode: Option[Node]): Response[scala.List[Node]] = {
    withTx {
      implicit neo =>
        val tagNodeResult = getItemNode(owner, tagUUID, Some(ItemLabel.TAG))
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
              val archivedResult = createParentRelationship(listNode, owner, parentNode.get, skipParentHistoryTag = true)
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
          childNodes foreach (childNode => {
            childNode.setProperty("archived", archivedTimestamp)
            createTagRelationships(childNode, scala.List(tagNode))
          })
          createTagRelationships(listNode, scala.List(tagNode))
          if (archivedTimestampFromParent.isEmpty)
            listNode.setProperty("archived", archivedTimestamp)
          Right(childNodes)
        }
    }
  }
  
  protected def unarchiveListNode(listNode: Node, owner: Owner, historyTag: Node, parentNode: Option[Node]): Response[(scala.List[Node], Long)] = {
    withTx {
      implicit neo4j =>
        // First: remove previous parent relationship
        val oldParentRelationship = getParentRelationship(listNode)
        if (oldParentRelationship.isDefined){
          deleteParentRelationship(oldParentRelationship.get)
        }
        
        // Then, set new parent relationship
        if (parentNode.isDefined){
          val parentSetResult = createParentRelationship(listNode, owner, parentNode.get, skipParentHistoryTag = true)
          if (parentSetResult.isLeft) return Left(parentSetResult.left.get)
        }

        val childNodes = getChildren(listNode, None, true)
        // Remove archived from all children and list node
        childNodes foreach (childNode => {
          childNode.removeProperty("archived")
        })
        listNode.removeProperty("archived")
        // Mark the tag as deleted
        Right(childNodes, deleteItem(historyTag))
    }
  }

  protected def getArchiveListResult(listNode: Node, tag: Tag, setResults: Option[scala.List[SetResult]]): ArchiveListResult = {
    withTx {
      implicit neo =>
        ArchiveListResult(listNode.getProperty("archived").asInstanceOf[Long],
          setResults,
          tag,
          getSetResult(listNode, false))
    }
  }

  protected def deleteListNode(owner: Owner, listUUID: UUID): Response[(Node, Long, scala.List[Node])] = {
    withTx {
      implicit neo =>
        for {
          itemNode <- getItemNode(owner, listUUID, Some(ItemLabel.LIST)).right
          deletable <- validateListDeletable(itemNode).right
          deleted <- Right(deleteItem(itemNode)).right
          childNodes <- Right(getChildren(itemNode, None, true)).right
        } yield (itemNode, deleted, childNodes)
    }
  }
  
  protected def undeleteListNode(owner: Owner, itemUUID: UUID): Response[(Node, scala.List[Node])] = {
    withTx {
      implicit neo =>
        for {
          itemNode <- getItemNode(owner, itemUUID, Some(ItemLabel.LIST), acceptDeleted = true).right
          success <- Right(undeleteItem(itemNode)).right
          childNodes <- Right(getChildren(itemNode, None, true)).right          
        } yield (itemNode, childNodes)
    }
  }

  protected def validateListDeletable(listNode: Node)(implicit neo4j: DatabaseService): Response[Boolean] = {
    // Can't delete if list has child lists
    if (hasChildren(listNode, Some(ItemLabel.LIST)))
      fail(INVALID_PARAMETER, ERR_LIST_DELETE_CHILDREN, "can not delete list with child lists")
    else
      Right(true)
  }

  protected def updateItemsIndex(itemNodes: scala.List[Node]): Option[scala.List[SetResult]] = {
    if (itemNodes.isEmpty) {
      None
    } else {
      withTx {
        implicit neo4j =>
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
  }

  protected def convertListToTask(owner: Owner, listUUID: UUID, list: List): Response[(Node, Task)] = {
    withTx {
      implicit neo4j =>
        for {
          listResult <- putExistingExtendedItem(owner, listUUID, list, ItemLabel.LIST).right
          result <- validateListConvertable(listResult._1).right
          taskNode <- Right(setLabel(listResult._1, Some(MainLabel.ITEM), Some(ItemLabel.TASK), Some(scala.List(ItemLabel.LIST)))).right
          task <- toTask(taskNode, owner).right
        } yield (taskNode, task)
    }
  }

  protected def convertListToNote(owner: Owner, listUUID: UUID, list: List): Response[(Node, Note)] = {
    withTx {
      implicit neo4j =>
        for {
          listResult <- putExistingExtendedItem(owner, listUUID, list, ItemLabel.LIST).right
          result <- validateListConvertable(listResult._1).right
          noteNode <- Right(setLabel(listResult._1, Some(MainLabel.ITEM), Some(ItemLabel.NOTE), Some(scala.List(ItemLabel.LIST)))).right
          result <- Right(moveDescriptionToContent(noteNode)).right
          note <- toNote(noteNode, owner).right
        } yield (noteNode, note)
    }
  }

  protected def validateListConvertable(listNode: Node)(implicit neo4j: DatabaseService): Response[Unit] = {
    // Can't convert a list that has children
    if (hasChildren(listNode, None))
      fail(INVALID_PARAMETER, ERR_LIST_CONVERT_CHILDREN, "can not convert a list that has child items")
    else
      Right()
  }
  
  protected def getListAgreementInformations(owner: Owner, listNode: Node)(implicit neo4j: DatabaseService): Response[Option[scala.List[AgreementInformation]]] = {
    for {
      agreementNodes <- getListAgreementNodes(listNode).right
      userNode <- (if (agreementNodes.isDefined) getNodeOption(Some(owner.userUUID), OwnerLabel.USER) 
                   else Right(None)).right
      agreementInformations <- getListAgreementInformations(agreementNodes, userNode).right
    } yield agreementInformations
  }

  protected def getListAgreementNodes(listNode: Node)(implicit neo4j: DatabaseService): Response[Option[scala.List[Node]]] = {
    val agreementNodes = neo4j.gds.traversalDescription()
          .depthFirst()
          .relationships(DynamicRelationshipType.withName(AgreementRelationship.CONCERNING.name), Direction.INCOMING)
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
        val agreementInfoResult = getAgreementInformation(agreementNode, userNode.get)
        if (agreementInfoResult.isLeft) return Left(agreementInfoResult.left.get)
        else agreementInfoResult.right.get
      })
      Right(Some(agreementInformations))
    }
  }

  protected def getListVisibility(agreementInformations: Option[scala.List[AgreementInformation]], owner: Owner)(implicit neo4j: DatabaseService): Response[Option[SharedItemVisibility]] = {
    if (agreementInformations.isDefined){
      val agreements = agreementInformations.get.map(agreementInformation => {
        val agreement = toAgreement(agreementInformation, showProposedBy = owner.isLimitedAccess)
        if (agreement.isLeft) return Left(agreement.left.get)
        else agreement.right.get
      })
      Right(Some(SharedItemVisibility(None, Some(agreements))))
    }else{
      Right(None)
    }
  }
}
