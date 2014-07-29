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

trait AdminService extends ServiceBase {

  import JsonImplicits._

  def adminRoutes = {
    getStatistics { url =>
      authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
        authorize(adminAccess(securityContext)) {
          complete {
            Future[Statistics] {
              setLogContext(securityContext)
              adminActions.getStatistics match {
                case Right(users) => processResult(users)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }
    } ~
      postChangeUserType { (userUUID, userType) =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can change user type
          authorize(adminAccess(securityContext)) {
            complete {
              Future[SetResult] {
                setLogContext(securityContext)
                userActions.changeUserType(userUUID, userType) match {
                  case Right(sr) => processResult(sr)
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
      deleteUser { userUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can destroy invite requests
          authorize(adminAccess(securityContext)) {
            complete {
              Future[DestroyResult] {
                setLogContext(securityContext)
                userActions.destroyUser(userUUID) match {
                  case Right(result) => processResult(result)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getUsers { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[Users] {
                setLogContext(securityContext)
                userActions.getUsers match {
                  case Right(users) => processResult(users)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putInviteRequest { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can put invite requests
          authorize(adminAccess(securityContext) && settings.signUpMethod != SIGNUP_OFF) {
            entity(as[InviteRequest]) { inviteRequest =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext)
                  inviteActions.putNewInviteRequest(inviteRequest) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      deleteInviteRequest { inviteRequestUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[DestroyResult] {
                setLogContext(securityContext)
                inviteActions.destroyInviteRequest(inviteRequestUUID) match {
                  case Right(result) => processResult(result)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getInviteRequests { path =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[InviteRequests] {
                setLogContext(securityContext)
                inviteActions.getInviteRequests match {
                  case Right(inviteRequests) => processResult(inviteRequests)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      postInviteRequestAccept { inviteRequestUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can accept invite requests
          authorize(adminAccess(securityContext) && settings.signUpMethod != SIGNUP_OFF) {
            entity(as[Option[InviteRequestAcceptDetails]]) { details =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext)
                  inviteActions.acceptInviteRequest(Some(securityContext.userUUID), inviteRequestUUID, details) match {
                    case Right(result) => processResult(result._1)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      getInvites { path =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[Invites] {
                setLogContext(securityContext)
                inviteActions.getInvites match {
                  case Right(invites) => processResult(invites)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      deleteInvite { inviteUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[DestroyResult] {
                setLogContext(securityContext)
                 inviteActions.destroyInvite(inviteUUID) match {
                  case Right(result) => processResult(result)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putNewCollective { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can create new collectives for now
          authorize(adminAccess(securityContext)) {
            entity(as[Collective]) { collective =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext)
                  collectiveActions.putNewCollective(securityContext.userUUID, collective) match {
                    case Right(sr) => processNewItemResult("collective", sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      putExistingCollective { collectiveUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can update collectives for now
          authorize(adminAccess(securityContext)) {
            entity(as[Collective]) { collective =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext)
                  collectiveActions.putExistingCollective(collectiveUUID, collective) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      getCollective { collectiveUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can get collectives for now
          authorize(adminAccess(securityContext)) {
            complete {
              Future[Collective] {
                setLogContext(securityContext)
                collectiveActions.getCollective(collectiveUUID) match {
                  case Right(collective) => processResult(collective)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      postCollectiveUserPermission { (collectiveUUID, userUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only founder admin can assign people to exclusive collectives for now
          authorize(adminAccess(securityContext)) {
            entity(as[UserAccessRight]) { userAccessRight =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext)
                  collectiveActions.setCollectiveUserPermission(collectiveUUID, securityContext.userUUID, userUUID, userAccessRight.access) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      resetTokens { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                setLogContext(securityContext)
                adminActions.resetTokens match {
                  case Right(result) => processResult(result)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      rebuildUserItemsIndex { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                setLogContext(securityContext)
                adminActions.rebuildItemsIndex(ownerUUID) match {
                  case Right(result) => processResult(result)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      rebuildUserIndexes { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                setLogContext(securityContext)
                adminActions.rebuildUserIndexes match {
                  case Right(result) => processResult(result)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      upgradeOwners { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                setLogContext(securityContext)
                adminActions.upgradeOwners match {
                  case Right(result) => processResult(result)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      upgradeOwner { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[SetResult] {
                setLogContext(securityContext)
                adminActions.upgradeOwner(ownerUUID) match {
                  case Right(result) => processResult(result)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      upgradeItems { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                setLogContext(securityContext)
                adminActions.upgradeItems match {
                  case Right(result) => processResult(result)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      upgradeInvites { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                setLogContext(securityContext)
                adminActions.upgradeInvites match {
                  case Right(result) => processResult(result)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      rebuildInviteRequestsIndex { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                setLogContext(securityContext)
                adminActions.rebuildInviteRequestsIndex match {
                  case Right(result) => processResult(result)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      shutdown { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              in(1.second) { 
                adminActions.shutdown
                actorSystem.shutdown
              }
              "Shutting down in 1 second..."
            }
          }
        }
      }
  }
}
