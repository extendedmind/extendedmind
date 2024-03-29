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
import org.neo4j.graphdb.Relationship
import java.time.temporal.ChronoUnit
import org.extendedmind.security.SecurityContext
import org.extendedmind.security.IdUtils

trait TaskDatabase extends AbstractGraphDatabase with ItemDatabase {

  // PUBLIC

  def getTaskAccessRight(owner: Owner, task: Task): Option[Byte] = {
    if (owner.isLimitedAccess){
      // Need to use list access rights
      getSharedListAccessRight(owner.sharedLists.get, task.relationships)
    }else{
      Some(SecurityContext.FOUNDER)
    }
  }

  def putNewTask(owner: Owner, task: Task, originTaskNode: Option[Node] = None): Response[SetResult] = {
    withTx {
      implicit neo4j =>
        for {
          taskResult <- putNewExtendedItem(owner, task, ItemLabel.TASK).right
          relationship <- setTaskOriginRelationship(taskResult._1, originTaskNode).right
          newReminders <- updateReminders(taskResult._1, task.reminders).right
        } yield taskResult._2.copy(associated = newReminders)
    }
  }

  def putNewLimitedTask(owner: Owner, limitedTask: LimitedTask): Response[SetResult] = {
    withTx {
      implicit neo4j =>
        for {
          taskResult <- putNewLimitedExtendedItem(owner, limitedTask, ItemLabel.TASK).right
          unit <- Right(addToItemsIndex(owner, taskResult._1, taskResult._2)).right
        } yield taskResult._2
    }
  }

  def putExistingTask(owner: Owner, taskUUID: UUID, task: Task): Response[SetResult] = {
    withTx {
      implicit neo4j =>
        for {
          taskResult <- putExistingExtendedItem(owner, taskUUID, task, ItemLabel.TASK).right
          newReminders <- updateReminders(taskResult._1, task.reminders).right
          revision <- Right(evaluateTaskRevision(task, taskResult._1, taskResult._3)).right
          result <- Right(taskResult._2.copy(revision = revision, associated = newReminders)).right
          unit <- Right(updateItemsIndex(taskResult._1, result)).right
        } yield result
    }
  }

  def putExistingLimitedTask(owner: Owner, taskUUID: UUID, limitedTask: LimitedTask): Response[SetResult] = {
    withTx {
      implicit neo4j =>
        for {
          taskResult <- putExistingLimitedExtendedItem(owner, taskUUID, limitedTask, ItemLabel.TASK).right
          revision <- Right(evaluateTaskRevision(Task(limitedTask), taskResult._1, taskResult._3)).right
          result <- Right(taskResult._2.copy(revision = revision)).right
          unit <- Right(updateItemsIndex(taskResult._1, result)).right
        } yield result
    }
  }

  def getTask(owner: Owner, taskUUID: UUID): Response[Task] = {
    withTx {
      implicit neo =>
        for {
          taskNode <- getItemNode(getOwnerUUID(owner), taskUUID, Some(ItemLabel.TASK)).right
          task <- toCaseClass[Task](taskNode).right
          ownerNodes <- getOwnerNodes(owner).right
          completeTask <- addTransientTaskProperties(taskNode, ownerNodes, task).right
        } yield completeTask
    }
  }

  def deleteTask(owner: Owner, taskUUID: UUID, rm: Option[ReminderModification]): Response[DeleteItemResult] = {
    withTx {
      implicit neo =>
        for {
          taskNode <- validateExtendedItemModifiable(owner, taskUUID, ItemLabel.TASK, rm.isDefined).right
          deleteTaskResult <- deleteTaskNode(owner, taskNode, rm).right
          unit <- Right(updateItemsIndex(deleteTaskResult._1, deleteTaskResult._2.result)).right
        } yield deleteTaskResult._2
    }
  }

  def undeleteTask(owner: Owner, taskUUID: UUID, rm: Option[ReminderModification]): Response[SetResult] = {
    withTx {
      implicit neo =>
        for {
          taskNode <- validateExtendedItemModifiable(owner, taskUUID, ItemLabel.TASK, rm.isDefined).right
          result <- Right(undeleteItem(taskNode)).right
          modifyResult <- modifyReminder(taskNode, rm).right
          unit <- Right(updateItemsIndex(taskNode, result)).right
        } yield result
    }
  }

  def completeTask(owner: Owner, taskUUID: UUID, rm: Option[ReminderModification]): Response[CompleteTaskResult] = {
    withTx {
      implicit neo =>
        for {
          taskNode <- validateExtendedItemModifiable(owner, taskUUID, ItemLabel.TASK, rm.isDefined).right
          completeInfo <- markTaskNodeComplete(owner, taskNode, rm).right
          generatedTask <- evaluateRepeating(owner, completeInfo._1).right
          fullGeneratedTask <- putGeneratedTask(owner, generatedTask, completeInfo._1).right
          setResult <- Right(updateNodeModified(completeInfo._1)).right
          result <- Right(CompleteTaskResult(completeInfo._2, setResult, fullGeneratedTask)).right
          unit <- Right(updateItemsIndex(completeInfo._1, result.result)).right
        } yield result
    }
  }

  def uncompleteTask(owner: Owner, taskUUID: UUID, rm: Option[ReminderModification]): Response[SetResult] = {
    withTx {
      implicit neo =>
        for {
          taskNode <- validateExtendedItemModifiable(owner, taskUUID, ItemLabel.TASK, rm.isDefined).right
          result <- Right(uncompleteTaskNode(taskNode)).right
          unit <- modifyReminder(taskNode, rm).right
          result <- Right(updateNodeModified(taskNode)).right
          unit <- Right(updateItemsIndex(taskNode, result)).right
        } yield result
    }
  }

  def taskToList(owner: Owner, taskUUID: UUID, task: Task): Response[List] = {
    withTx {
      implicit neo4j =>
        for {
          taskResult <- putExistingExtendedItem(owner, taskUUID, task, ItemLabel.TASK).right
          result <- validateTaskConvertable(taskResult._1).right
          listNode <- Right(setLabel(taskResult._1, Some(MainLabel.ITEM), Some(ItemLabel.LIST), Some(scala.List(ItemLabel.TASK)))).right
          list <- toList(listNode, owner).right
          revision <- Right(evaluateListRevision(list, taskResult._1, taskResult._3, force=true)).right
          result <- Right(updateNodeModified(taskResult._1)).right
          unit <- Right(updateItemsIndex(taskResult._1, result)).right
        } yield (list.copy(modified = Some(result.modified), revision = revision))
    }
  }

  def taskToNote(owner: Owner, taskUUID: UUID, task: Task): Response[Note] = {
    withTx {
      implicit neo4j =>
        for {
          taskResult <- putExistingExtendedItem(owner, taskUUID, task, ItemLabel.TASK).right
          result <- validateTaskConvertable(taskResult._1).right
          noteNode <- Right(setLabel(taskResult._1, Some(MainLabel.ITEM), Some(ItemLabel.NOTE), Some(scala.List(ItemLabel.TASK)))).right
          result <- Right(moveDescriptionToContent(noteNode)).right
          note <- toNote(noteNode, owner).right
          revision <- Right(evaluateNoteRevision(note, taskResult._1, taskResult._3, force=true)).right
          result <- Right(updateNodeModified(taskResult._1)).right
          unit <- Right(updateItemsIndex(taskResult._1, result)).right
        } yield (note.copy(modified = Some(result.modified), revision = revision))
    }
  }

  // PRIVATE

  protected def putNewLimitedTaskNode(owner: Owner, limitedTask: LimitedTask)(implicit neo4j: DatabaseService): Response[(Node, SetResult, OwnerNodes)] = {
    for {
      taskResult <- putNewLimitedExtendedItem(owner, limitedTask, ItemLabel.TASK).right
    } yield taskResult
  }

  override def toTask(taskNode: Node, owner: Owner)(implicit neo4j: DatabaseService): Response[Task] = {
    for {
      task <- toCaseClass[Task](taskNode).right
      ownerNodes <- getOwnerNodes(owner).right
      completeTask <- addTransientTaskProperties(taskNode, ownerNodes, task).right
    } yield completeTask
  }

  protected def addTransientTaskProperties(taskNode: Node, ownerNodes: OwnerNodes, task: Task)(implicit neo4j: DatabaseService): Response[Task] = {
    for {
      parentRel <- Right(getItemRelationship(taskNode, ownerNodes, ItemRelationship.HAS_PARENT, ItemLabel.LIST)).right
      originRel <- Right(getItemRelationship(taskNode, ownerNodes, ItemRelationship.HAS_ORIGIN, ItemLabel.TASK)).right
      latestRevisionRel <- Right(getLatestExtendedItemRevisionRelationship(taskNode)).right
      assigneeRel <- Right(getAssigneeRelationship(taskNode)).right
      tagsRels <- getTagRelationships(taskNode, ownerNodes).right
      reminderNodes <- Right(getReminderNodes(taskNode)).right
      reminders <- getReminders(reminderNodes).right
      task <- Right(task.copy(
        creator = getItemCreatorUUID(taskNode),
        reminders = reminders,
        revision = latestRevisionRel.flatMap(latestRevisionRel => Some(latestRevisionRel.getEndNode.getProperty("number").asInstanceOf[Long])),
        relationships =
          (if (parentRel.isDefined || originRel.isDefined || assigneeRel.isDefined || tagsRels.isDefined )
            Some(ExtendedItemRelationships(
              parent = parentRel.flatMap(parentRel => Some(getUUID(parentRel.getEndNode()))),
              origin = originRel.flatMap(originRel => Some(getUUID(originRel.getEndNode()))),
              assignee = assigneeRel.flatMap(assigneeRel => {
                if (ownerNodes.foreignOwner.isEmpty && getUUID(assigneeRel.getEndNode) == getUUID(ownerNodes.user)) None
                else Some(getUUID(assigneeRel.getEndNode))
              }),
              assigner = assigneeRel.flatMap(assigneeRel => Some(IdUtils.getUUID(assigneeRel.getProperty("assigner").asInstanceOf[String]))),
              tags = tagsRels.flatMap(tagsRels => if (tagsRels.ownerTags.isDefined) Some(getEndNodeUUIDList(tagsRels.ownerTags.get)) else None),
              collectiveTags = tagsRels.flatMap(tagsRels => getCollectiveTagEndNodeUUIDList(tagsRels.collectiveTags))))
           else None
          ))).right
    } yield task
  }

  protected def markTaskNodeComplete(owner: Owner, taskNode: Node, rm: Option[ReminderModification])(implicit neo4j: DatabaseService): Response[(Node, Long)] = {
    for {
      completed <- markTaskNodeComplete(owner, taskNode).right
      unit <- modifyReminder(taskNode, rm).right
    } yield (taskNode, completed)
  }

  protected def markTaskNodeComplete(owner: Owner, taskNode: Node)(implicit neo4j: DatabaseService): Response[Long] = {
    val currentTime = System.currentTimeMillis()
    taskNode.setProperty("completed", currentTime)
    Right(currentTime)
  }

  protected def evaluateRepeating(owner: Owner, taskNode: Node)(implicit neo4j: DatabaseService): Response[Option[Task]] = {
    if (taskNode.hasProperty("repeating")) {

      val ownerNodesResult = getOwnerNodes(owner)
      if (ownerNodesResult.isRight){
        val ownerNodes = ownerNodesResult.right.get
        // Generate new task on complete if a new task has not already been created
        val originRelationshipResponse = getItemRelationship(taskNode, ownerNodes, ItemRelationship.HAS_ORIGIN, ItemLabel.TASK, Direction.INCOMING)
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
            completeTask <- addTransientTaskProperties(taskNode, ownerNodes, task).right
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
      }else{
        Left(ownerNodesResult.left.get)
      }

    } else {
      // Not a repeating task
      Right(None)
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
      .relationships(RelationshipType.withName(ItemRelationship.HAS_REMINDER.name), Direction.OUTGOING)
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

  protected def updateReminders(taskNode: Node, reminders: Option[scala.List[Reminder]])(implicit neo4j: DatabaseService): Response[Option[scala.List[IdToUUID]]] = {
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

      Right(getIdToUuids(Some(createdReminderNodes.toList)))
    }
  }

  protected def createReminder(taskNode: Node, reminder: Reminder)(implicit neo4j: DatabaseService): Node = {
    val reminderNode = createNode(reminder, MainLabel.REMINDER)
    taskNode --> ItemRelationship.HAS_REMINDER --> reminderNode;
    setNodeCreated(reminderNode)
    reminderNode
  }

  protected def destroyReminder(reminderNode: Node)(implicit neo4j: DatabaseService) {
    // Remove all relationships
    val relationShipList = reminderNode.getRelationships().toList
    relationShipList.foreach(relationship => relationship.delete())
    // Delete reminder itself
    reminderNode.delete()
  }

  protected def uncompleteTaskNode(taskNode: Node)(implicit neo4j: DatabaseService): Unit = {
    if (taskNode.hasProperty("completed")) taskNode.removeProperty("completed")
  }

  protected def deleteTaskNode(owner: Owner, taskNode: Node, rm: Option[ReminderModification])(implicit neo4j: DatabaseService): Response[(Node, DeleteItemResult)] = {
    for {
      deleted <- Right(deleteItem(taskNode)).right
      unit <- modifyReminder(taskNode, rm).right
    } yield (taskNode, deleted)
  }

  protected def modifyReminder(taskNode: Node, rm: Option[ReminderModification])(implicit neo4j: DatabaseService): Response[Option[SetResult]] = {
    if (rm.isEmpty) Right(None)
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
        Right(Some(updateNodeModified(reminderNode.get)))
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

  protected def destroyTaskRelationship(relationship: Relationship)(implicit neo4j: DatabaseService){
    if (relationship.getType().name() == ItemRelationship.HAS_REMINDER.name){
      // Also destroy all reminders
      relationship.getEndNode().delete()
    }
  }

  protected def evaluateTaskRevision(task: Task, taskNode: Node, ownerNodes: OwnerNodes, force: Boolean = false)(implicit neo4j: DatabaseService): Option[Long] = {
    evaluateNeedForRevision(task.revision, taskNode, ownerNodes, force).flatMap(latestRevisionRel => {
      // Create a revision containing only the fields that can be set using putExistingTask
      val taskBytes = pickleTask(getTaskForPickling(task))
      val revisionNode = createExtendedItemRevision(taskNode, ownerNodes, ItemLabel.TASK, taskBytes, latestRevisionRel)
      Some(revisionNode.getProperty("number").asInstanceOf[Long])
    })
  }

  private def getTaskForPickling(task: Task): Task = {
    // Create a revision containing only the fields that can be set using putExistingTask, and the modified timestamp
    task.copy(
      modified = None,
      archived = None,
      deleted = None,
      creator = None,
      completed = None,
      visibility = None,
      revision = None,
      reminders = None,
      relationships =
        if (task.relationships.isDefined)
          Some(task.relationships.get.copy(
              assigner = None,
              origin = None))
        else None)
  }
}