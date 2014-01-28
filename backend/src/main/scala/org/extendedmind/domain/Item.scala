package org.extendedmind.domain

import java.util.UUID
import Validators._
import org.extendedmind.SetResult

case class Item(uuid: Option[UUID], modified: Option[Long], deleted: Option[Long], 
                title: String, description: Option[String], link: Option[String]) extends ItemLike{
  require(validateTitle(title), "Title can not be more than " + TITLE_MAX_LENGTH + " characters")
  if (description.isDefined) require(validateDescription(description.get), 
      "Description can not be more than " + DESCRIPTION_MAX_LENGTH + " characters")
}

object Item{
  def apply(title: String, description: Option[String], 
            link: Option[String]) 
        = new Item(None, None, None, title, description, link)
}

case class Items(items: Option[scala.List[Item]], 
				 tasks: Option[scala.List[Task]],
				 notes: Option[scala.List[Note]],
				 lists: Option[scala.List[List]],
				 tags: Option[scala.List[Tag]])

case class SharedItemVisibility(public: Option[Long], collective: Option[UUID])
case class ExtendedItemRelationships(parent: Option[UUID], origin: Option[UUID], tags: Option[scala.List[UUID]])
case class DeleteItemResult(deleted: Long, result: SetResult)
case class DestroyResult(destroyed: scala.List[UUID])

trait ItemLike extends Container {
  val uuid: Option[UUID]
  val modified: Option[Long]
  val deleted: Option[Long]
  val title: String
  val description: Option[String]
  val link: Option[String]
}

trait ShareableItem extends ItemLike{
  val uuid: Option[UUID]
  val modified: Option[Long]
  val deleted: Option[Long]
  val title: String
  val description: Option[String]
  val link: Option[String]  
  val visibility: Option[SharedItemVisibility]
}

trait ExtendedItem extends ShareableItem{
  val uuid: Option[UUID]
  val modified: Option[Long]
  val deleted: Option[Long]
  val title: String
  val description: Option[String]
  val link: Option[String]  
  val visibility: Option[SharedItemVisibility]
  val relationships: Option[ExtendedItemRelationships]
  
  def parent: Option[UUID] = {
    if (relationships.isDefined) relationships.get.parent
    else None
  }
  
  def tags: Option[scala.List[UUID]] = {
    if (relationships.isDefined) relationships.get.tags
    else None
  }
}