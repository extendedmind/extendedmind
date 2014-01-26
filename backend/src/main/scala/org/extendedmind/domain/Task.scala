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

case class Task(uuid: Option[UUID], modified: Option[Long], deleted: Option[Long], 
                title: String, description: Option[String], 
                link: Option[String],
                due: Option[String],
                reminder: Option[String],
                repeating: Option[String],
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
            reminder: Option[String],
            repeating: Option[RepeatingType.RepeatingType],
            relationships: Option[ExtendedItemRelationships]) 
        = new Task(None, None, None, title, description, 
                   link, due, reminder, if (repeating.isDefined) Some(repeating.get.toString()) else None, None, None, None, 
                   None, relationships)
}

case class CompleteTaskResult(completed: Long, result: SetResult, created: Option[Task])