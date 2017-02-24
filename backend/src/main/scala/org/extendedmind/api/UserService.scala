/**
 * Copyright (c) 2013-2017 Extended Mind Technologies Oy
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

trait UserService extends ServiceBase {

  import JsonImplicits._

  def userRoutes = {
      v2PostSignUp { url =>
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
      v2PostResendVerification { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          complete {
            Future[CountResult] {
              userActions.resendVerifyEmail(securityContext.userUUID) match {
                case Right(result) => result
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      v2GetUser { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "account", None)) { securityContext =>
          complete {
            Future[User] {
              setLogContext(securityContext)
              userActions.getAccount(securityContext) match {
                case Right(user) => processResult(user)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      v2GetUsers { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can get users for now
          authorize(adminAccess(securityContext)) {
            parameters("email") { email =>
              complete {
                Future[PublicUser] {
                  setLogContext(securityContext)
                  userActions.getPublicUser(email) match {
                    case Right(publicUser) => processResult(publicUser)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      v2PatchUser { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          entity(as[User]) { user =>
            complete {
              Future[PatchUserResponse] {
                setLogContext(securityContext)
                userActions.patchUser(securityContext.userUUID, user) match {
                  case Right(sr) => processResult(sr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      v2DeleteUser { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "secure", None)) { securityContext =>
          complete {
            Future[DeleteItemResult] {
              setLogContext(securityContext)
              userActions.deleteUser(securityContext.userUUID) match {
                case Right(dr) => processResult(dr)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      v2PostSubscribe { url =>
        authenticate(ExtendedAuth(authenticator, "secure", None)) { securityContext =>
          authorize(settings.signUpMode == MODE_NORMAL &&
                    (securityContext.userType == Token.BETA || securityContext.userType == Token.NORMAL)) {
            entity(as[Subscription]) { subscription =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext)
                  userActions.subscribe(securityContext.userUUID, subscription) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      v2PostChangeEmail { url =>
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
      } ~
      v2PutNewAgreement { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          entity(as[Agreement]) { agreement =>
            complete {
              Future[SetResult] {
                setLogContext(securityContext)
                userActions.putNewAgreement(securityContext.userUUID, agreement) match {
                  case Right(sr) => processResult(sr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      v2PostAgreementAccess { agreementUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          entity(as[Access]) { payload =>
            complete {
              Future[SetResult] {
                setLogContext(securityContext)
                userActions.changeAgreementAccess(securityContext.userUUID, securityContext.userType, agreementUUID, payload.access) match {
                  case Right(sr) => processResult(sr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      v2DeleteAgreement  { agreementUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          complete {
            Future[SetResult] {
              setLogContext(securityContext)
              userActions.destroyAgreement(securityContext.userUUID, agreementUUID) match {
                case Right(dr) => processResult(dr)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      v2PostAgreementResend { agreementUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          complete {
            Future[CountResult] {
              setLogContext(securityContext)
              userActions.resendAgreement(securityContext.userUUID, agreementUUID) match {
                case Right(cr) => processResult(cr)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      v2PostAgreementAccept { url =>
        entity(as[EmailVerification]) { payload =>
          complete {
            Future[SetResult] {
              userActions.acceptAgreement(Random.codeAsLong(payload.code), payload.email) match {
                case Right(sr) => processResult(sr)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }
  }
}
