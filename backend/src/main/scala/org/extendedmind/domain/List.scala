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
import org.extendedmind.SetResult
import Validators._

case class List(
      uuid: Option[UUID], id: Option[String],  created: Option[Long], modified: Option[Long], deleted: Option[Long], archived: Option[Long],
      title: String, 
      description: Option[String], 
      link: Option[String],
      due: Option[String],
      assignee: Option[UUID],
      assigner: Option[UUID],
      visibility: Option[SharedItemVisibility],
      relationships: Option[ExtendedItemRelationships])
      extends ExtendedItem{
  if (id.isDefined) require(validateLength(id.get, 100), "Id can not be more than 100 characters")
  require(validateTitle(title), "Title can not be more than " + TITLE_MAX_LENGTH + " characters")
  if (description.isDefined) require(validateDescription(description.get), 
      "Description can not be more than " + DESCRIPTION_MAX_LENGTH + " characters")
  if (link.isDefined) require(validateLength(link.get, 2000), "Link can not be more than 2000 characters")
  if (due.isDefined) require(validateDateString(due.get), "Due date does not match pattern yyyy-MM-dd")
}

object List{
  def apply(title: String, description: Option[String],
		  	link: Option[String],
		  	due: Option[String],
            relationships: Option[ExtendedItemRelationships]) 
        = new List(None, None, None, None, None, None,  title, description, 
                   link, due, None, None, None, relationships)
}

case class ArchiveListResult(archived: Long, children: Option[scala.List[SetResult]], history: Tag, result: SetResult)