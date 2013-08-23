package org.extendedmind.domain

import java.util.UUID

case class Note(uuid: Option[UUID], modified: Option[Long], 
                title: String, description: Option[String], 
                content: Option[String],
                link: Option[String],
                public: Option[Boolean],
                exclusive: Option[Boolean],
                parentTask: Option[String],
                parentNote: Option[String])
           extends Container(uuid, modified)
