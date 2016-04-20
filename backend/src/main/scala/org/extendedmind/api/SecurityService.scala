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
      v2PostAuthenticate { url =>
        authenticate(ExtendedAuth(authenticateAuthenticator)) { securityContext =>
          complete {
            setLogContext(securityContext)
            log.info("authenticate")
            processResult(securityContext)
          }
        }
      } ~
      v2PostLogout { url =>
        authenticate(ExtendedAuth(authenticator, "logout", None)) { securityContext =>
          entity(as[Option[LogoutPayload]]) { payload =>
            complete {
              Future[CountResult] {
                setLogContext(securityContext)
                securityActions.logout(securityContext.userUUID, payload) match {
                  case Right(deleteCount) => processResult(deleteCount)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      v2PostDestroyTokens { url =>
        authenticate(ExtendedAuth(authenticator, "secure", None)) { securityContext =>
          complete {
            Future[CountResult] {
              setLogContext(securityContext)
              securityActions.clear(securityContext.userUUID) match {
                case Right(deleteCount) => processResult(deleteCount)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      v2PostChangePassword { url =>
        authenticate(ExtendedAuth(authenticator, "secure", None)) { securityContext =>
          entity(as[NewPassword]) { newPassword =>
            complete {
              Future[CountResult] {
            	setLogContext(securityContext)
                securityActions.changePassword(securityContext.userUUID, newPassword.password) match {
                  case Right(count) => processResult(count)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      v2PostForgotPassword { url =>
        entity(as[UserEmail]) { userEmail =>
          complete {
            Future[ForgotPasswordResult] {
              securityActions.forgotPassword(userEmail) match {
                case Right(result) => processResult(result)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      v2GetPasswordResetExpires { code =>
        parameters("email") { email =>
          complete {
            Future[ForgotPasswordResult] {
              securityActions.getPasswordResetExpires(code, email) match {
                case Right(result) => result
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      v2PostResetPassword { url =>
        entity(as[PasswordReset]) { passwordReset =>
          complete {
            Future[CountResult] {
              securityActions.resetPassword(passwordReset.codeAsLong, passwordReset.email, passwordReset.password) match {
                case Right(count) => count
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      v2PostVerifyEmail { url =>
        entity(as[EmailVerification]) { payload =>
          complete {
            Future[SetResult] {
              securityActions.verifyEmail(payload.codeAsLong, payload.email) match {
                case Right(result) => result
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }
  }
}
