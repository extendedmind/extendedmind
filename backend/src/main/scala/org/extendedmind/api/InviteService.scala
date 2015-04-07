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

trait InviteService extends ServiceBase {

  import JsonImplicits._
  
  def inviteRoutes = {
      getInvite { code =>
        parameters("email") { email =>
          complete {
            Future[InviteResult] {
              inviteActions.getInvite(code, email) match {
                case Right(invite) => processResult(InviteResult(
                		  					    invite.email,
                		  					    invite.code.toHexString,
                		  					    invite.accepted,
                		  					    invite.message,
                		  					    invite.emailId))
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      postInviteAccept { code =>
        authorize(settings.signUpMethod != SIGNUP_OFF) {
          entity(as[SignUp]) { signUp =>
            complete {
              Future[SetResult] {
                inviteActions.acceptInvite(code, signUp) match {
                  case Right(sr) => processResult(sr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      postInviteResend { inviteUUID =>
        authorize(settings.signUpMethod != SIGNUP_OFF) {
          entity(as[UserEmail]) { userEmail =>
            complete {
              Future[CountResult] {
                inviteActions.resendInviteEmail(inviteUUID, userEmail.email) match {
                  case Right(count) => processResult(count)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      }
  }

  
}
