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

trait TaskService extends ServiceBase {

  import JsonImplicits._
  
  def taskRoutes = {
      getTask { (ownerUUID, taskUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(readAccess(ownerUUID, securityContext)) {
            complete {
              Future[Task] {
                setLogContext(securityContext, ownerUUID, taskUUID)
                taskActions.getTask(getOwner(ownerUUID, securityContext), taskUUID) match {
                  case Right(task) => processResult(task)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putNewTask { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "shareable", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Task]) { task =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext, ownerUUID)
                  taskActions.putNewTask(getOwner(ownerUUID, securityContext), task) match {
                    case Right(sr) => processNewItemResult("task", sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      putExistingTask { (ownerUUID, taskUUID) =>
        authenticate(ExtendedAuth(authenticator, "shareable", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Task]) { task =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext, ownerUUID, taskUUID)
                  taskActions.putExistingTask(getOwner(ownerUUID, securityContext), taskUUID, task) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      deleteTask { (ownerUUID, taskUUID) =>
        authenticate(ExtendedAuth(authenticator, "shareable", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Option[ReminderModification]]) { payload =>
              complete {
                Future[DeleteItemResult] {
                  setLogContext(securityContext, ownerUUID, taskUUID)
                  taskActions.deleteTask(getOwner(ownerUUID, securityContext), taskUUID, payload) match {
                    case Right(dir) => processResult(dir)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      undeleteTask { (ownerUUID, taskUUID) =>
        authenticate(ExtendedAuth(authenticator, "shareable", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Option[ReminderModification]]) { payload =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext, ownerUUID, taskUUID)
                  taskActions.undeleteTask(getOwner(ownerUUID, securityContext), taskUUID, payload) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      completeTask { (ownerUUID, taskUUID) =>
        authenticate(ExtendedAuth(authenticator, "shareable", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Option[ReminderModification]]) { payload =>
              complete {
                Future[CompleteTaskResult] {
                  setLogContext(securityContext, ownerUUID, taskUUID)
                  taskActions.completeTask(getOwner(ownerUUID, securityContext), taskUUID, payload) match {
                    case Right(task) => processResult(task)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      uncompleteTask { (ownerUUID, taskUUID) =>
        authenticate(ExtendedAuth(authenticator, "shareable", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Option[ReminderModification]]) { payload =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext, ownerUUID, taskUUID)
                  taskActions.uncompleteTask(getOwner(ownerUUID, securityContext), taskUUID, payload) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      taskToList { (ownerUUID, taskUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Task]) { task =>
              complete {
                Future[List] {
                  setLogContext(securityContext, ownerUUID, taskUUID)
                  taskActions.taskToList(getOwner(ownerUUID, securityContext), taskUUID, task) match {
                    case Right(list) => processResult(list)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      taskToNote { (ownerUUID, taskUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Task]) { task =>
              complete {
                Future[Note] {
                  setLogContext(securityContext, ownerUUID, taskUUID)
                  taskActions.taskToNote(getOwner(ownerUUID, securityContext), taskUUID, task) match {
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
