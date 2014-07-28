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

package org.extendedmind.bl

import org.extendedmind.domain._
import org.extendedmind.db._
import org.extendedmind._
import org.extendedmind.email._
import org.extendedmind.security._
import org.extendedmind.Response._
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.db.EmbeddedGraphDatabase
import scala.util.{Success, Failure}
import scala.concurrent.ExecutionContext
import akka.actor.ActorRefFactory
import akka.actor.ActorSystem
import akka.event.LoggingAdapter
import java.util.UUID

trait InviteActions {

  def db: GraphDatabase
  def mailgun: MailgunClient
  def settings: Settings

  def actorRefFactory: ActorRefFactory
  implicit val implicitActorRefFactory = actorRefFactory
  implicit val implicitExecutionContext = actorRefFactory.dispatcher 
    
  def requestInvite(inviteRequest: InviteRequest)(implicit log: LoggingAdapter): Response[InviteRequestResult] = {
    log.info("requestInvite: email {}", inviteRequest.email)
    val inviteRequestResult = db.postInviteRequest(inviteRequest)
    if (inviteRequestResult.isRight) {
      // Send invite request email for new invites, if not automatic signup and requesting bypass
      if (inviteRequestResult.right.get.resultType == NEW_INVITE_REQUEST_RESULT
        && (settings.signUpMethod != SIGNUP_INVITE_AUTOMATIC
          && (inviteRequest.bypass.isEmpty || (inviteRequest.bypass.isDefined && !inviteRequest.bypass.get)))) {
        val futureMailResponse = mailgun.sendRequestInviteConfirmation(inviteRequest.email, inviteRequestResult.right.get.result.get.uuid.get)
        futureMailResponse onSuccess {
          case SendEmailResponse(message, id) => {
            val saveResponse = for {
              putExistingResponse <- db.putExistingInviteRequest(inviteRequestResult.right.get.result.get.uuid.get,
                inviteRequest.copy(emailId = Some(id))).right
              updateResponse <- Right(db.updateInviteRequestModifiedIndex(putExistingResponse._2,
                putExistingResponse._3)).right
            } yield putExistingResponse._1
            if (saveResponse.isLeft)
              log.error("Error updating invite request for email {} with id {}, error: {}",
                inviteRequest.email, id, saveResponse.left.get.head)
            else log.info("Saved invite request with email: {} and UUID: {} to emailId: {}",
              inviteRequest.email, inviteRequestResult.right.get.result.get.uuid.get, id)
          } case _ =>
            log.error("Could not send invite request confirmation email to {}", inviteRequest.email)
        }
      }
      
      if (inviteRequest.bypass.isDefined && inviteRequest.bypass.get && 
          (inviteRequestResult.right.get.resultType == NEW_INVITE_REQUEST_RESULT 
           || inviteRequestResult.right.get.resultType == INVITE_REQUEST_RESULT)) {
        // Bypass logic
        if (settings.signUpMethod == SIGNUP_INVITE_AUTOMATIC) {
          return Right(inviteRequestResult.right.get.copy(resultType = INVITE_AUTOMATIC_RESULT))
        } else if (settings.signUpMethod == SIGNUP_INVITE_COUPON) {
          return Right(inviteRequestResult.right.get.copy(resultType = INVITE_COUPON_RESULT))
        }
      }
    }
    inviteRequestResult
  }

  def bypassInvite(inviteRequestUUID: UUID, coupon: Option[String])(implicit log: LoggingAdapter): Response[(SetResult, Invite)] = {
    // Bypass logic
    if (settings.signUpMethod == SIGNUP_INVITE_AUTOMATIC) {
      // Create new invite, skip sending email
	  this.acceptInviteRequest(None, inviteRequestUUID, None, true)
    } else if (settings.signUpMethod == SIGNUP_INVITE_COUPON && settings.signUpCoupon.isDefined) {
      if (coupon.isEmpty) {
        fail(INVALID_PARAMETER, "coupon required")
      }else if (coupon.get != settings.signUpCoupon.get){
        fail(INVALID_PARAMETER, "invalid coupon")
      }else{
        // Create new invite without email
        this.acceptInviteRequest(None, inviteRequestUUID, None, true)
      }
    } else {
      fail(INVALID_PARAMETER, "bypassing invite not enabled")
    }
  }

  def putNewInviteRequest(inviteRequest: InviteRequest)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("putNewInviteRequest: {}", inviteRequest)
    for {
      isUnique <- db.validateEmailUniqueness(inviteRequest.email).right
      setResult <- db.putNewInviteRequest(inviteRequest).right
      uuidResult <- db.forceUUID(setResult, inviteRequest.uuid, MainLabel.REQUEST).right
    } yield uuidResult
  }

  def getInviteRequests()(implicit log: LoggingAdapter): Response[InviteRequests] = {
    log.info("getInviteRequests")
    db.getInviteRequests
  }

  def getInvites()(implicit log: LoggingAdapter): Response[Invites] = {
    log.info("getInvites")
    db.getInvites
  }

  def getInviteRequestQueueNumber(inviteRequestUUID: UUID)(implicit log: LoggingAdapter): Response[InviteRequestQueueNumber] = {
    log.info("getInviteRequestQueueNumber for UUID {}", inviteRequestUUID)
    db.getInviteRequestQueueNumber(inviteRequestUUID)
  }

  def getInvite(code: Long, email: String)(implicit log: LoggingAdapter): Response[Invite] = {
    log.info("getInvite for code {}, email {}", code, email)
    db.getInvite(code, email)
  }

  def acceptInviteRequest(userUUID: Option[UUID], inviteRequestUUID: UUID, details: Option[InviteRequestAcceptDetails],
    skipEmail: Boolean = false)(implicit log: LoggingAdapter): Response[(SetResult, Invite)] = {
    log.info("acceptInviteRequest: request {}", inviteRequestUUID)

    val acceptResult = db.acceptInviteRequest(userUUID, inviteRequestUUID,
      if (details.isDefined) details.get.message else None)

    if (acceptResult.isRight && !skipEmail) {
      val invite = acceptResult.right.get._2
      val futureMailResponse = mailgun.sendInvite(invite)
      futureMailResponse onSuccess {
        case SendEmailResponse(message, id) => {
          val saveResponse = db.putExistingInvite(acceptResult.right.get._1.uuid.get,
            invite.copy(emailId = Some(id)))
          if (saveResponse.isLeft)
            log.error("Error updating invite for email {} with id {}, error: {}",
              invite.email, id, saveResponse.left.get.head)
          else log.info("Accepted invite request with email: {} and UUID: {} with emailId: {}",
            invite.email, acceptResult.right.get._1.uuid.get, id)
        }
        case _ =>
          log.error("Could not send invite email to {}", invite.email)
      }
    }
    acceptResult
  }
  
  def resendInviteEmail(inviteUUID: UUID, email: String)(implicit log: LoggingAdapter): Response[CountResult] = {
    log.info("resendInviteEmail: invite {} email {}", inviteUUID, email)
    
    val invite = db.getInvite(inviteUUID, email)
    if (invite.isRight){
      val futureMailResponse = mailgun.sendInvite(invite.right.get)
      futureMailResponse onSuccess {
        case SendEmailResponse(message, id) => {
          val saveResponse = db.putExistingInvite(inviteUUID,
            invite.right.get.copy(emailId = Some(id)))
          if (saveResponse.isLeft)
            log.error("Error updating resent invite for email {} with id {}, error: {}",
              invite.right.get.email, id, saveResponse.left.get.head)
          else log.info("Resent invite with email: {} and UUID: {} with emailId: {}",
            invite.right.get.email, inviteUUID, id)
        }
        case _ =>
          log.error("Could not send invite email to {}", invite.right.get.email)
      }
      Right(CountResult(1))
    }else{
      Left(invite.left.get)
    }
  }

  def acceptInvite(code: Long, signUp: SignUp)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("acceptInvite for code {}, email {}, with signUpMode {}", code, signUp.email, settings.signUpMode)
    val acceptResult = db.acceptInvite(signUp, code, settings.signUpMode)
    if (acceptResult.isLeft){
      Left(acceptResult.left.get)
    }else{
      if (acceptResult.right.get._2.isDefined){
        // Send verification email
	    val futureMailResponse = mailgun.sendEmailVerificationLink(signUp.email, acceptResult.right.get._2.get)
	    futureMailResponse onSuccess {
	      case SendEmailResponse(message, id) => {
	        log.info("Accept invite email verification sent to " + signUp.email + " with id " + id)
	      }
	      case _ =>
	        log.error("Could not send accept invite email verification to {}", signUp.email)
	    }
      }
      Right(acceptResult.right.get._1)
    }
  }

  def destroyInviteRequest(inviteRequstUUID: UUID)(implicit log: LoggingAdapter): Response[DestroyResult] = {
    log.info("destroyInviteRequest: request {}", inviteRequstUUID)
    db.destroyInviteRequest(inviteRequstUUID)
  }
}

class InviteActionsImpl(implicit val implSettings: Settings, implicit val inj: Injector,
  implicit val implActorRefFactory: ActorRefFactory)
  extends InviteActions with Injectable {
  override def settings = implSettings
  override def db = inject[GraphDatabase]
  override def mailgun = inject[MailgunClient]
  override def actorRefFactory = implActorRefFactory
}
