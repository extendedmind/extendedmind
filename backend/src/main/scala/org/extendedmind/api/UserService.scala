package org.extendedmind.api

import scala.concurrent.Future
import org.extendedmind._
import org.extendedmind.Response._
import org.extendedmind.bl._
import org.extendedmind.security._
import org.extendedmind.security.Authentication._
import org.extendedmind.security.Authorization._
import org.extendedmind.domain._
import org.extendedmind.domain.Owner._
import org.extendedmind.db._
import scaldi._
import spray.http._
import StatusCodes._
import spray.httpx.SprayJsonSupport._
import spray.json._
import spray.routing._
import AuthenticationFailedRejection._
import java.util.UUID
import spray.can.Http
import spray.util._
import scala.concurrent.duration._

trait UserService extends ServiceBase {
  
  import JsonImplicits._

  def userRoutes = {
      postSignUp { url =>
        authorize(settings.signUpMethod == SIGNUP_ON) {
          entity(as[SignUp]) { signUp =>
            complete {
              Future[SetResult] {
                userActions.signUp(signUp) match {
                  case Right(sr) => processResult(sr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getAccount { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          complete {
            Future[User] {
              setLogContext(securityContext)
              userActions.getUser(securityContext.userUUID) match {
                case Right(user) => processResult(user)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      putAccount { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          entity(as[User]) { user =>
            complete {
              Future[SetResult] {
                setLogContext(securityContext)
                userActions.putUser(securityContext.userUUID, user) match {
                  case Right(sr) => processResult(sr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putEmail { url =>
        authenticate(ExtendedAuth(authenticator, "secure", None)) { securityContext =>
          entity(as[UserEmail]) { email =>
            complete {
              Future[SetResult] {
                setLogContext(securityContext)
                userActions.putEmail(securityContext.userUUID, email) match {
                  case Right(sr) => processResult(sr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      }
  }
}
