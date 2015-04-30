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

package org.extendedmind.security

import scala.concurrent.Promise
import org.extendedmind.db.GraphDatabase
import spray.routing.authentication.UserPass
import spray.routing.authentication.UserPassAuthenticator
import org.extendedmind._
import org.extendedmind.domain._
import org.extendedmind.Response._
import scaldi.Injector
import scaldi.Injectable
import spray.routing.RequestContext
import scala.concurrent.ExecutionContext
import scala.concurrent.Future
import spray.routing.Rejection
import spray.routing.authentication.HttpAuthenticator
import spray.http.HttpCredentials
import spray.http.BasicHttpCredentials
import spray.http.HttpRequest
import spray.http.HttpHeaders._
import spray.http.HttpChallenge
import spray.json._
import spray.routing._
import DefaultJsonProtocol._
import java.lang.RuntimeException
import Authentication._
import java.util.UUID
import spray.util.LoggingContext

case class UserPassRealm(user: String, pass: String, realm: String, ownerUUID: Option[UUID])
case class UserPassRemember(user: String, pass: String, payload: Option[AuthenticatePayload])
case class AuthenticatePayload(rememberMe: Boolean, extended: Option[Boolean])
case class LogoutPayload(clearAll: Boolean)
case class NewPassword(password: String)

object Authentication{
  type UserPassRealmAuthenticator[T] = Option[UserPassRealm] => Future[Option[T]]
  type UserPassRememberAuthenticator[T] = Option[UserPassRemember] => Future[Option[T]]

  def securityContextResponseToOption(response: Response[SecurityContext])(implicit logErrors: scala.List[ResponseContent] => Unit): Option[SecurityContext] = {
    response match {
      case Right(sc) => Some(sc)
      case Left(e) => {
        // Don't expose the internals of what went wrong for security reasons
        logErrors(e)       
        if (e.exists{ rc => rc.code == ERR_BASE_ALREADY_LOGGED_IN.number}){
          throw new InvalidAuthenticationException(ERR_BASE_ALREADY_LOGGED_IN, "Authentication failed: user already logged in")          
        }else{
          throw new InvalidAuthenticationException(ERR_BASE_AUTHENTICATION_FAILED, "Authentication failed")
        }
      }
    }
  }
}

// Normal authentication

/**
 * The RealmHttpAuthenticator implements HTTP Basic Auth with realm included
 */
class RealmHttpAuthenticator[U](val realm: String, 
                                val userPassAuthenticator: UserPassRealmAuthenticator[U], 
                                val ownerUUID: Option[UUID])
    (implicit val executionContext: ExecutionContext)
    extends HttpAuthenticator[U] {
  
  def authenticate(credentials: Option[HttpCredentials], ctx: RequestContext) = {
    userPassAuthenticator {
      credentials.flatMap {
        case BasicHttpCredentials(user, pass) => Some(UserPassRealm(user, pass, realm, ownerUUID))
        case _                                => None
      }
    }
  }
  
  def getChallengeHeaders(httpRequest: HttpRequest) =
    `WWW-Authenticate`(HttpChallenge(scheme = "Basic", realm = realm, params = Map.empty)) :: Nil
}

trait ExtendedMindUserPassAuthenticator extends UserPassRealmAuthenticator[SecurityContext] {

  def db: GraphDatabase
  implicit val implLogErrors: scala.List[ResponseContent] => Unit

  def apply(userPassRealm: Option[UserPassRealm]) = Promise.successful(
    userPassRealm match {
      case Some(UserPassRealm(user, pass, realm, ownerUUID)) => {
        if (user == "token") {
          if (realm == "logout"){
            securityContextResponseToOption(db.logout(pass))
          }else if (realm =="shareable"){
            securityContextResponseToOption(db.authenticate(pass, ownerUUID, true))
          }else{
            // realm "user"
            securityContextResponseToOption(db.authenticate(pass, ownerUUID))
          }
        } else if (realm == "secure") {
          securityContextResponseToOption(db.authenticate(user, pass, ownerUUID))
        } else {
          // It is not possible to use username/password for other than "secure" realm methods
          None
        }
      }
      case None => None
    }).future
}

class ExtendedMindUserPassAuthenticatorImpl(implicit val settings: Settings, implicit val inj: Injector, implicit val logErrors: scala.List[ResponseContent] => Unit)
  extends ExtendedMindUserPassAuthenticator with Injectable {
  override implicit val implLogErrors = logErrors
  override def db = inject[GraphDatabase]
}

// Authentication for POST /authenticate

/**
 * The AuthenticateHttpAuthenticator implements HTTP Basic Auth with rememberMe value from POST data
 */
class AuthenticateHttpAuthenticator[U](val realm: String, val userPassAuthenticator: UserPassRememberAuthenticator[U])(implicit val executionContext: ExecutionContext)
    extends HttpAuthenticator[U] {
  
  def authenticate(credentials: Option[HttpCredentials], ctx: RequestContext) = {
    userPassAuthenticator {
      credentials.flatMap {
        case BasicHttpCredentials(user, pass) => 
                Some(UserPassRemember(user, pass, payload(ctx.request.entity)))
        case _                                => None
      }
    }
  }

  def payload(entity: spray.http.HttpEntity): Option[AuthenticatePayload] = {
    import org.extendedmind.api.JsonImplicits._
    if (entity.isEmpty){
      None
    }else{
      Some(entity.asString.asJson.convertTo[AuthenticatePayload])
    }
  }

  def getChallengeHeaders(httpRequest: HttpRequest) =
    `WWW-Authenticate`(HttpChallenge(scheme = "Basic", realm = realm, params = Map.empty)) :: Nil
}

trait ExtendedMindAuthenticateUserPassAuthenticator extends UserPassRememberAuthenticator[SecurityContext] {

  def db: GraphDatabase

  implicit val implLogErrors: scala.List[ResponseContent] => Unit

  def apply(userPassRemember: Option[UserPassRemember]) = Promise.successful(
    userPassRemember match {
      case Some(UserPassRemember(user, pass, payload)) => {
        if (user == "token") {
          securityContextResponseToOption(db.swapToken(pass, payload))
        } else {
          securityContextResponseToOption(db.generateToken(user, pass, payload))
        }
      }
      case None => None
    }).future
}

class ExtendedMindAuthenticateUserPassAuthenticatorImpl(implicit val settings: Settings, implicit val inj: Injector, implicit val logErrors: scala.List[ResponseContent] => Unit)
  extends ExtendedMindAuthenticateUserPassAuthenticator with Injectable {
  override implicit val implLogErrors = logErrors
  override def db = inject[GraphDatabase]
}

object ExtendedAuth {
  def apply[T](authenticator: UserPassRememberAuthenticator[T])
              (implicit ec: ExecutionContext): AuthenticateHttpAuthenticator[T] =
    new AuthenticateHttpAuthenticator[T]("authenticate", authenticator)

 def apply[T](authenticator: UserPassRealmAuthenticator[T], realm: String, ownerUUID: Option[UUID])
              (implicit ec: ExecutionContext): RealmHttpAuthenticator[T] =
    new RealmHttpAuthenticator[T](realm, authenticator, ownerUUID)
}
