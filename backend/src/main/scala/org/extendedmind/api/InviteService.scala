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

trait InviteService extends ServiceBase {

  import JsonImplicits._

  def inviteRoutes = {
    putNewInvite { ownerUUID =>
      authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
        authorize(writeAccess(ownerUUID, securityContext)) {
          entity(as[Invite]) { invite =>
            complete {
              Future[SetResult] {
                setLogContext(securityContext, ownerUUID)
                inviteActions.putNewInvite(getOwner(ownerUUID, securityContext), invite) match {
                  case Right(sr) => processNewItemResult("invite", sr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      }
    } ~
    postResendInvite { (ownerUUID, inviteUUID) =>
      authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
        authorize(writeAccess(ownerUUID, securityContext)) {
          complete {
            Future[SetResult] {
              setLogContext(securityContext, ownerUUID, inviteUUID)
              inviteActions.resendInvite(getOwner(ownerUUID, securityContext), inviteUUID) match {
                case Right(sr) => processResult(sr)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }
    } ~
    deleteInvite { (ownerUUID, inviteUUID) =>
      authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
        authorize(writeAccess(ownerUUID, securityContext)) {
          complete {
            Future[DestroyResult] {
              setLogContext(securityContext, ownerUUID, inviteUUID)
              inviteActions.deleteInvite(getOwner(ownerUUID, securityContext), inviteUUID) match {
                case Right(dr) => processResult(dr)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }
    } ~
    getInvites { ownerUUID =>
      authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
        authorize(readAccess(ownerUUID, securityContext)) {
          complete {
            Future[Invites] {
              setLogContext(securityContext, ownerUUID)
              inviteActions.getInvites(getOwner(ownerUUID, securityContext)) match {
                case Right(invites) => processResult(invites)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }
    }
  }
}
