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
import org.extendedmind.Response._
import scaldi.Injector
import scaldi.Injectable
import akka.event.LoggingAdapter
import org.extendedmind.security._
import java.util.UUID
import org.extendedmind.email.MailgunClient
import akka.actor.ActorRefFactory
import org.extendedmind.email.SendEmailResponse

trait SecurityActions {

  def db: GraphDatabase;
  def mailgun: MailgunClient
  def settings: Settings

  def actorRefFactory: ActorRefFactory
  implicit val implicitActorRefFactory = actorRefFactory
  implicit val implicitExecutionContext = actorRefFactory.dispatcher 
  
  def logout(userUUID: UUID, payload: Option[LogoutPayload])(implicit log: LoggingAdapter): Response[CountResult] = {
    log.info("logout: payload {}", payload)
    if (payload.isEmpty || payload.get.clearAll == false)
      Right(CountResult(1))
    else{
      db.destroyTokens(userUUID) match {
        case Right(deleteCount) => Right(CountResult(deleteCount.count + 1))
        case Left(e) => Left(e)
      }
    }
  }
  
  def changePassword(userUUID: UUID, newPassword: String)(implicit log: LoggingAdapter): Response[CountResult] = {
    log.info("changePassword")
    db.changePassword(userUUID, newPassword)
    db.destroyTokens(userUUID)
  }
  
  def forgotPassword(userEmail: UserEmail)(implicit log: LoggingAdapter): Response[ForgotPasswordResult] = {
    log.info("forgotPassword: user {}", userEmail.email)
    for {
      user <- db.getUser(userEmail.email).right
      result <- sendPasswordResetLink(user).right
    } yield result
  }
  
  def getPasswordResetExpires(code: Long, email: String)(implicit log: LoggingAdapter): Response[ForgotPasswordResult] = {
    log.info("getPasswordResetable: user {}", email)
    for {
      expires <- db.getPasswordResetExpires(code, email).right
    } yield ForgotPasswordResult(expires)
  }
  
  def resetPassword(code: Long, signUp: SignUp)(implicit log: LoggingAdapter): Response[CountResult] = {
    log.info("resetPassword: {}", signUp.email)
    val result = db.resetPassword(code, signUp)
    if (result.isRight){
      db.destroyTokens(result.right.get.uuid.get)
    }else{
      Left(result.left.get)
    }
  }
  
  def verifyEmail(code: Long, email: String)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("verifyEmail: {}", email)
    db.verifyEmail(code, email)
  }
  
  private def sendPasswordResetLink(user: User)(implicit log: LoggingAdapter): Response[ForgotPasswordResult] = {
    val resetCode = Random.generateRandomUnsignedLong
    val currentTime = System.currentTimeMillis
    val resetCodeValid = currentTime + db.PASSWORD_RESET_DURATION

    val futureMailResponse = mailgun.sendPasswordResetLink(user.email, resetCode)
    futureMailResponse onSuccess {
      case SendEmailResponse(message, id) => {
        val saveResponse = db.savePasswordResetInformation(user.uuid.get, resetCode, resetCodeValid, id)
        if (saveResponse.isLeft)
          log.error("Error saving password reset code for email {} with emailId {}, error: {}",
            user.email, id, saveResponse.left.get.head)
        else log.info("Saved reset code for email {} with emailId: {}",
          user.email, id)
      }
      case _ =>
        log.error("Could not send password reset email to {}", user.email)
    }
    Right(ForgotPasswordResult(resetCodeValid))
  }
  
}

class SecurityActionsImpl(implicit val implSettings: Settings, implicit val inj: Injector, 
                      implicit val implActorRefFactory: ActorRefFactory)
  extends SecurityActions with Injectable {
  override def settings  = implSettings
  override def db = inject[GraphDatabase]
  override def mailgun = inject[MailgunClient]
  override def actorRefFactory = implActorRefFactory
}
