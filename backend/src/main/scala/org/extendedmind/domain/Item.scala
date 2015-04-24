/**
 * Copyright (c) 2013-2014 Extended Mind Technologies Oy
 *
 * This file is part of Extended Mind.
 *
 * Extended Mind is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

package org.extendedmind.domain

import java.util.UUID
import Validators._
import org.extendedmind.SetResult

case class Item(uuid: Option[UUID], id: Option[String], created: Option[Long], modified: Option[Long], deleted: Option[Long], 
                title: String, description: Option[String], link: Option[String]) extends ItemLike{
  if (id.isDefined) require(validateLength(id.get, 100), "Id can not be more than 100 characters")
  require(validateTitle(title), "Title can not be more than " + TITLE_MAX_LENGTH + " characters")
  if (description.isDefined) require(validateDescription(description.get), 
      "Description can not be more than " + DESCRIPTION_MAX_LENGTH + " characters")
  if (link.isDefined) require(validateLength(link.get, 2000), "Link can not be more than 2000 characters")
}

object Item{
  def apply(title: String, description: Option[String], 
            link: Option[String]) 
        = new Item(None, None, None, None, None, title, description, link)
}

case class Items(items: Option[scala.List[Item]], 
				 tasks: Option[scala.List[Task]],
				 notes: Option[scala.List[Note]],
				 lists: Option[scala.List[List]],
				 tags: Option[scala.List[Tag]])

case class SharedItemVisibility(public: Option[Long], collective: Option[UUID])
case class ExtendedItemRelationships(parent: Option[UUID], origin: Option[UUID], tags: Option[scala.List[UUID]])
case class LimitedExtendedItemRelationships(parent: Option[UUID], origin: Option[UUID])

case class DeleteItemResult(deleted: Long, result: SetResult)
case class DestroyResult(destroyed: scala.List[UUID])

trait ItemLike extends Container {
  val uuid: Option[UUID]
  val created: Option[Long]
  val modified: Option[Long]
  val deleted: Option[Long]
  val id: Option[String]
  val title: String
  val description: Option[String]
  val link: Option[String]
}

trait ShareableItem extends ItemLike{
  val uuid: Option[UUID]
  val created: Option[Long]
  val modified: Option[Long]
  val deleted: Option[Long]
  val title: String
  val description: Option[String]
  val link: Option[String]  
  val visibility: Option[SharedItemVisibility]
}

trait ExtendedItem extends ShareableItem{
  val uuid: Option[UUID]
  val created: Option[Long]  
  val modified: Option[Long]
  val deleted: Option[Long]
  val title: String
  val description: Option[String]
  val link: Option[String]
  val visibility: Option[SharedItemVisibility]
  val relationships: Option[ExtendedItemRelationships]
  val archived: Option[Long]
  
  def parent: Option[UUID] = {
    if (relationships.isDefined) relationships.get.parent
    else None
  }
  
  def tags: Option[scala.List[UUID]] = {
    if (relationships.isDefined) relationships.get.tags
    else None
  }
}