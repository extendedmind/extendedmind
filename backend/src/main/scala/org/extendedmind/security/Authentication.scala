package org.extendedmind.security

import scala.concurrent.Promise
import org.extendedmind.db.GraphDatabase
import spray.routing.authentication.UserPass
import spray.routing.authentication.UserPassAuthenticator
import spray.routing.authentication.Authentication
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


case class TokenExpiredRejection extends Rejection
case class UserPassRemember(user: String, pass: String, remember: Boolean)


object Authentication{
  type UserPassRememberAuthenticator[T] = Option[UserPassRemember] => Future[Either[Rejection, T]]
}

/**
 * The ExtendedHttpAuthenticator implements HTTP Basic Auth with rememberMe value from POST data
 */
class ExtendedHttpAuthenticator[U](val realm: String, val userPassAuthenticator: Authentication.UserPassRememberAuthenticator[U])(implicit val executionContext: ExecutionContext)
    extends HttpAuthenticator[U] {

  def authenticate(credentials: Option[HttpCredentials], ctx: RequestContext) = {
    userPassAuthenticator {
      credentials.flatMap {
        case BasicHttpCredentials(user, pass) => Some(UserPassRemember(user, pass, ctx.request.entity.asString == "{\"remember\"}"))
        case _                                => None
      }
    }
  }

  def getChallengeHeaders(httpRequest: HttpRequest) =
    `WWW-Authenticate`(HttpChallenge(scheme = "Basic", realm = realm, params = Map.empty)) :: Nil
}

trait ExtendedMindUserPassAuthenticator extends UserPassAuthenticator[SecurityContext] {

  def db: GraphDatabase

  def apply(userPass: Option[UserPass]) = Promise.successful(
    userPass match {
      case Some(UserPass(user, pass)) => {
        if (user == "token") {
          //new TokenExpiredRejection
          // TODO: Reject with 419 if token has expired
          db.authenticate(pass)
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