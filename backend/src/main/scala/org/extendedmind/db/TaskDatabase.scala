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

trait TaskDatabase extends AbstractGraphDatabase with ItemDatabase {

  // PUBLIC

  def putNewTask(userUUID: UUID, task: Task): Response[SetResult] = {
    for {
      taskNode <- putNewExtendedItem(userUUID, task, ItemLabel.TASK).right
      result <- Right(getSetResult(taskNode, true)).right
    } yield result
  }

  def putExistingTask(userUUID: UUID, taskUUID: UUID, task: Task): Response[SetResult] = {
    for {
      taskNode <- putExistingExtendedItem(userUUID, taskUUID, task, ItemLabel.TASK).right
      result <- Right(getSetResult(taskNode, false)).right
    } yield result
  }

  def getTask(userUUID: UUID, taskUUID: UUID): Response[Task] = {
    withTx {
      implicit neo =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          taskNode <- getItemNode(userNode, taskUUID, Some(ItemLabel.TASK)).right
          task <- toCaseClass[Task](taskNode).right
          completeTask <- addTransientTaskProperties(taskNode, userUUID, task).right
        } yield completeTask
    }
  }

  def completeTask(userUUID: UUID, taskUUID: UUID): Response[CompleteTaskResult] = {
    for {
      task <- completeTaskNode(userUUID, taskUUID).right
      result <- Right(getCompleteTaskResult(task)).right
    } yield result
  }
  
  def uncompleteTask(userUUID: UUID, taskUUID: UUID): Response[SetResult] = {
    for {
      taskNode <- uncompleteTaskNode(userUUID, taskUUID).right
      result <- Right(getSetResult(taskNode, false)).right
    } yield result
  }

  // PRIVATE

  override def toTask(taskNode: Node, userUUID: UUID)(implicit neo4j: DatabaseService): Response[Task] = {
    for {
      task <- toCaseClass[Task](taskNode).right
      completeTask <- addTransientTaskProperties(taskNode, userUUID, task).right
    } yield completeTask
  }

  protected def addTransientTaskProperties(taskNode: Node, userUUID: UUID, task: Task)(implicit neo4j: DatabaseService): Response[Task] = {
    for {
      parents <- getParentRelationships(taskNode, userUUID).right
      task <- Right(task.copy(
        relationships = 
          (if (parents._1.isDefined || parents._2.isDefined)            
            Some(ExtendedItemRelationships(  
              parentTask = (if (parents._1.isEmpty) None else (Some(getUUID(parents._1.get.getEndNode())))),
              parentNote = (if (parents._2.isEmpty) None else (Some(getUUID(parents._2.get.getEndNode())))),
              None))
           else None
          ),
        project = (if (taskNode.hasLabel(ItemParentLabel.PROJECT)) Some(true) else None))).right
    } yield task
  }

  protected def completeTaskNode(userUUID: UUID, taskUUID: UUID): Response[Node] = {
    withTx {
      implicit neo =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          taskNode <- getItemNode(userNode, taskUUID, Some(ItemLabel.TASK)).right
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
  
  protected def uncompleteTaskNode(userUUID: UUID, taskUUID: UUID): Response[Node] = {
    withTx {
      implicit neo =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          taskNode <- getItemNode(userNode, taskUUID, Some(ItemLabel.TASK)).right
          result <- Right(uncompleteTaskNode(taskNode)).right
        } yield taskNode
    }
  }

  protected def uncompleteTaskNode(taskNode: Node)(implicit neo4j: DatabaseService): Unit = {
    if (taskNode.hasProperty("completed")) taskNode.removeProperty("completed")
  }
}