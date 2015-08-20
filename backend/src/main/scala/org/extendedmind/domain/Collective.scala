/**
 * Copyright (c) 2013-2015 Extended Mind Technologies Oy
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

case class Collective(uuid: Option[UUID], created: Option[Long], modified: Option[Long], deleted: Option[Long],
                title: String, description: Option[String],
                displayName: Option[String], handle: Option[String], inboxId: Option[String], apiKey: Option[String],
                creator: Option[UUID], common: Option[Boolean])
           extends Container {
  require(validateTitle(title), "Title can not be more than " + TITLE_MAX_LENGTH + " characters")
  if (description.isDefined) require(validateDescription(description.get),
      "Description can not be more than " + DESCRIPTION_MAX_LENGTH + " characters")
  if (displayName.isDefined) require(validateLength(displayName.get, 256), "Display name can not be more than 256 characters")
  if (handle.isDefined){
    require(validateLength(handle.get, Validators.TITLE_MAX_LENGTH), "Handle can not be more than " + Validators.TITLE_MAX_LENGTH + " characters")
    require(handle.get.matches("""^[0-9a-z-]+$"""),
       "Handle can only contain numbers, lower case letters and dashes")
  }
}

object Collective{
  def apply(title: String, description: Option[String], displayName: Option[String], handle: Option[String])
        = new Collective(None, None, None, None, title, description, displayName, handle, None, None, None, None)
}