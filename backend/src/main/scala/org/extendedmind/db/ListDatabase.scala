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
  /*
  def deleteList(owner: Owner, taskUUID: UUID): Response[DeleteItemResult] = {
    for {
      deletedListNode <- deleteListNode(owner, taskUUID).right
      result <- Right(getDeleteItemResult(deletedListNode._1, deletedTaskNode._2)).right
      unit <- Right(updateItemsIndex(deletedListNode._1, result.result)).right
    } yield result
  }
  
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

  protected def deleteTaskNode(owner: Owner, taskUUID: UUID): Response[Tuple2[Node, Long]] = {
    withTx {
      implicit neo =>
        for {
          itemNode <- getItemNode(owner, taskUUID, Some(ItemLabel.TASK)).right
          deletable <- validateTaskDeletable(itemNode).right
          deleted <- Right(deleteItem(itemNode)).right
        } yield (itemNode, deleted)
    }
  }

  protected def validateTaskDeletable(taskNode: Node)(implicit neo4j: DatabaseService): Response[Boolean] = {
    if (taskNode.hasLabel(ItemParentLabel.PROJECT))
      fail(INVALID_PARAMETER, "can not delete project, only tasks")
    else
      Right(true)
  }  
  *  
  */
}