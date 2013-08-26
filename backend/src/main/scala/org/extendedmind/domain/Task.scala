package org.extendedmind.domain

import java.util.UUID

case class Task(uuid: Option[UUID], modified: Option[Long], 
                title: String, description: Option[String], 
                due: Option[String],
                reminder: Option[String],
                link: Option[String],
                completed: Option[Long],
                public: Option[Long],
                exclusive: Option[Long],
                parentTask: Option[UUID],
                parentNote: Option[UUID])
           extends Container(uuid, modified)

object TaskWrapper{
  def apply(title: String, description: Option[String], 
            date: Option[String],
            reminder: Option[String],
            link: Option[String],
            parentTask: Option[UUID],
            parentNote: Option[UUID]) 
        = new Task(None, None, title, description, 
                   date, reminder, link, None, 
                   None, None, parentTask, parentNote)
}

case class CompleteTaskResult(completed: Long)