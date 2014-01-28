package org.extendedmind.domain

import java.util.UUID
import Validators._

case class Note(uuid: Option[UUID], modified: Option[Long], deleted: Option[Long], archived: Option[Long],
                title: String, description: Option[String], 
                link: Option[String],
                content: Option[String],
                visibility: Option[SharedItemVisibility],
                relationships: Option[ExtendedItemRelationships])
           extends ExtendedItem{
  require(validateTitle(title), "Title can not be more than " + TITLE_MAX_LENGTH + " characters")
  if (description.isDefined) require(validateDescription(description.get), 
      "Description can not be more than " + DESCRIPTION_MAX_LENGTH + " characters")
  if (description.isDefined) require(validateLength(description.get, 256), "Note description can not be more than 256 characters")
}

object Note{
  def apply(title: String, description: Option[String], 
            link: Option[String],
            content: Option[String],
            relationships: Option[ExtendedItemRelationships]) 
        = new Note(None, None, None, None, title, description, link, content, 
                   None, relationships)
}