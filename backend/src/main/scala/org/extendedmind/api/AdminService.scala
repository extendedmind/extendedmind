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

trait AdminService extends ServiceBase {

  import JsonImplicits._

  def adminRoutes = {
      v2GetStatistics { url =>
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
      v2PostChangeUserType { userUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can change user type
          authorize(adminAccess(securityContext)) {
            entity(as[Access]) { payload =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext)
                  userActions.changeUserType(userUUID, payload.access) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      v2DestroyUser { userUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can destroy users
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
      v2PutNewCollective { url =>
        authenticate(ExtendedAuth(authenticator, "shareable", None)) { securityContext =>
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
      v2PatchExistingCollective { collectiveUUID =>
        authenticate(ExtendedAuth(authenticator, "collective", None)) { securityContext =>
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
      v2PostCollectiveChangePermission { (collectiveUUID, userUUID) =>
        authenticate(ExtendedAuth(authenticator, "collective", None)) { securityContext =>
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
      v2ResetTokens { url =>
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
      v2RebuildUserItemsIndex { ownerUUID =>
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
      v2RebuildItemsIndexes { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                setLogContext(securityContext)
                adminActions.rebuildItemsIndexes match {
                  case Right(result) => processResult(result)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      v2RebuildUserIndexes { url =>
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
      v2GetItemStatistics { uuid =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[NodeStatistics] {
                setLogContext(securityContext)
                adminActions.getItemStatistics(uuid) match {
                  case Right(stats) => processResult(stats)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      v2GetOwnerStatistics{ uuid =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[NodeStatistics] {
                setLogContext(securityContext)
                adminActions.getOwnerStatistics(uuid) match {
                  case Right(stats) => processResult(stats)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      v2PostSetItemProperty { uuid =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            entity(as[NodeProperty]) { property =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext)
                  adminActions.setItemProperty(uuid, property) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      v2PostSetOwnerProperty{ uuid =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            entity(as[NodeProperty]) { property =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext)
                  adminActions.setOwnerProperty(uuid, property) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      v2PostUpdateInfo { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            entity(as[Info]) { info =>
              complete {
                Future[SetResult] {
                  adminActions.putInfo(info) match {
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
}
