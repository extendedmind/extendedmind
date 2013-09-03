package org.extendedmind.domain

import java.util.UUID

case class Note(uuid: Option[UUID], modified: Option[Long], deleted: Option[Long], 
                title: String, description: Option[String], 
                content: Option[String],
                link: Option[String],
                area: Option[Boolean],
                visibility: Option[SharedItemVisibility],
                relationships: Option[ExtendedItemRelationships])
           extends ExtendedItem

object Note{
  def apply(title: String, description: Option[String], 
            content: Option[String],
            link: Option[String],
            relationships: Option[ExtendedItemRelationships]) 
        = new Note(None, None, None, title, description, content, 
                   link, None, None, relationships)
}