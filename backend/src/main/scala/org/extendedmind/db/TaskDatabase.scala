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
import org.neo4j.graphdb.Relationship
import java.time.temporal.ChronoUnit

trait TaskDatabase extends AbstractGraphDatabase with ItemDatabase {

  // PUBLIC

  def putNewTask(owner: Owner, task: Task, originTaskNode: Option[Node] = None): Response[SetResult] = {
    for {
      taskResult <- putNewTaskNode(owner, task, originTaskNode).right
      result <- Right(getSetResult(taskResult._1, true, taskResult._2, taskResult._3)).right
      unit <- Right(addToItemsIndex(owner, taskResult._1, result)).right
    } yield result
  }

  def putExistingTask(owner: Owner, taskUUID: UUID, task: Task): Response[SetResult] = {
    for {
      taskResult <- putExistingTaskNode(owner, taskUUID, task).right
      result <- Right(getSetResult(taskResult._1, false, taskResult._2, taskResult._3)).right
      unit <- Right(updateItemsIndex(taskResult._1, result)).right
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
  
  def deleteTask(owner: Owner, taskUUID: UUID, rm: Option[ReminderModification]): Response[DeleteItemResult] = {
    for {
      deletedTaskNode <- deleteTaskNode(owner, taskUUID, rm).right
      result <- Right(getDeleteItemResult(deletedTaskNode._1, deletedTaskNode._2)).right
      unit <- Right(updateItemsIndex(deletedTaskNode._1, result.result)).right
    } yield result
  }
  
  def undeleteTask(owner: Owner, taskUUID: UUID, rm: Option[ReminderModification]): Response[SetResult] = {
    for {
      taskNode <- undeleteTaskNode(owner, taskUUID, rm).right
      result <- Right(getSetResult(taskNode, false)).right
      unit <- Right(updateItemsIndex(taskNode, result)).right
    } yield result
  }
  
  def completeTask(owner: Owner, taskUUID: UUID, rm: Option[ReminderModification]): Response[CompleteTaskResult] = {
    for {
      completeInfo <- completeTaskNode(owner, taskUUID, rm).right
      result <- Right(getCompleteTaskResult(completeInfo)).right
      unit <- Right(updateItemsIndex(completeInfo._1, result.result)).right
    } yield result
  }
  
  def uncompleteTask(owner: Owner, taskUUID: UUID, rm: Option[ReminderModification]): Response[SetResult] = {
    for {
      taskNode <- uncompleteTaskNode(owner, taskUUID, rm).right
      result <- Right(getSetResult(taskNode, false)).right
      unit <- Right(updateItemsIndex(taskNode, result)).right
    } yield result
  }
  
  def taskToList(owner: Owner, taskUUID: UUID, task: Task): Response[List] = {
    for {
      convertResult <- convertTaskToList(owner, taskUUID, task).right
      result <- Right(getSetResult(convertResult._1, false)).right
      unit <- Right(updateItemsIndex(convertResult._1, result)).right
    } yield convertResult._2
  }
  
  def taskToNote(owner: Owner, taskUUID: UUID, task: Task): Response[Note] = {
    for {
      convertResult <- convertTaskToNote(owner, taskUUID, task).right
      result <- Right(getSetResult(convertResult._1, false)).right
      unit <- Right(updateItemsIndex(convertResult._1, result)).right
    } yield convertResult._2
  }

  // PRIVATE

  protected def putNewTaskNode(owner: Owner, task: Task, originTaskNode: Option[Node] = None): Response[(Node, Option[Long], Option[scala.List[Node]])] = {
    withTx {
      implicit neo4j =>
        for {
          taskResult <- putNewExtendedItem(owner, task, ItemLabel.TASK).right
          relationship <- setTaskOriginRelationship(taskResult._1, originTaskNode).right
          newReminderNodes <- updateReminders(taskResult._1, task.reminders).right
        } yield (taskResult._1, taskResult._2, newReminderNodes)
    }
  }

  protected def putExistingTaskNode(owner: Owner, taskUUID: UUID, task: Task): Response[(Node, Option[Long], Option[scala.List[Node]])] = {
    withTx {
      implicit neo4j =>
        for {
          taskResult <- putExistingExtendedItem(owner, taskUUID, task, ItemLabel.TASK).right
          newReminderNodes <- updateReminders(taskResult._1, task.reminders).right
        } yield (taskResult._1, taskResult._2, newReminderNodes)
    }
  }
  
  override def toTask(taskNode: Node, owner: Owner)(implicit neo4j: DatabaseService): Response[Task] = {
    for {
      task <- toCaseClass[Task](taskNode).right
      completeTask <- addTransientTaskProperties(taskNode, owner, task).right
    } yield completeTask
  }

  protected def addTransientTaskProperties(taskNode: Node, owner: Owner, task: Task)(implicit neo4j: DatabaseService): Response[Task] = {
    for {
      parent <- Right(getItemRelationship(taskNode, owner, ItemRelationship.HAS_PARENT, ItemLabel.LIST)).right
      origin <- Right(getItemRelationship(taskNode, owner, ItemRelationship.HAS_ORIGIN, ItemLabel.TASK)).right
      tags <- getTagRelationships(taskNode, owner).right
      reminderNodes <- Right(getReminderNodes(taskNode)).right
      reminders <- getReminders(reminderNodes).right
      task <- Right(task.copy(
        reminders = reminders,
        relationships = 
          (if (parent.isDefined || origin.isDefined || tags.isDefined )            
            Some(ExtendedItemRelationships(
              parent = (if (parent.isEmpty) None else (Some(getUUID(parent.get.getEndNode())))),
              origin = (if (origin.isEmpty) None else (Some(getUUID(origin.get.getEndNode())))),
              tags = (if (tags.isEmpty) None else (Some(getEndNodeUUIDList(tags.get))))))
           else None
          ))).right
    } yield task
  }

  protected def completeTaskNode(owner: Owner, taskUUID: UUID, rm: Option[ReminderModification]): Response[(Node, Long, Option[Task])] = {
    for {
      completeInfo <- markTaskNodeComplete(owner, taskUUID, rm).right
      generatedTask <- evaluateRepeating(owner, completeInfo._1).right
      fullGeneratedTask <- putGeneratedTask(owner, generatedTask, completeInfo._1).right
    } yield (completeInfo._1, completeInfo._2, fullGeneratedTask)
  }
  
  protected def markTaskNodeComplete(owner: Owner, taskUUID: UUID, rm: Option[ReminderModification]): Response[(Node, Long)] = {
    withTx {
      implicit neo =>
        for {
          taskNode <- getItemNode(owner, taskUUID, Some(ItemLabel.TASK)).right
          completed <- markTaskNodeComplete(owner, taskNode).right
          unit <- modifyReminder(taskNode, rm).right
        } yield (taskNode, completed)
    }
  }    
  
  protected def markTaskNodeComplete(owner: Owner, taskNode: Node)(implicit neo4j: DatabaseService): Response[Long] = {
    withTx {
      implicit neo4j =>
  	    val currentTime = System.currentTimeMillis()
  	    taskNode.setProperty("completed", currentTime)
  	    Right(currentTime)
    }
  }

  protected def evaluateRepeating(owner: Owner, taskNode: Node): Response[Option[Task]] = {
    withTx {
      implicit neo =>
        if (taskNode.hasProperty("repeating")) {
          // Generate new task on complete if a new task has not already been created
          val originRelationshipResponse = getItemRelationship(taskNode, owner, ItemRelationship.HAS_ORIGIN, ItemLabel.TASK, Direction.INCOMING)
          if (originRelationshipResponse.isEmpty){
	          // First, get new due string
	          val repeatingType = RepeatingType.withName(taskNode.getProperty("repeating").asInstanceOf[String])
	          val oldDue: java.util.Calendar = java.util.Calendar.getInstance();
            
            Validators.dateFormat.parse(taskNode.getProperty("due").asInstanceOf[String])
            
            val dueDate = java.time.LocalDate.parse(taskNode.getProperty("due").asInstanceOf[String], Validators.dateFormat)
	          val newDue = repeatingType match {
	            case RepeatingType.DAILY => dueDate.plus(1, ChronoUnit.DAYS)
	            case RepeatingType.WEEKLY => dueDate.plus(7, ChronoUnit.DAYS)
	            case RepeatingType.BIWEEKLY => dueDate.plus(14, ChronoUnit.DAYS)
	            case RepeatingType.MONTHLY => dueDate.plus(1, ChronoUnit.MONTHS)
	            case RepeatingType.BIMONTHLY => dueDate.plus(2, ChronoUnit.MONTHS)
	            case RepeatingType.YEARLY => dueDate.plus(1, ChronoUnit.YEARS)
	          }
	          val newDueString = Validators.dateFormat.format(newDue)
	
	          // Second, duplicate old task
	          val oldTask = for {
	            task <- toCaseClass[Task](taskNode).right
	            completeTask <- addTransientTaskProperties(taskNode, owner, task).right
	          } yield completeTask
	          if (oldTask.isLeft) Left(oldTask.left.get)
	          else {
	            Right(Some(oldTask.right.get.copy(uuid = None, modified = None, due = Some(newDueString))))
	          }
          }
          else{
            // A new task has already been created
            Right(None)
          }
        } else {
          // Not a repeating task
          Right(None)
        }
    }
  }
  
  protected def putGeneratedTask(owner: Owner, task: Option[Task], originTaskNode: Node): Response[Option[Task]] = {
    if (task.isDefined){
      val putTaskResponse = putNewTask(owner, task.get, Some(originTaskNode))
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
  
  protected def setTaskOriginRelationship(taskNode: Node, originTaskNode: Option[Node])(implicit neo4j: DatabaseService): Response[Option[Relationship]] = {
    if (originTaskNode.isDefined){
      val relationship = taskNode --> ItemRelationship.HAS_ORIGIN --> originTaskNode.get <;
      Right(Some(relationship))
    }else{
      Right(None)
    }
  }
  
  protected def getReminderNodes(taskNode: Node)(implicit neo4j: DatabaseService): scala.List[Node] = {
    val reminderTraversal = neo4j.gds.traversalDescription()
      .breadthFirst()
      .relationships(DynamicRelationshipType.withName(ItemRelationship.HAS_REMINDER.name), Direction.OUTGOING)
      .evaluator(Evaluators.excludeStartPosition())
      .evaluator(LabelEvaluator(scala.List(MainLabel.REMINDER)))
      .evaluator(Evaluators.toDepth(1))
      .traverse(taskNode)
    reminderTraversal.nodes().toList
  }
  
  protected def getReminders(reminderNodes: scala.List[Node])(implicit neo4j: DatabaseService): Response[Option[scala.List[Reminder]]] = {
    if (reminderNodes.isEmpty){
      Right(None)
    }else{
      Right(Some(reminderNodes.map(reminderNode => {
        val convertResponse = toCaseClass[Reminder](reminderNode)
        if (convertResponse.isLeft) return Left(convertResponse.left.get)
        convertResponse.right.get
      })))
    }
  }
  
  protected def updateReminders(taskNode: Node, reminders: Option[scala.List[Reminder]])(implicit neo4j: DatabaseService): Response[Option[scala.List[Node]]] = {    
    val reminderNodeList = getReminderNodes(taskNode)
    
    if (reminders.isEmpty || reminders.get.size == 0){
      reminderNodeList.foreach(reminderNode => {
        destroyReminder(reminderNode)
      })
      Right(None)
    }else{
      // Loop over new list
      val createdReminderNodes = new ListBuffer[Node]
      reminders.get.foreach(reminder => {
        if (reminder.uuid.isEmpty){
          // New reminder
          createdReminderNodes.append(createReminder(taskNode, reminder))
        }else{
          // existing reminder
          val existingReminder = reminderNodeList.find(reminderNode => {
            getUUID(reminderNode) == reminder.uuid.get
          })
          if (existingReminder.isEmpty){
            return fail(INVALID_PARAMETER, ERR_TASK_INVALID_REMINDER_UUID, "Could not find reminder with UUID " + reminder.uuid.get)
          }
          updateNode(existingReminder.get, reminder).right
        }
      })
      
      // Loop over existing reminders and delete non-existent reminders
      reminderNodeList.foreach(reminderNode => {
        if (reminders.get.find(reminder => {
          reminder.uuid.isDefined && (reminder.uuid.get == getUUID(reminderNode))
        }).isEmpty){
          destroyReminder(reminderNode)        
        }
      })
      
      Right(if (createdReminderNodes.size > 0) Some(createdReminderNodes.toList) else None)
    }
  }

  protected def createReminder(taskNode: Node, reminder: Reminder)(implicit neo4j: DatabaseService): Node = {
    val reminderNode = createNode(reminder, MainLabel.REMINDER)
    taskNode --> ItemRelationship.HAS_REMINDER --> reminderNode;
    reminderNode
  }

  
  protected def destroyReminder(reminderNode: Node)(implicit neo4j: DatabaseService) {
    // Remove all relationships
    val relationShipList = reminderNode.getRelationships().toList
    relationShipList.foreach(relationship => relationship.delete())
    // Delete reminder itself
    reminderNode.delete()
  }

  protected def getCompleteTaskResult(completeInfo: (Node, Long, Option[Task])): CompleteTaskResult = {
    CompleteTaskResult(completeInfo._2,
      getSetResult(completeInfo._1, false),
      completeInfo._3)
  }
  
  protected def uncompleteTaskNode(owner: Owner, taskUUID: UUID, rm: Option[ReminderModification]): Response[Node] = {
    withTx {
      implicit neo =>
        for {
          taskNode <- getItemNode(owner, taskUUID, Some(ItemLabel.TASK)).right
          result <- Right(uncompleteTaskNode(taskNode)).right
          unit <- modifyReminder(taskNode, rm).right
        } yield taskNode
    }
  }

  protected def uncompleteTaskNode(taskNode: Node)(implicit neo4j: DatabaseService): Unit = {
    if (taskNode.hasProperty("completed")) taskNode.removeProperty("completed")
  }

  protected def deleteTaskNode(owner: Owner, taskUUID: UUID, rm: Option[ReminderModification]): Response[Tuple2[Node, Long]] = {
    withTx {
      implicit neo =>
        for {
          taskNode <- getItemNode(owner, taskUUID, Some(ItemLabel.TASK)).right
          deleted <- Right(deleteItem(taskNode)).right
          unit <- modifyReminder(taskNode, rm).right
        } yield (taskNode, deleted)
    }
  }
  
  protected def convertTaskToList(owner: Owner, taskUUID: UUID, task: Task): Response[(Node, List)] = {
    withTx {
      implicit neo4j =>
        for {
          taskResult <- putExistingExtendedItem(owner, taskUUID, task, ItemLabel.TASK).right
          result <- validateTaskConvertable(taskResult._1).right
          listNode <- Right(setLabel(taskResult._1, Some(MainLabel.ITEM), Some(ItemLabel.LIST), Some(scala.List(ItemLabel.TASK)))).right
          list <- toList(listNode, owner).right
        } yield (taskResult._1, list)
    }
  }
  
  protected def convertTaskToNote(owner: Owner, taskUUID: UUID, task: Task): Response[(Node, Note)] = {
    withTx {
      implicit neo4j =>
        for {
          taskResult <- putExistingExtendedItem(owner, taskUUID, task, ItemLabel.TASK).right
          result <- validateTaskConvertable(taskResult._1).right
          noteNode <- Right(setLabel(taskResult._1, Some(MainLabel.ITEM), Some(ItemLabel.NOTE), Some(scala.List(ItemLabel.TASK)))).right
          result <- Right(moveDescriptionToContent(noteNode)).right
          note <- toNote(noteNode, owner).right
        } yield (taskResult._1, note)
    }
  }
  
  protected def undeleteTaskNode(owner: Owner, taskUUID: UUID, rm: Option[ReminderModification]): Response[Node] = {
    withTx {
      implicit neo =>
        for {
          taskNode <- getItemNode(owner, taskUUID, Some(ItemLabel.TASK), acceptDeleted = true).right
          success <- Right(undeleteItem(taskNode)).right
          unit <- modifyReminder(taskNode, rm).right
        } yield taskNode
    }
  }
  
  protected def modifyReminder(taskNode: Node, rm: Option[ReminderModification])(implicit neo4j: DatabaseService): Response[Unit] = {
    if (rm.isEmpty) Right()
    else{
      val reminderNodeList = getReminderNodes(taskNode)
      val reminderNode = reminderNodeList.find(reminderNode => {
        reminderNode.hasProperty("id") && reminderNode.getProperty("id").asInstanceOf[String] == rm.get.reminderId
      })
      if (reminderNode.isEmpty){
        fail(INVALID_PARAMETER, ERR_TASK_INVALID_REMINDER_ID, "Task does not have reminder with id " + rm.get.reminderId)
      }else{
        if (rm.get.removed.isDefined){
          reminderNode.get.setProperty("removed", rm.get.removed.get)
        }else{
          reminderNode.get.removeProperty("removed")
        }
        Right()
      }
    }
  }
  
  protected def validateTaskConvertable(taskNode: Node)(implicit neo4j: DatabaseService): Response[Unit] = {
    // Can't convert task that has reminders
    val reminderNodeList = getReminderNodes(taskNode)
    if (!reminderNodeList.isEmpty)
      fail(INVALID_PARAMETER, ERR_TASK_CONVERT_REMINDERS, "Can not convert a task that has reminders")
    else
      Right()
  }
}