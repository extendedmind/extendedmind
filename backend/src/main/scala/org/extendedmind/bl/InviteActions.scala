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

package org.extendedmind.bl

import org.extendedmind.domain._
import org.extendedmind.db._
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.domain.Item
import java.util.UUID
import org.extendedmind._
import org.extendedmind.Response._
import akka.actor.ActorRefFactory
import akka.event.LoggingAdapter
import org.extendedmind.email.MailgunClient
import org.extendedmind.email.SendEmailResponse
import org.extendedmind.security.Random

trait InviteActions {

  def db: GraphDatabase;
  def mailgun: MailgunClient
  def settings: Settings

  def actorRefFactory: ActorRefFactory
  implicit val implicitActorRefFactory = actorRefFactory
  implicit val implicitExecutionContext = actorRefFactory.dispatcher

  def putNewInvite(owner: Owner, invite: Invite)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("putNewInvite")
    for {
      inviteResult <- db.putNewInvite(owner, invite).right
      sent <- Right(sendInviteEmail(owner, invite, inviteResult._2)).right
    } yield inviteResult._1
  }

  def resendInvite(owner: Owner, inviteUUID: UUID)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("resendInvite")
    // TODO: send email
    fail(INTERNAL_SERVER_ERROR, ERR_BASE_UNKNOWN, "Not implemented")
  }

  def deleteInvite(owner: Owner, inviteUUID: UUID)(implicit log: LoggingAdapter): Response[DestroyResult] = {
    log.info("deleteInvite")
    db.destroyInvite(owner, inviteUUID)
  }

  def getInvites(owner: Owner)(implicit log: LoggingAdapter): Response[Invites] = {
    log.info("getInvites")
    db.getInvites(owner)
  }

  private def sendInviteEmail(owner: Owner, invite: Invite, displayOwner: String)(implicit log: LoggingAdapter): Response[CountResult] = {
    if (invite.accepted.isDefined){
      fail(INVALID_PARAMETER, ERR_INVITE_ACCEPTED, "Invite has already been accepted, no need to send email")
    }else{
      val acceptCode = Random.generateRandomUnsignedLong
      val inviteToSend = invite.copy(code = Some(acceptCode))
      val futureMailResponse = mailgun.sendInvite(inviteToSend, displayOwner)
      futureMailResponse onSuccess {
        case SendEmailResponse(message, id) => {
          val saveResponse = db.putExistingInvite(owner, inviteToSend.uuid.get,
              inviteToSend.copy(emailId = Some(id)))
          if (saveResponse.isLeft)
            log.error("Error saving invite details proposed to email {} with emailId {}, error: {}",
              inviteToSend.email, id, saveResponse.left.get.head)
          else log.info("Saved invite join code proposed to email {} with emailId: {}",
            inviteToSend.email, id)
        }
        case _ =>
          log.error("Could not send invite email proposed to {}", invite.email)
      }
      Right(CountResult(1))
    }
  }
}

class InviteActionsImpl(implicit val implSettings: Settings, implicit val inj: Injector,
                      implicit val implActorRefFactory: ActorRefFactory)
  extends InviteActions with Injectable {
  override def settings  = implSettings
  override def db = inject[GraphDatabase]
  override def mailgun = inject[MailgunClient]
  override def actorRefFactory = implActorRefFactory
}