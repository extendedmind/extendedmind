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

case class Note(uuid: Option[UUID], created: Option[Long], modified: Option[Long], deleted: Option[Long], archived: Option[Long],
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
        = new Note(None, None, None, None, None, title, description, link, content, 
                   None, relationships)
}