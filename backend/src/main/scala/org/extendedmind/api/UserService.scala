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
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getUser { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can get users for now
          authorize(adminAccess(securityContext)) {
            parameters("email") { email =>
              complete {
                Future[PublicUser] {
                  userActions.getPublicUser(email) match {
                    case Right(publicUser) => publicUser
                    case Left(e) => processErrors(e)
                  }
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
              userActions.getUser(securityContext.userUUID) match {
                case Right(user) => user
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      putAccount { url =>
        authenticate(ExtendedAuth(authenticator, "secure", None)) { securityContext =>
          entity(as[User]) { user =>
            complete {
              Future[SetResult] {
                userActions.putUser(securityContext.userUUID, user) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      }
  }
}
