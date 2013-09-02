package org.extendedmind.domain

import java.util.UUID
import org.extendedmind.SetResult

case class Task(uuid: Option[UUID], modified: Option[Long], 
                title: String, description: Option[String], 
                due: Option[String],
                reminder: Option[String],
                link: Option[String],
                completed: Option[Long],
                assignee: Option[UUID],
                assigner: Option[UUID],
                project: Option[Boolean],
                public: Option[Long],
                collective: Option[UUID],
                parentTask: Option[UUID],
                parentNote: Option[UUID])
            extends ExtendedItem

object TaskWrapper{
  def apply(title: String, description: Option[String], 
            due: Option[String],
            reminder: Option[String],
            link: Option[String],
            parentTask: Option[UUID],
            parentNote: Option[UUID]) 
        = new Task(None, None, title, description, 
                   due, reminder, link, None, None, None, 
                   None, None, None, parentTask, parentNote)
}

case class CompleteTaskResult(completed: Long, result: SetResult)