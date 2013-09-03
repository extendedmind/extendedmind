package org.extendedmind.domain

import java.util.UUID
import org.extendedmind.SetResult

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
            extends ExtendedItem

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