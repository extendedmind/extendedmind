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

trait ListDatabase extends AbstractGraphDatabase with ItemDatabase {

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
  /*
  
  def completeTask(owner: Owner, taskUUID: UUID): Response[CompleteTaskResult] = {
    for {
      taskNode <- completeTaskNode(owner, taskUUID).right
      result <- Right(getCompleteTaskResult(taskNode)).right
      unit <- Right(updateItemsIndex(taskNode, result.result)).right
    } yield result
  }
  
  def uncompleteTask(owner: Owner, taskUUID: UUID): Response[SetResult] = {
    for {
      taskNode <- uncompleteTaskNode(owner, taskUUID).right
      result <- Right(getSetResult(taskNode, false)).right
      unit <- Right(updateItemsIndex(taskNode, result)).right
    } yield result
  }
*/
  // PRIVATE

  protected def putExistingListNode(owner: Owner, listUUID: UUID, list: List): Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          itemNode <- getItemNode(owner, listUUID, exactLabelMatch = false).right
          updatable <- validateListUpdatable(itemNode).right
          listNode <- Right(setLabel(itemNode, Some(MainLabel.ITEM), Some(ItemLabel.LIST), Some(scala.List(ItemLabel.TASK)))).right
          listNode <- updateNode(listNode, list).right
          parentNode <- setParentNode(listNode, owner, list).right
          tagNodes <- setTagNodes(listNode, owner, list).right
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
      parent <- getParentRelationship(listNode, owner, ItemLabel.LIST).right
      tags <- getTagRelationships(listNode, owner).right
      task <- Right(list.copy(
        relationships = 
          (if (parent.isDefined || tags.isDefined)            
            Some(ExtendedItemRelationships(  
              parent = (if (parent.isEmpty) None else (Some(getUUID(parent.get.getEndNode())))),
              tags = (if (tags.isEmpty) None else (Some(getEndNodeUUIDList(tags.get))))))
           else None
          ))).right
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
    else
      Right(true)
  }
  
/*
  protected def completeTaskNode(owner: Owner, taskUUID: UUID): Response[Node] = {
    withTx {
      implicit neo =>
        for {
          taskNode <- getItemNode(owner, taskUUID, Some(ItemLabel.TASK)).right
          result <- Right(completeTaskNode(taskNode)).right
        } yield taskNode
    }
  }

  protected def completeTaskNode(taskNode: Node)(implicit neo4j: DatabaseService): Unit = {
    val currentTime = System.currentTimeMillis()
    taskNode.setProperty("completed", currentTime)
  }

  protected def getCompleteTaskResult(task: Node): CompleteTaskResult = {
    withTx {
      implicit neo =>
        CompleteTaskResult(task.getProperty("completed").asInstanceOf[Long],
          getSetResult(task, false))
    }
  }
  
  protected def uncompleteTaskNode(owner: Owner, taskUUID: UUID): Response[Node] = {
    withTx {
      implicit neo =>
        for {
          taskNode <- getItemNode(owner, taskUUID, Some(ItemLabel.TASK)).right
          result <- Right(uncompleteTaskNode(taskNode)).right
        } yield taskNode
    }
  }

  protected def uncompleteTaskNode(taskNode: Node)(implicit neo4j: DatabaseService): Unit = {
    if (taskNode.hasProperty("completed")) taskNode.removeProperty("completed")
  }
  *  
  */

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
}