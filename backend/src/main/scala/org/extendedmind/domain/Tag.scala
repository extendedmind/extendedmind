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

// List of TagTypes
sealed abstract class TagType
case object KEYWORD extends TagType
case object CONTEXT extends TagType
case object HISTORY extends TagType

case class Tag(
      uuid: Option[UUID],
      id: Option[String], ui: Option[String],
      created: Option[Long], modified: Option[Long], deleted: Option[Long],
      title: String,
      description: Option[String],
      link: Option[String],
      tagType: Option[TagType], // This is always Some
      visibility: Option[SharedItemVisibility],
      parent: Option[UUID])
      extends ShareableItem{
  if (id.isDefined) require(validateLength(id.get, 100), "Id can not be more than 100 characters")
  if (ui.isDefined) require(validateLength(ui.get, 10000), "UI preferences max length is 10000")
  require(validateTitle(title), "Title can not be more than " + TITLE_MAX_LENGTH + " characters")
  if (description.isDefined) require(validateDescription(description.get),
      "Description can not be more than " + DESCRIPTION_MAX_LENGTH + " characters")
  if (link.isDefined) require(validateLength(link.get, 2000), "Link can not be more than 2000 characters")
}

object Tag{
  def apply(title: String, description: Option[String],
        link: Option[String],
            tagType: TagType,
            parent: Option[UUID])
        = new Tag(None, None, None, None, None, None, title, description, link, Some(tagType),
                   None, parent)
}