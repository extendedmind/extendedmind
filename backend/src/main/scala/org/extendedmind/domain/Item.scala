/**
 * Copyright (c) 2013-2016 Extended Mind Technologies Oy
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

case class Item(uuid: Option[UUID], id: Option[String], ui: Option[String], created: Option[Long], modified: Option[Long], deleted: Option[Long],
                title: String, description: Option[String], link: Option[String], creator: Option[UUID]) extends ItemLike{
  if (id.isDefined) require(validateLength(id.get, 100), "Id can not be more than 100 characters")
  if (ui.isDefined) require(validateLength(ui.get, 10000), "UI preferences max length is 10000")
  require(validateTitle(title), "Title can not be more than " + TITLE_MAX_LENGTH + " characters")
  if (description.isDefined) require(validateDescription(description.get),
      "Description can not be more than " + DESCRIPTION_MAX_LENGTH + " characters")
  if (link.isDefined) require(validateLength(link.get, 2000), "Link can not be more than 2000 characters")
}

object Item{
  def apply(title: String, description: Option[String],
            link: Option[String])
        = new Item(None, None, None, None, None, None, title, description, link, None)
}

case class AssignedItems(
   collective: UUID,
   tasks: Option[scala.List[Task]],
   notes: Option[scala.List[Note]],
   lists: Option[scala.List[List]])

case class Items(items: Option[scala.List[Item]],
         tasks: Option[scala.List[Task]],
         notes: Option[scala.List[Note]],
         lists: Option[scala.List[List]],
         tags: Option[scala.List[Tag]],
         assigned: Option[scala.List[AssignedItems]])

case class SharedItemVisibility(published: Option[Long], path: Option[String], licence: Option[String],
                                publishedRevision: Option[Long], shortId: Option[String], publicUi: Option[String],
                                reviewed: Option[Long],
                                preview: Option[String], previewExpires: Option[Long],
                                agreements: Option[scala.List[Agreement]])
case class ExtendedItemRelationships(parent: Option[UUID], origin: Option[UUID], assignee: Option[UUID],
                                     assigner: Option[UUID], tags: Option[scala.List[UUID]], collectiveTags: Option[scala.List[(UUID, scala.List[UUID])]])
case class LimitedExtendedItemRelationships(parent: Option[UUID], origin: Option[UUID])

case class DeleteItemResult(deleted: Long, result: SetResult)
case class DestroyResult(destroyed: scala.List[UUID])

trait ItemLike extends Container {
  val uuid: Option[UUID]
  val created: Option[Long]
  val modified: Option[Long]
  val deleted: Option[Long]
  val id: Option[String]
  val ui: Option[String]
  val title: String
  val description: Option[String]
  val link: Option[String]
  val creator: Option[UUID]
}

trait ExtendedItem extends ItemLike{
  val visibility: Option[SharedItemVisibility]
  val relationships: Option[ExtendedItemRelationships]
  val archived: Option[Long]
  val revision: Option[Long]

  def parent: Option[UUID] = {
    if (relationships.isDefined) relationships.get.parent
    else None
  }

  def ownerTags: Option[scala.List[UUID]] = {
    if (relationships.isDefined) relationships.get.tags
    else None
  }

  def collectiveTags: Option[scala.List[(UUID, scala.List[UUID])]] = {
    if (relationships.isDefined) relationships.get.collectiveTags
    else None
  }
}

case class ExtendedItemChoice(task: Option[Task], note: Option[Note], list: Option[List])

object ExtendedItemChoice{
  def apply(task: Task)
        = new ExtendedItemChoice(Some(task), None, None)
  def apply(note: Note)
        = new ExtendedItemChoice(None, Some(note), None)
  def apply(list: List)
        = new ExtendedItemChoice(None, None, Some(list))
}

trait LimitedExtendedItem extends ItemLike{
  val relationships: LimitedExtendedItemRelationships

  def parent: Option[UUID] = relationships.parent
}

case class ItemRevision(uuid: Option[UUID], created: Option[Long], modified: Option[Long],
                        number: Long,
                        itemType: Option[String],
                        published: Option[Long],
                        unpublished: Option[Long],
                        format: Option[String],
                        licence: Option[String],
                        path: Option[String],
                        creator: Option[UUID])
case class ItemRevisions(revisions: Option[scala.List[ItemRevision]])

case class NodeStatistics(properties: scala.List[(String, Long)], labels: scala.List[String])
case class NodeProperty(key: String, stringValue: Option[String], longValue: Option[Long])

// Owner is the display name of the owner, and assignee is the display name of the person the note is assigned to
case class PublicItem(owner: String, note: Note,
                      tags: Option[scala.List[Tag]],
                      collectiveTags: Option[scala.List[(UUID, scala.List[Tag])]],
                      assignee: Option[Assignee])
case class PublicItemHeader(handle: String, path: Option[String])

case class PublicItems(owner: Option[String], content: Option[String], format: Option[String], modified: Option[Long],
                       notes: Option[scala.List[Note]],
                       tags: Option[scala.List[Tag]],
                       collectiveTags: Option[scala.List[(UUID, scala.List[Tag])]],
                       assignees: Option[scala.List[Assignee]],
                       unpublished: Option[scala.List[UUID]])

case class PublicOwnerItemHeader(path: String, title: String, tags: Option[scala.List[Tag]])
case class PublicOwnerStats(handle: String, displayName: String, notes: scala.List[PublicOwnerItemHeader])
case class PublicStats(users: Option[scala.List[PublicOwnerStats]], collectives: Option[scala.List[PublicOwnerStats]])