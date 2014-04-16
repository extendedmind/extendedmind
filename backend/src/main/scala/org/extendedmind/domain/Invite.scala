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
case object USER_RESULT extends InviteRequestResultType

case class InviteRequest(uuid: Option[UUID], email: String, emailId: Option[String], bypass: Option[Boolean], modified: Option[Long]) {
  require(validateEmailAddress(email), "Not a valid email address")
}

case class InviteRequestQueueNumber(queueNumber: Int)

case class InviteRequestAcceptDetails(message: Option[String], bypass: Option[Boolean])

case class InviteBypass(inviteCoupon: Option[String])

case class Invite(uuid: Option[UUID], email: String, code: Long, accepted: Option[Long], message: Option[String], emailId: Option[String], modified: Option[Long])
case class InviteResult(email: String, code: String, accepted: Option[Long], message: Option[String], emailId: Option[String])

case class InviteRequestResult(resultType: InviteRequestResultType, result: Option[SetResult], queueNumber: Option[Int])