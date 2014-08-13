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

trait ListService extends ServiceBase {

  import JsonImplicits._
  
  def listRoutes = {
      getList { (ownerUUID, listUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(readAccess(ownerUUID, securityContext)) {
            complete {
              Future[List] {
                setLogContext(securityContext, ownerUUID, listUUID)
                listActions.getList(getOwner(ownerUUID, securityContext), listUUID) match {
                  case Right(list) => processResult(list)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putNewList { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[List]) { list =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext, ownerUUID)
                  listActions.putNewList(getOwner(ownerUUID, securityContext), list) match {
                    case Right(sr) => processNewItemResult("list", sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      putExistingList { (ownerUUID, listUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[List]) { list =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext, ownerUUID, listUUID)
                  listActions.putExistingList(getOwner(ownerUUID, securityContext), listUUID, list) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      deleteList { (ownerUUID, listUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[DeleteItemResult] {
                setLogContext(securityContext, ownerUUID, listUUID)
                listActions.deleteList(getOwner(ownerUUID, securityContext), listUUID) match {
                  case Right(dir) => processResult(dir)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      undeleteList { (ownerUUID, listUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[SetResult] {
                setLogContext(securityContext, ownerUUID, listUUID)
                listActions.undeleteList(getOwner(ownerUUID, securityContext), listUUID) match {
                  case Right(sr) => processResult(sr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      archiveList { (ownerUUID, listUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[ArchiveListResult] {
                setLogContext(securityContext, ownerUUID, listUUID)
                listActions.archiveList(getOwner(ownerUUID, securityContext), listUUID) match {
                  case Right(result) => processResult(result)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      listToTask { (ownerUUID, listUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[List]) { list =>
              complete {
                Future[Task] {
                  setLogContext(securityContext, ownerUUID, listUUID)
                  listActions.listToTask(getOwner(ownerUUID, securityContext), listUUID, list) match {
                    case Right(task) => processResult(task)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      listToNote { (ownerUUID, listUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[List]) { list =>
              complete {
                Future[Note] {
                  setLogContext(securityContext, ownerUUID, listUUID)
                  listActions.listToNote(getOwner(ownerUUID, securityContext), listUUID, list) match {
                    case Right(note) => processResult(note)
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
