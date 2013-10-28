package org.extendedmind.domain

import java.util.UUID
import org.extendedmind.SetResult
import Validators._

case class Task(uuid: Option[UUID], modified: Option[Long], deleted: Option[Long], 
                title: String, description: Option[String], 
                due: Option[String],
                reminder: Option[String],
                link: Option[String],
                completed: Option[Long],
                assignee: Option[UUID],
                assigner: Option[UUID],
                project: Option[Boolean],
                visibility: Option[SharedItemVisibility],
                relationships: Option[ExtendedItemRelationships])
            extends ExtendedItem{
  require(validateTitle(title), "Title can not be more than " + TITLE_MAX_LENGTH + " characters")
  if (description.isDefined) require(validateDescription(description.get), 
      "Description can not be more than " + DESCRIPTION_MAX_LENGTH + " characters")
  if (due.isDefined) require(validateDateString(due.get), "Given due date does not match pattern yyyy-MM-dd")
  if (reminder.isDefined) require(validateTimeString(reminder.get), "Given reminder time does not match pattern hh:mm")
}

object Task{
  def apply(title: String, description: Option[String], 
            due: Option[String],
            reminder: Option[String],
            link: Option[String],
            relationships: Option[ExtendedItemRelationships]) 
        = new Task(None, None, None, title, description, 
                   due, reminder, link, None, None, None, 
                   None, None, relationships)
}

case class CompleteTaskResult(completed: Long, result: SetResult)