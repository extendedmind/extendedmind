package org.extendedmind.domain

import java.util.UUID
import Validators._
import org.extendedmind.security.SecurityContext

case class InviteRequest(uuid: Option[UUID], email: String, emailId: Option[String]){
  require(validateEmailAddress(email), "Not a valid email address")
}
case class InviteRequests(inviteRequests: List[InviteRequest])

case class InviteRequestQueueNumber(queueNumber: Int)

case class InviteRequestAcceptDetails(message: String)

case class Invite(email: String, code: Long, accepted: Option[Long], message: Option[String], emailId: Option[String])

case class Invites(invites: List[Invite])
