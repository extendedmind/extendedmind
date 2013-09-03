package org.extendedmind.domain

import java.util.UUID

// List of TagTypes
sealed abstract class TagType
case object KEYWORD extends TagType
case object CONTEXT extends TagType

case class Tag(
      uuid: Option[UUID], modified: Option[Long], deleted: Option[Long],
      title: String, 
      description: Option[String], 
      tagType: Option[TagType], // This is always Some 
      link: Option[String],
      visibility: Option[SharedItemVisibility],
      parent: Option[UUID])
      extends ShareableItem

object Tag{
  def apply(title: String, description: Option[String], 
            tagType: TagType,
            link: Option[String],
            parent: Option[UUID]) 
        = new Tag(None, None, None, title, description, Some(tagType), 
                   link, None, parent)
}