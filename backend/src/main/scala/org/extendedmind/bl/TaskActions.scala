/**
 * Copyright (c) 2013-2015 Extended Mind Technologies Oy
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

package org.extendedmind.bl

import org.extendedmind.domain._
import org.extendedmind.db._
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.domain.Item
import java.util.UUID
import org.extendedmind._
import org.extendedmind.Response._
import akka.event.LoggingAdapter
import org.extendedmind.security.SecurityContext
import org.extendedmind.security.Authorization._

trait TaskActions {

  def db: GraphDatabase;

  def putNewTask(owner: Owner, task: Task)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("putNewTask")
    val accessRight =  db.getTaskAccessRight(owner, task)
    if (!writeAccess(accessRight)){
      fail(INVALID_PARAMETER, ERR_BASE_NO_LIST_ACCESS, "No write access to new task")
    }else{
      if (accessRight.get == SecurityContext.FOUNDER){
        db.putNewTask(owner, task)
      }else {
        // Need to use limited task
        val limitedTask = LimitedTask(task)
        db.putNewLimitedTask(owner, limitedTask)
      }
    }
  }

  def putExistingTask(owner: Owner, taskUUID: UUID, task: Task)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("putExistingTask")
    val accessRight =  db.getTaskAccessRight(owner, task)
    if (!writeAccess(accessRight)){
      fail(INVALID_PARAMETER, ERR_BASE_NO_LIST_ACCESS, "No write access to existing task")
    }else{
      if (accessRight.get == SecurityContext.FOUNDER){
    	  db.putExistingTask(owner, taskUUID, task)
      }else {
        // Need to use limited task
        val limitedTask = LimitedTask(task)
        db.putExistingLimitedTask(owner, taskUUID, limitedTask)
      }
    }
  }

  def getTask(owner: Owner, taskUUID: UUID)(implicit log: LoggingAdapter): Response[Task] = {
    log.info("getTask")
    db.getTask(owner, taskUUID)
  }

  def deleteTask(owner: Owner, taskUUID: UUID, rm: Option[ReminderModification])(implicit log: LoggingAdapter): Response[DeleteItemResult] = {
    log.info("deleteTask")
    db.deleteTask(owner, taskUUID, rm)
  }

  def undeleteTask(owner: Owner, taskUUID: UUID, rm: Option[ReminderModification])(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("undeleteTask")
    db.undeleteTask(owner: Owner, taskUUID, rm)
  }

  def completeTask(owner: Owner, taskUUID: UUID, rm: Option[ReminderModification])(implicit log: LoggingAdapter): Response[CompleteTaskResult] = {
    log.info("completeTask")
    db.completeTask(owner, taskUUID, rm)
  }

  def uncompleteTask(owner: Owner, taskUUID: UUID, rm: Option[ReminderModification])(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("uncompleteTask")
    db.uncompleteTask(owner, taskUUID, rm)
  }

  def taskToList(owner: Owner, taskUUID: UUID, task: Task)(implicit log: LoggingAdapter): Response[List] = {
    log.info("taskToList")
    db.taskToList(owner, taskUUID, task)
  }

  def taskToNote(owner: Owner, taskUUID: UUID, task: Task)(implicit log: LoggingAdapter): Response[Note] = {
    log.info("taskToNote")
    db.taskToNote(owner, taskUUID, task)
  }

}

class TaskActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends TaskActions with Injectable {
  def db = inject[GraphDatabase]
}
