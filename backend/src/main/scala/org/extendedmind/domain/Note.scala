package org.extendedmind.domain

import java.util.UUID
import Validators._

case class Note(uuid: Option[UUID], modified: Option[Long], deleted: Option[Long], 
                title: String, description: Option[String], 
                content: Option[String],
                link: Option[String],
                area: Option[Boolean],
                visibility: Option[SharedItemVisibility],
                relationships: Option[ExtendedItemRelationships])
           extends ExtendedItem{
  require(validateLength(title, 64), "Note title can not be more than 64 characters")
  if (description.isDefined) require(validateLength(description.get, 256), "Note description can not be more than 256 characters")
}

object Note{
  def apply(title: String, description: Option[String], 
            content: Option[String],
            link: Option[String],
            relationships: Option[ExtendedItemRelationships]) 
        = new Note(None, None, None, title, description, content, 
                   link, None, None, relationships)
}