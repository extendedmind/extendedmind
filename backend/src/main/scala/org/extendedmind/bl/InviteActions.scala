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

  def getInvites()(implicit log: LoggingAdapter): Response[Invites] = {
    log.info("getInvites")
    db.getInvites
  }

  def getInvite(code: Long, email: String)(implicit log: LoggingAdapter): Response[Invite] = {
    log.info("getInvite for code {}, email {}", code, email)
    db.getInvite(code, email)
  }

  def resendInviteEmail(inviteUUID: UUID, email: String)(implicit log: LoggingAdapter): Response[CountResult] = {
    log.info("resendInviteEmail: invite {} email {}", inviteUUID, email)
    
    val invite = db.getInvite(inviteUUID, email)
    if (invite.isRight){
      val futureMailResponse = mailgun.sendListInvite(invite.right.get)
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

  def destroyInvite(inviteUUID: UUID)(implicit log: LoggingAdapter): Response[DestroyResult] = {
    log.info("destroyInvite: invite {}", inviteUUID)
    db.destroyInvite(inviteUUID)
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
