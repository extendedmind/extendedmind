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
import akka.event.LoggingAdapter
import scala.util.{Success, Failure}
import scala.concurrent.ExecutionContext
import akka.actor.ActorRefFactory
import akka.actor.ActorSystem
import java.util.UUID

trait UserActions {

  def db: GraphDatabase
  def mailgun: MailgunClient
  def settings: Settings

  def actorRefFactory: ActorRefFactory
  implicit val implicitActorRefFactory = actorRefFactory
  implicit val implicitExecutionContext = actorRefFactory.dispatcher 
  
  def signUp(signUp: SignUp)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("signUp: email {}", signUp.email)
    if (settings.signUpMode == MODE_ADMIN) 
      log.warning("CRITICAL: Making {} an administrator because extendedmind.security.signUpMode is set to ADMIN", 
          signUp.email)
    for {
      isUnique <- db.validateEmailUniqueness(signUp.email).right
      userResult <- db.putNewUser(User(signUp.email, signUp.cohort, None), signUp.password, settings.signUpMode).right
      sent <- if (userResult._2.isDefined)
                Right(sendEmailVerification(signUp.email, userResult._2.get)).right
              else Right(Unit).right
    } yield userResult._1
  }
  
  def sendEmailVerification(email: String, emailVerificationCode: Long)(implicit log: LoggingAdapter) {
    log.info("sendEmailVerification: email {}", email)
    val futureMailResponse = mailgun.sendEmailVerificationLink(email, emailVerificationCode)
    futureMailResponse onSuccess {
      case SendEmailResponse(message, id) => {
        log.info("Email verification sent to " + email + " with id " + id)
      }
      case _ =>
        log.error("Could not send email verification to {}", email)
    }
  }
  
  def getPublicUser(email: String)(implicit log: LoggingAdapter): Response[PublicUser] = {
    log.info("getPublicUser: email {}", email)
    val user = db.getUser(email)
    if (user.isLeft) Left(user.left.get)
    else Right(PublicUser(user.right.get.uuid.get))
  }
   
  def getUser(userUUID: UUID)(implicit log: LoggingAdapter): Response[User] = {
    log.info("getUser")
    db.getUser(userUUID)
  }
  
  def getUsers(implicit log: LoggingAdapter): Response[Users] = {
    log.info("getUsers")
    db.getUsers
  }
  
  def putUser(userUUID: UUID, user: User)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("putUser")
    db.putExistingUser(userUUID, user)
  }
  
  def deleteUser(userUUID: UUID)(implicit log: LoggingAdapter): Response[DeleteItemResult] = {
    log.info("deleteUser")
    val destroyTokensResult = db.destroyTokens(userUUID)
    if (destroyTokensResult.isLeft){
      Left(destroyTokensResult.left.get)
    }else{
      db.deleteUser(userUUID)
    }
  }
  
  def putEmail(userUUID: UUID, email: UserEmail)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("putEmail")
    db.changeUserEmail(userUUID, email.email) match {
      case Right(result) => {
        Right(result._1)
        // TODO
        // if (result._2)
        //   SEND EMAIL CONFIRMATION TO NEW ADDRESS! 
      }
      case Left(e) => Left(e)
    }
  }
  
  def changeUserType(userUUID: UUID, userType: Integer)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("changeUserType: type {}", userType)
    db.changeUserType(userUUID, userType)
  }
  
  def destroyUser(userUUID: UUID)(implicit log: LoggingAdapter): Response[DestroyResult] = {
    log.info("destroyUser: {}", userUUID)
    db.destroyUser(userUUID)
  }
  
  def subscribe(userUUID: UUID, subscription: Subscription)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("subscribe: {}", userUUID)
    Right(SetResult(None, None, 1))
  }
}

class UserActionsImpl(implicit val implSettings: Settings, implicit val inj: Injector, 
                      implicit val implActorRefFactory: ActorRefFactory)
  extends UserActions with Injectable {
  override def settings  = implSettings
  override def db = inject[GraphDatabase]
  override def mailgun = inject[MailgunClient]
  override def actorRefFactory = implActorRefFactory
}
