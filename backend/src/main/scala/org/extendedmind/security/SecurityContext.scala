/**
 * Copyright (c) 2013-2017 Extended Mind Technologies Oy
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

package org.extendedmind.security

import java.util.UUID
import org.neo4j.graphdb.Node
import org.extendedmind.domain.OwnerPreferences

case class SecurityContext(userUUID: UUID,
               userType: Byte,
               subscription: Option[String],
               created: Long,
               modified: Long,
               emailVerified: Option[Long],
               cohort: Option[Int],
               inboxId: Option[String],
               displayName: Option[String],
               handle: Option[String],
               token: Option[String],
               authenticated: Option[Long],
               expires: Option[Long],
               replaceable: Option[Long],
               collectives: Option[Map[UUID,(String, Byte, Boolean, Option[String])]],
               sharedLists: Option[Map[UUID,(String, Map[UUID, (String, Byte)])]],
               preferences: Option[OwnerPreferences]){
  // Tweak that helps skip one database call when creating a token
  @transient var user: Node = null
}

object SecurityContext{
  val FOUNDER: Byte = 0
  val READ: Byte = 1
  val READ_WRITE: Byte = 2
  val POSSIBLE_LIST: Byte = 3
}
