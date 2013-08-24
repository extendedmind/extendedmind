package org.extendedmind.domain

import java.util.UUID

case class Note(uuid: Option[UUID], modified: Option[Long], 
                title: String, description: Option[String], 
                content: Option[String],
                link: Option[String],
                public: Option[Long],
                exclusive: Option[Long],
                parentTask: Option[UUID],
                parentNote: Option[UUID])
           extends Container(uuid, modified)

object NoteWrapper{
  def apply(title: String, description: Option[String], 
            content: Option[String],
            link: Option[String],
            parentTask: Option[UUID],
            parentNote: Option[UUID]) 
        = new Note(None, None, title, description, content, 
                   link, None, None, parentTask, parentNote)
}