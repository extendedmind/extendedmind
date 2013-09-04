package org.extendedmind.domain

import java.util.UUID

case class Item(uuid: Option[UUID], modified: Option[Long], deleted: Option[Long], 
                title: String, description: Option[String])
  extends ItemLike

case class Items(items: Option[List[Item]], tasks: Option[List[Task]], notes: Option[List[Note]], tags: Option[List[Tag]])

case class SharedItemVisibility(public: Option[Long], collective: Option[UUID])
case class ExtendedItemRelationships(parentTask: Option[UUID], parentNote: Option[UUID], tags: Option[List[UUID]])

trait ItemLike extends Container {
  val uuid: Option[UUID]
  val modified: Option[Long]
  val deleted: Option[Long]
  val title: String
  val description: Option[String]}

trait ShareableItem extends ItemLike{
  val uuid: Option[UUID]
  val modified: Option[Long]
  val deleted: Option[Long]
  val title: String
  val description: Option[String]
  val visibility: Option[SharedItemVisibility]
}

trait ExtendedItem extends ShareableItem{
  val uuid: Option[UUID]
  val modified: Option[Long]
  val deleted: Option[Long]
  val title: String
  val description: Option[String]
  val visibility: Option[SharedItemVisibility]
  val relationships: Option[ExtendedItemRelationships]
  
  def parentTask: Option[UUID] = {
    if (relationships.isDefined) relationships.get.parentTask
    else None
  }
  
  def parentNote: Option[UUID] = {
    if (relationships.isDefined) relationships.get.parentNote
    else None
  }
  def tags: Option[List[UUID]] = {
    if (relationships.isDefined) relationships.get.tags
    else None
  }
}