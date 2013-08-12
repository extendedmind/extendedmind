package org.extendedmind.security

import scala.concurrent.Promise
import org.extendedmind.db.GraphDatabase
import spray.routing.authentication.UserPass
import spray.routing.authentication.UserPassAuthenticator
import org.extendedmind.Settings
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
import DefaultJsonProtocol._
import java.lang.RuntimeException

// Normal authentication

class TokenExpiredException extends RuntimeException

trait ExtendedMindUserPassAuthenticator extends UserPassAuthenticator[SecurityContext] {

  def db: GraphDatabase

  def apply(userPass: Option[UserPass]) = Promise.successful(
    userPass match {
      case Some(UserPass(user, pass)) => {
        if (user == "token") {
          throw new TokenExpiredException
          //new TokenExpiredRejection
          // TODO: Reject with 419 if token has expired
          //db.authenticate(pass)
        } else {
          db.authenticate(user, pass)
        }
      }
      case None => None
    }).future
}

class ExtendedMindUserPassAuthenticatorImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends ExtendedMindUserPassAuthenticator with Injectable {
  override def db = inject[GraphDatabase]
}

// Authentication for POST /authenticate

case class UserPassRemember(user: String, pass: String, payload: AuthenticatePayload)
case class AuthenticatePayload(rememberMe: Boolean)

object Authentication{
  type UserPassRememberAuthenticator[T] = Option[UserPassRemember] => Future[Option[T]]
}

import Authentication._

/**
 * The ExtendedHttpAuthenticator implements HTTP Basic Auth with rememberMe value from POST data
 */
class ExtendedHttpAuthenticator[U](val realm: String, val userPassAuthenticator: UserPassRememberAuthenticator[U])(implicit val executionContext: ExecutionContext)
    extends HttpAuthenticator[U] {

  implicit val implAuthenticatePayload = jsonFormat1(AuthenticatePayload)
  
  def authenticate(credentials: Option[HttpCredentials], ctx: RequestContext) = {
    userPassAuthenticator {
      credentials.flatMap {
        case BasicHttpCredentials(user, pass) => 
                Some(UserPassRemember(user, pass, 
                  ctx.request.entity.asString.asJson.convertTo[AuthenticatePayload]))
        case _                                => None
      }
    }
  }

  def getChallengeHeaders(httpRequest: HttpRequest) =
    `WWW-Authenticate`(HttpChallenge(scheme = "Basic", realm = realm, params = Map.empty)) :: Nil
}

trait ExtendedMindAuthenticateUserPassAuthenticator extends UserPassRememberAuthenticator[SecurityContext] {

  def db: GraphDatabase

  def apply(userPassRemember: Option[UserPassRemember]) = Promise.successful(
    userPassRemember match {
      case Some(UserPassRemember(user, pass, payload)) => {
        if (user == "token") {
          throw new TokenExpiredException
          //new TokenExpiredRejection
          // TODO: Reject with 419 if token has expired
          //db.authenticate(pass)
        } else {
          db.authenticate(user, pass)
        }
      }
      case None => None
    }).future
}

class ExtendedMindAuthenticateUserPassAuthenticatorImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends ExtendedMindAuthenticateUserPassAuthenticator with Injectable {
  override def db = inject[GraphDatabase]
}

object ExtendedAuth {
  def apply[T](authenticator: UserPassRememberAuthenticator[T], realm: String)
              (implicit ec: ExecutionContext): ExtendedHttpAuthenticator[T] =
    new ExtendedHttpAuthenticator[T](realm, authenticator)
}
