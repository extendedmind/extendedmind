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

trait ListDatabase extends AbstractGraphDatabase with TagDatabase {

  // PUBLIC

  def putNewList(owner: Owner, list: List): Response[SetResult] = {
    for {
      listNode <- putNewExtendedItem(owner, list, ItemLabel.LIST).right
      result <- Right(getSetResult(listNode, true)).right
      unit <- Right(addToItemsIndex(owner, listNode, result)).right
    } yield result
  }

  def putExistingList(owner: Owner, listUUID: UUID, list: List): Response[SetResult] = {
    for {
      listNode <- putExistingExtendedItem(owner, listUUID, list, ItemLabel.LIST).right
      result <- Right(getSetResult(listNode, false)).right
      unit <- Right(updateItemsIndex(listNode, result)).right
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
      deletedListNode <- deleteListNode(owner, listUUID).right
      result <- Right(getDeleteItemResult(deletedListNode._1, deletedListNode._2)).right
      unit <- Right(updateItemsIndex(deletedListNode._1, result.result)).right
    } yield result
  }

  def archiveList(owner: Owner, listUUID: UUID): Response[ArchiveListResult] = {
    for {
      listResult <- validateListArchivable(owner, listUUID).right
      tagResult <- putNewTag(owner, Tag(listResult._2,
                             None, None, HISTORY, None)).right
      archivedChildren <- archiveListNode(listResult._1, owner, tagResult.uuid.get).right
      setResults <- Right(updateItemsIndex(archivedChildren)).right
      tag <- getTag(owner, tagResult.uuid.get).right
      result <- Right(getArchiveListResult(listResult._1, tag, setResults)).right
      unit <- Right(updateItemsIndex(listResult._1, result.result)).right
    } yield result
  }

  def listToTask(owner: Owner, listUUID: UUID, list: List): Response[Task] = {
    for {
      convertResult <- convertListToTask(owner, listUUID, list).right
      result <- Right(getSetResult(convertResult._1, false)).right
      unit <- Right(updateItemsIndex(convertResult._1, result)).right
    } yield convertResult._2
  }

  def listToNote(owner: Owner, listUUID: UUID, list: List): Response[Note] = {
    for {
      convertResult <- convertListToNote(owner, listUUID, list).right
      result <- Right(getSetResult(convertResult._1, false)).right
      unit <- Right(updateItemsIndex(convertResult._1, result)).right
    } yield convertResult._2
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
      parent <- getItemRelationship(listNode, owner, ItemRelationship.HAS_PARENT, ItemLabel.LIST).right
      tags <- getTagRelationships(listNode, owner).right
      task <- Right(list.copy(
        relationships =
          (if (parent.isDefined || tags.isDefined)
            Some(ExtendedItemRelationships(
            parent = (if (parent.isEmpty) None else (Some(getUUID(parent.get.getEndNode())))),
            None,
            tags = (if (tags.isEmpty) None else (Some(getEndNodeUUIDList(tags.get))))))
          else None))).right
    } yield task
  }

  protected def validateListArchivable(owner: Owner, listUUID: UUID): Response[(Node, String)] = {
    withTx {
      implicit neo =>
        for {
          listNode <- getItemNode(owner, listUUID, Some(ItemLabel.LIST)).right
          listNode <- validateListArchivable(listNode).right
          listTitle <- Right(listNode.getProperty("title").asInstanceOf[String]).right
        } yield (listNode, listTitle)
    }
  }

  protected def validateListArchivable(listNode: Node)(implicit neo4j: DatabaseService): Response[Node] = {
    if (hasChildren(listNode, Some(ItemLabel.LIST)))
      fail(INVALID_PARAMETER, "List " + getUUID(listNode) + " has child lists, can not archive")
    else
      Right(listNode)
  }

  protected def archiveListNode(listNode: Node, owner: Owner, tagUUID: UUID): Response[scala.List[Node]] = {
    withTx {
      implicit neo =>
        val tagNodeResult = getItemNode(owner, tagUUID, Some(ItemLabel.TAG))
        if (tagNodeResult.isLeft) fail(INTERNAL_SERVER_ERROR, "Failed to find newly created history tag for list " + getUUID(listNode))
        else {
          val tagNode = tagNodeResult.right.get
          val childNodes = getChildren(listNode, None, true)
          // Mark all as archived and add a history tag
          val currentTime = System.currentTimeMillis()
          childNodes foreach (childNode => {
            childNode.setProperty("archived", currentTime)
            createTagRelationships(childNode, scala.List(tagNode))
          })
          createTagRelationships(listNode, scala.List(tagNode))
          listNode.setProperty("archived", currentTime)
          Right(childNodes)
        }
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

  protected def deleteListNode(owner: Owner, listUUID: UUID): Response[Tuple2[Node, Long]] = {
    withTx {
      implicit neo =>
        for {
          itemNode <- getItemNode(owner, listUUID, Some(ItemLabel.LIST)).right
          deletable <- validateListDeletable(itemNode).right
          deleted <- Right(deleteItem(itemNode)).right
        } yield (itemNode, deleted)
    }
  }

  protected def validateListDeletable(listNode: Node)(implicit neo4j: DatabaseService): Response[Boolean] = {
    // Can't delete if list has child lists
    if (hasChildren(listNode, Some(ItemLabel.LIST)))
      fail(INVALID_PARAMETER, "can not delete list with child lists")
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
                Some(itemNode.getProperty("created").asInstanceOf[Long]),
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
          listNode <- putExistingExtendedItem(owner, listUUID, list, ItemLabel.LIST).right
          result <- validateListConvertable(listNode).right
          taskNode <- Right(setLabel(listNode, Some(MainLabel.ITEM), Some(ItemLabel.TASK), Some(scala.List(ItemLabel.LIST)))).right
          task <- toTask(taskNode, owner).right
        } yield (taskNode, task)
    }
  }

  protected def convertListToNote(owner: Owner, listUUID: UUID, list: List): Response[(Node, Note)] = {
    withTx {
      implicit neo4j =>
        for {
          listNode <- putExistingExtendedItem(owner, listUUID, list, ItemLabel.LIST).right
          result <- validateListConvertable(listNode).right
          noteNode <- Right(setLabel(listNode, Some(MainLabel.ITEM), Some(ItemLabel.NOTE), Some(scala.List(ItemLabel.LIST)))).right
          result <- Right(moveDescriptionToContent(noteNode)).right
          note <- toNote(noteNode, owner).right
        } yield (noteNode, note)
    }
  }

  protected def validateListConvertable(listNode: Node)(implicit neo4j: DatabaseService): Response[Unit] = {
    // Can't convert a list that has children
    if (hasChildren(listNode, None))
      fail(INVALID_PARAMETER, "can not convert a list that has child items")
    else
      Right()
  }

}
