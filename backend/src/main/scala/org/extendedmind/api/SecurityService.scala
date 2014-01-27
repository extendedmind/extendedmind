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
import MediaTypes._

trait SecurityService extends ServiceBase {

  import JsonImplicits._
  
  def securityRoutes = {
      postAuthenticate { url =>
        authenticate(ExtendedAuth(authenticateAuthenticator)) { securityContext =>
          complete {
            securityContext
          }
        }
      } ~
      postLogout { url =>
        authenticate(ExtendedAuth(authenticator, "logout", None)) { securityContext =>
          entity(as[Option[LogoutPayload]]) { payload =>
            complete {
              Future[CountResult] {
                securityActions.logout(securityContext.userUUID, payload) match {
                  case Right(deleteCount) => deleteCount
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putChangePassword { url =>
        authenticate(ExtendedAuth(authenticator, "secure", None)) { securityContext =>
          entity(as[NewPassword]) { newPassword =>
            complete {
              Future[CountResult] {
                securityActions.changePassword(securityContext.userUUID, newPassword.password) match {
                  case Right(count) => count
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      postForgotPassword { url =>
        entity(as[UserEmail]) { userEmail =>
          complete {
            Future[ForgotPasswordResult] {
              securityActions.forgotPassword(userEmail) match {
                case Right(result) => result
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }
  }

}
