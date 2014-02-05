package org.extendedmind.domain

import java.util.UUID
import Validators._

// List of TagTypes
sealed abstract class TagType
case object KEYWORD extends TagType
case object CONTEXT extends TagType
case object HISTORY extends TagType

case class Tag(
      uuid: Option[UUID], modified: Option[Long], deleted: Option[Long],
      title: String, 
      description: Option[String], 
      link: Option[String],
      tagType: Option[TagType], // This is always Some 
      visibility: Option[SharedItemVisibility],
      parent: Option[UUID])
      extends ShareableItem{
  require(validateTitle(title), "Title can not be more than " + TITLE_MAX_LENGTH + " characters")
  if (description.isDefined) require(validateDescription(description.get), 
      "Description can not be more than " + DESCRIPTION_MAX_LENGTH + " characters")
}

object Tag{
  def apply(title: String, description: Option[String],
		  	link: Option[String],
            tagType: TagType,
            parent: Option[UUID]) 
        = new Tag(None, None, None, title, description, link, Some(tagType), 
                   None, parent)
}