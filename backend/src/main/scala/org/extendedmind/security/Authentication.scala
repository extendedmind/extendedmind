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

case class UserPassRealm(user: String, pass: String, realm: String)
case class UserPassRemember(user: String, pass: String, payload: Option[AuthenticatePayload])
case class AuthenticatePayload(rememberMe: Boolean)

object Authentication{
  type UserPassRealmAuthenticator[T] = Option[UserPassRealm] => Future[Option[T]]
  type UserPassRememberAuthenticator[T] = Option[UserPassRemember] => Future[Option[T]]
    
  def securityContextResponseToOption(response: Response[SecurityContext]): Option[SecurityContext] = {
    response match {
      case Right(sc) => Some(sc)
      case Left(e) => processErrors(e)
    }
  }
}

import Authentication._

// Normal authentication

/**
 * The RealmHttpAuthenticator implements HTTP Basic Auth with realm included
 */
class RealmHttpAuthenticator[U](val realm: String, val userPassAuthenticator: UserPassRealmAuthenticator[U])(implicit val executionContext: ExecutionContext)
    extends HttpAuthenticator[U] {
  
  def authenticate(credentials: Option[HttpCredentials], ctx: RequestContext) = {
    userPassAuthenticator {
      credentials.flatMap {
        case BasicHttpCredentials(user, pass) => Some(UserPassRealm(user, pass, realm))
        case _                                => None
      }
    }
  }
  
  def getChallengeHeaders(httpRequest: HttpRequest) =
    `WWW-Authenticate`(HttpChallenge(scheme = "Basic", realm = realm, params = Map.empty)) :: Nil
}

trait ExtendedMindUserPassAuthenticator extends UserPassRealmAuthenticator[SecurityContext] {

  def db: GraphDatabase

  def apply(userPassRealm: Option[UserPassRealm]) = Promise.successful(
    userPassRealm match {
      case Some(UserPassRealm(user, pass, realm)) => {
        if (user == "token") {
          securityContextResponseToOption(db.authenticate(pass))
        } else if (realm == "secure") {
          securityContextResponseToOption(db.authenticate(user, pass))
        } else {
          // It is not possible to use username/password for other than "secure" realm methods
          None
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

class ExtendedMindAuthenticateUserPassAuthenticatorImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends ExtendedMindAuthenticateUserPassAuthenticator with Injectable {
  override def db = inject[GraphDatabase]
}

object ExtendedAuth {
  def apply[T](authenticator: UserPassRememberAuthenticator[T])
              (implicit ec: ExecutionContext): AuthenticateHttpAuthenticator[T] =
    new AuthenticateHttpAuthenticator[T]("authenticate", authenticator)

 def apply[T](authenticator: UserPassRealmAuthenticator[T], realm: String)
              (implicit ec: ExecutionContext): RealmHttpAuthenticator[T] =
    new RealmHttpAuthenticator[T](realm, authenticator)
}
