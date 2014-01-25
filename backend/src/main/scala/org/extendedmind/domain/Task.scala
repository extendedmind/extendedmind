package org.extendedmind.domain

import java.util.UUID
import org.extendedmind.SetResult
import Validators._

// List of RepeatingTypes
sealed abstract class RepeatingType
case object DAILY extends RepeatingType
case object WEEKLY extends RepeatingType
case object BIWEEKLY extends RepeatingType
case object MONTHLY extends RepeatingType
case object BIMONTHLY extends RepeatingType
case object YEARLY extends RepeatingType

case class Task(uuid: Option[UUID], modified: Option[Long], deleted: Option[Long], 
                title: String, description: Option[String], 
                link: Option[String],
                due: Option[String],
                reminder: Option[String],
                repeating: Option[RepeatingType],
                completed: Option[Long],
                assignee: Option[UUID],
                assigner: Option[UUID],
                visibility: Option[SharedItemVisibility],
                relationships: Option[ExtendedItemRelationships])
            extends ExtendedItem{
  require(validateTitle(title), "Title can not be more than " + TITLE_MAX_LENGTH + " characters")
  if (description.isDefined) require(validateDescription(description.get), 
      "Description can not be more than " + DESCRIPTION_MAX_LENGTH + " characters")
  if (due.isDefined) require(validateDateString(due.get), "Due date does not match pattern yyyy-MM-dd")
  if (reminder.isDefined) require(validateTimeString(reminder.get), "Reminder time does not match pattern hh:mm")
}

object Task{
  def apply(title: String, description: Option[String], 
            link: Option[String],
            due: Option[String],
            reminder: Option[String],
            repeating: Option[RepeatingType],
            relationships: Option[ExtendedItemRelationships]) 
        = new Task(None, None, None, title, description, 
                   link, due, reminder, repeating, None, None, None, 
                   None, relationships)
}

case class CompleteTaskResult(completed: Long, result: SetResult)