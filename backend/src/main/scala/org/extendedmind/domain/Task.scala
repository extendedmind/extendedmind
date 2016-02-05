/**
 * Copyright (c) 2013-2016 Extended Mind Technologies Oy
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

package org.extendedmind.domain

import java.util.UUID
import org.extendedmind.SetResult
import Validators._

// List of RepeatingTypes
object RepeatingType extends Enumeration {
  type RepeatingType = Value
  val DAILY = Value("daily")
  val WEEKLY = Value("weekly")
  val BIWEEKLY = Value("biweekly")
  val MONTHLY = Value("monthly")
  val BIMONTHLY = Value("bimonthly")
  val YEARLY = Value("yearly")
}

case class Task(uuid: Option[UUID],
                id: Option[String], ui: Option[String],
                created: Option[Long], modified: Option[Long], deleted: Option[Long], archived: Option[Long],
                title: String, description: Option[String],
                link: Option[String],
                due: Option[String],
                repeating: Option[String],
                completed: Option[Long],
                reminders: Option[scala.List[Reminder]],
                revision: Option[Long],
                visibility: Option[SharedItemVisibility],
                relationships: Option[ExtendedItemRelationships])
            extends ExtendedItem{
  if (id.isDefined) require(validateLength(id.get, 100), "Id can not be more than 100 characters")
  if (ui.isDefined) require(validateLength(ui.get, 10000), "UI preferences max length is 10000")
  require(validateTitle(title), "Title can not be more than " + TITLE_MAX_LENGTH + " characters")
  if (description.isDefined) require(validateDescription(description.get),
      "Description can not be more than " + DESCRIPTION_MAX_LENGTH + " characters")
  if (link.isDefined) require(validateLength(link.get, 2000), "Link can not be more than 2000 characters")
  if (due.isDefined) require(validateDateString(due.get), "Due date does not match pattern yyyy-MM-dd")
  if (repeating.isDefined) require(due.isDefined, "Repeating requires due date")
  if (repeating.isDefined) require(
      try {
        val repeatingType = RepeatingType.withName(repeating.get)
        true
      }catch {
        case _:Throwable => false
      },
      "Expected 'daily', 'weekly', 'biweekly', 'monthly', 'bimonthly', 'yearly' but got " + repeating.get)
}

object Task{
  def apply(title: String, description: Option[String],
            link: Option[String],
            due: Option[String],
            repeating: Option[RepeatingType.RepeatingType],
            reminders: Option[scala.List[Reminder]],
            relationships: Option[ExtendedItemRelationships])
        = new Task(None, None, None, None, None, None, None, title, description,
                   link, due, if (repeating.isDefined) Some(repeating.get.toString()) else None, None,
                   reminders, None, None, relationships)

  def apply(limitedTask: LimitedTask)
        = new Task(limitedTask.uuid, limitedTask.id, limitedTask.ui, limitedTask.created, limitedTask.modified,
                    limitedTask.deleted, None,
                    limitedTask.title, limitedTask.description, limitedTask.link, None, None,
                    limitedTask.completed, None, None, None,
                    Some(ExtendedItemRelationships(
                        limitedTask.relationships.parent, limitedTask.relationships.origin,
                        None, None, None, None)))
}

case class LimitedTask(uuid: Option[UUID],
                id: Option[String], ui: Option[String],
                created: Option[Long], modified: Option[Long], deleted: Option[Long],
                title: String, description: Option[String],
                link: Option[String],
                completed: Option[Long],
                relationships: LimitedExtendedItemRelationships)
                extends LimitedExtendedItem {
  if (id.isDefined) require(validateLength(id.get, 100), "Id can not be more than 100 characters")
  if (ui.isDefined) require(validateLength(ui.get, 10000), "UI preferences max length is 10000")
  require(validateTitle(title), "Title can not be more than " + TITLE_MAX_LENGTH + " characters")
  if (description.isDefined) require(validateDescription(description.get),
      "Description can not be more than " + DESCRIPTION_MAX_LENGTH + " characters")
  if (link.isDefined) require(validateLength(link.get, 2000), "Link can not be more than 2000 characters")
}

object LimitedTask{
  def apply(task: Task)
        = new LimitedTask(task.uuid, task.id, task.ui, task.created, task.modified, task.deleted,
                          task.title, task.description, task.link, task.completed,
                          LimitedExtendedItemRelationships(task.relationships.get.parent, task.relationships.get.origin))
}
// List of Reminder types
object ReminderType extends Enumeration {
  type ReminderType = Value
  val LOCAL_NOTIFICATION = Value("ln")
}

case class Reminder(uuid: Option[UUID], id: Option[String], reminderType: String, packaging: String, device: String,
                    notification: Long, removed: Option[Long]){
  require(
      try {
        val rt = ReminderType.withName(reminderType)
        true
      }catch {
        case _:Throwable => false
      },
      "Expected 'ln' but got " + reminderType)
  if (id.isDefined) require(validateLength(id.get, 64), "Reminder id can not be more than 64 characters")
  require(validateLength(packaging, 32), "Packaging can not be more than 32 characters")
  require(validateLength(device, 64), "Device can not be more than 64 characters")
}

object Reminder{
  def apply(id: String, reminderType: String, packaging: String, device: String, notification: Long)
        = new Reminder(None, Some(id), reminderType, packaging, device, notification, None)
}

case class ReminderModification(reminderId: String, removed: Option[Long]){
  require(validateLength(reminderId, 64), "Reminder id can not be more than 64 characters")
}

case class CompleteTaskResult(completed: Long, result: SetResult, generated: Option[Task])