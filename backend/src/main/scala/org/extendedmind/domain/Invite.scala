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

// List of FormatTypes
object InviteStatus extends Enumeration {
  type InviteStatus = Value
  val PENDING = Value("pending")
  val ACCEPTED = Value("accepted") // accepted invite
  val JOINED = Value("joined") // joined by herself, did not use this invite
}

case class Invite(
      uuid: Option[UUID], created: Option[Long], modified: Option[Long],
      email: String,
      emailId: Option[String],
      message: Option[String],
      status: Option[String],
      code: Option[Long],
      accepted: Option[Long],
      invitee: Option[UUID]){
  require(validateEmailAddress(email), "Not a valid email address")
  if (emailId.isDefined) require(validateLength(emailId.get, 100), "Email id max length is 100")
  if (message.isDefined) require(validateDescription(message.get),
      "Message can not be more than " + DESCRIPTION_MAX_LENGTH + " characters")
  if (status.isDefined) require(
      try {
        val inviteStatus = InviteStatus.withName(status.get)
        true
      }catch {
        case _:Throwable => false
      },
      "Expected 'pending', 'accepted' or 'joined' but got " + status.get)
}

object Invite{
  def apply(email: String, message: Option[String])
        = new Invite(None, None, None, email, None, message, None, None, None, None)
}

case class Invites(invites: scala.List[Invite])