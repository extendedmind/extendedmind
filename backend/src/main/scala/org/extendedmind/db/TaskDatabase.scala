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

  def putNewTask(owner: Owner, task: Task): Response[SetResult] = {
    for {
      taskNode <- putNewExtendedItem(owner, task, ItemLabel.TASK).right
      result <- Right(getSetResult(taskNode, true)).right
      unit <- Right(addToItemsIndex(owner, taskNode, result)).right
    } yield result
  }

  def putExistingTask(owner: Owner, taskUUID: UUID, task: Task): Response[SetResult] = {
    for {
      taskNode <- putExistingExtendedItem(owner, taskUUID, task, ItemLabel.TASK).right
      result <- Right(getSetResult(taskNode, false)).right
      unit <- Right(updateItemsIndex(taskNode, result)).right
    } yield result
  }

  def getTask(owner: Owner, taskUUID: UUID): Response[Task] = {
    withTx {
      implicit neo =>
        for {
          taskNode <- getItemNode(owner, taskUUID, Some(ItemLabel.TASK)).right
          task <- toCaseClass[Task](taskNode).right
          completeTask <- addTransientTaskProperties(taskNode, owner, task).right
        } yield completeTask
    }
  }
  
  def deleteTask(owner: Owner, taskUUID: UUID): Response[DeleteItemResult] = {
    for {
      deletedTaskNode <- deleteTaskNode(owner, taskUUID).right
      result <- Right(getDeleteItemResult(deletedTaskNode._1, deletedTaskNode._2)).right
      unit <- Right(updateItemsIndex(deletedTaskNode._1, result.result)).right
    } yield result
  }
  
  def completeTask(owner: Owner, taskUUID: UUID): Response[CompleteTaskResult] = {
    for {
      completeInfo <- completeTaskNode(owner, taskUUID).right
      result <- Right(getCompleteTaskResult(completeInfo)).right
      unit <- Right(updateItemsIndex(completeInfo._1, result.result)).right
    } yield result
  }
  
  def uncompleteTask(owner: Owner, taskUUID: UUID): Response[SetResult] = {
    for {
      taskNode <- uncompleteTaskNode(owner, taskUUID).right
      result <- Right(getSetResult(taskNode, false)).right
      unit <- Right(updateItemsIndex(taskNode, result)).right
    } yield result
  }

  // PRIVATE

  override def toTask(taskNode: Node, owner: Owner)(implicit neo4j: DatabaseService): Response[Task] = {
    for {
      task <- toCaseClass[Task](taskNode).right
      completeTask <- addTransientTaskProperties(taskNode, owner, task).right
    } yield completeTask
  }

  protected def addTransientTaskProperties(taskNode: Node, owner: Owner, task: Task)(implicit neo4j: DatabaseService): Response[Task] = {
    for {
      parent <- getParentRelationship(taskNode, owner, ItemLabel.LIST).right
      tags <- getTagRelationships(taskNode, owner).right
      task <- Right(task.copy(
        relationships = 
          (if (parent.isDefined || tags.isDefined)            
            Some(ExtendedItemRelationships(  
              parent = (if (parent.isEmpty) None else (Some(getUUID(parent.get.getEndNode())))),
              tags = (if (tags.isEmpty) None else (Some(getEndNodeUUIDList(tags.get))))))
           else None
          ))).right
    } yield task
  }

  protected def completeTaskNode(owner: Owner, taskUUID: UUID): Response[(Node, Long, Option[Task])] = {
    for {
      taskNode <- markTaskNodeComplete(owner, taskUUID).right
      generatedTask <- evaluateRepeating(owner, taskNode._1).right
      fullGeneratedTask <- putGeneratedTask(owner, generatedTask).right
    } yield (taskNode._1, taskNode._2, fullGeneratedTask)
  }
  
  protected def markTaskNodeComplete(owner: Owner, taskUUID: UUID): Response[(Node, Long)] = {
    withTx {
      implicit neo =>
        for {
          taskNode <- getItemNode(owner, taskUUID, Some(ItemLabel.TASK)).right
          completed <- markTaskNodeComplete(owner, taskNode).right
        } yield (taskNode, completed)
    }
  }    
  
  protected def markTaskNodeComplete(owner: Owner, taskNode: Node)(implicit neo4j: DatabaseService): Response[Long] = {
    withTx {
      implicit neo =>
	    val currentTime = System.currentTimeMillis()
	    taskNode.setProperty("completed", currentTime)
	    Right(currentTime)
    }
  }

  protected def evaluateRepeating(owner: Owner, taskNode: Node): Response[Option[Task]] = {
    withTx {
      implicit neo =>
        if (taskNode.hasProperty("repeating")) {
          // Generate new task on complete

          // First, get new due string
          val repeatingType = RepeatingType.withName(taskNode.getProperty("repeating").asInstanceOf[String])
          val oldDue: java.util.Calendar = java.util.Calendar.getInstance();
          oldDue.setTime(Validators.dateFormat.parse(taskNode.getProperty("due").asInstanceOf[String]))
          val newDue = repeatingType match {
            case RepeatingType.DAILY => oldDue.add(java.util.Calendar.DATE, 1)
            case RepeatingType.WEEKLY => oldDue.add(java.util.Calendar.DATE, 7)
            case RepeatingType.BIWEEKLY => oldDue.add(java.util.Calendar.DATE, 14)
            case RepeatingType.MONTHLY => oldDue.add(java.util.Calendar.MONTH, 1)
            case RepeatingType.BIMONTHLY => oldDue.add(java.util.Calendar.MONTH, 2)
            case RepeatingType.YEARLY => oldDue.add(java.util.Calendar.YEAR, 1)
          }
          val newDueString = Validators.dateFormat.format(oldDue.getTime())

          // Second, duplicate old task
          val oldTask = for {
            task <- toCaseClass[Task](taskNode).right
            completeTask <- addTransientTaskProperties(taskNode, owner, task).right
          } yield completeTask
          if (oldTask.isLeft) Left(oldTask.left.get)
          else {
            Right(Some(oldTask.right.get.copy(uuid = None, modified = None, due = Some(newDueString))))
          }
        } else {
          Right(None)
        }
    }
  }
  
  protected def putGeneratedTask(owner: Owner, task: Option[Task]): Response[Option[Task]] = {
    if (task.isDefined){
      val putTaskResponse = putNewTask(owner, task.get)
      if (putTaskResponse.isLeft) Left(putTaskResponse.left.get)
      else {
        val getTaskResponse = getTask(owner, putTaskResponse.right.get.uuid.get)
        if (getTaskResponse.isLeft) Left(getTaskResponse.left.get)
        else Right(Some(getTaskResponse.right.get))
      }
    }
    else{
      Right(None)
    }
  }

  protected def getCompleteTaskResult(completeInfo: (Node, Long, Option[Task])): CompleteTaskResult = {
    CompleteTaskResult(completeInfo._2,
      getSetResult(completeInfo._1, false),
      completeInfo._3)
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
}