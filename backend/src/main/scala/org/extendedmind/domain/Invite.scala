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
import org.extendedmind.security.SecurityContext
import org.extendedmind.SetResult

sealed abstract class InviteRequestResultType
case object NEW_INVITE_REQUEST_RESULT extends InviteRequestResultType
case object INVITE_REQUEST_RESULT extends InviteRequestResultType
case object INVITE_RESULT extends InviteRequestResultType
case object INVITE_COUPON_RESULT extends InviteRequestResultType
case object INVITE_AUTOMATIC_RESULT extends InviteRequestResultType
case object SIGNUP_RESULT extends InviteRequestResultType
case object USER_RESULT extends InviteRequestResultType

case class Invite(uuid: Option[UUID], email: String, code: Long, accepted: Option[Long], message: Option[String], emailId: Option[String], modified: Option[Long])
case class InviteResult(email: String, code: String, accepted: Option[Long], message: Option[String], emailId: Option[String])