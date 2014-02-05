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
      listNode <- putExistingListNode(owner, listUUID, list).right
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
      listNode <- validateListArchivable(owner, listUUID).right
      tagResult <- putNewTag(owner, Tag(listUUID.toString(), None, None, HISTORY, None)).right
      archivedChildren <- archiveListNode(listNode, owner, tagResult.uuid.get).right
      setResults <- Right(updateItemsIndex(archivedChildren)).right
      tag <- getTag(owner, tagResult.uuid.get).right
      result <- Right(getArchiveListResult(listNode, tag, setResults)).right
      unit <- Right(updateItemsIndex(listNode, result.result)).right
    } yield result
  }

  // PRIVATE

  protected def putExistingListNode(owner: Owner, listUUID: UUID, list: List): Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          itemNode <- getItemNode(owner, listUUID, exactLabelMatch = false).right
          wasTask <- validateListUpdatable(itemNode).right
          listNode <- Right(setLabel(itemNode, Some(MainLabel.ITEM), Some(ItemLabel.LIST), Some(scala.List(ItemLabel.TASK)))).right
          listNode <- updateNode(listNode, list).right
          parentNode <- setParentNode(listNode, owner, list).right
          tagNodes <- setTagNodes(listNode, owner, list).right
          completable <- setCompletable(listNode, wasTask).right
        } yield listNode
    }
  }

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

  protected def validateListUpdatable(itemNode: Node)(implicit neo4j: DatabaseService): Response[Boolean] = {
    if (itemNode.hasLabel(ItemLabel.TAG))
      fail(INVALID_PARAMETER, "Tag can not be updated to list, only task or item")
    else if (itemNode.hasLabel(ItemLabel.NOTE))
      fail(INVALID_PARAMETER, "Note can not be updated to list, only task or item")
    else if (itemNode.hasLabel(ItemLabel.TASK) && itemNode.hasProperty("completed"))
      fail(INVALID_PARAMETER, "Completed task can not be updated to list")
    else if (itemNode.hasLabel(ItemLabel.TASK) && (itemNode.hasProperty("reminder") || itemNode.hasProperty("repeating")))
      fail(INVALID_PARAMETER, "Repeating task or task with reminder can not be updated to list")
    else {
      if (itemNode.hasLabel(ItemLabel.TASK))
        Right(true)
      else
        Right(false)
    }
  }

  protected def setCompletable(itemNode: Node, wasTask: Boolean)(implicit neo4j: DatabaseService): Response[Boolean] = {
    if (itemNode.hasProperty("completable") && itemNode.getProperty("completable").asInstanceOf[Boolean]) {
      Right(true);
    } else if (wasTask) {
      // If a task is turned into a list, it is automatically completable
      itemNode.setProperty("completable", java.lang.Boolean.TRUE)
      Right(true);
    } else {
      Right(false)
    }
  }

  protected def validateListArchivable(owner: Owner, listUUID: UUID): Response[Node] = {
    withTx {
      implicit neo =>
        for {
          listNode <- getItemNode(owner, listUUID, Some(ItemLabel.LIST)).right
          listNode <- validateListArchivable(listNode).right
        } yield listNode
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
            val setResult = SetResult(Some(getUUID(itemNode)), itemNode.getProperty("modified").asInstanceOf[Long])
            updateModifiedIndex(itemsIndex, itemNode, setResult.modified)
            setResult
          }))
      }
    }
  }
}