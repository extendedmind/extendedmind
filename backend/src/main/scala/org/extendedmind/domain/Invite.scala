package org.extendedmind.domain

import java.util.UUID
import Validators._
import org.extendedmind.security.SecurityContext
import org.extendedmind.SetResult

sealed abstract class InviteRequestResultType
case object NEW_INVITE_REQUEST_RESULT extends InviteRequestResultType
case object INVITE_REQUEST_RESULT extends InviteRequestResultType
case object INVITE_RESULT extends InviteRequestResultType
case object USER_RESULT extends InviteRequestResultType

case class InviteRequest(uuid: Option[UUID], email: String, emailId: Option[String]){
  require(validateEmailAddress(email), "Not a valid email address")
}
case class InviteRequests(inviteRequests: scala.List[InviteRequest])

case class InviteRequestQueueNumber(queueNumber: Int)

case class InviteRequestAcceptDetails(message: String)

case class Invite(email: String, code: Long, accepted: Option[Long], message: Option[String], emailId: Option[String])

case class Invites(invites: scala.List[Invite])

case class InviteRequestResult(resultType: InviteRequestResultType, result: Option[SetResult], queueNumber: Option[Int])