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

trait NoteService extends ServiceBase {

  import JsonImplicits._
  
  def noteRoutes = {
      getNote { (ownerUUID, noteUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(readAccess(ownerUUID, securityContext)) {
            complete {
              Future[Note] {
                setLogContext(securityContext, ownerUUID, noteUUID)
                noteActions.getNote(getOwner(ownerUUID, securityContext), noteUUID) match {
                  case Right(note) => processResult(note)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putNewNote { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "shareable", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Note]) { note =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext, ownerUUID)
                  noteActions.putNewNote(getOwner(ownerUUID, securityContext), note) match {
                    case Right(sr) => processNewItemResult("note", sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      putExistingNote { (ownerUUID, noteUUID) =>
        authenticate(ExtendedAuth(authenticator, "shareable", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Note]) { note =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext, ownerUUID, noteUUID)
                  noteActions.putExistingNote(getOwner(ownerUUID, securityContext), noteUUID, note) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      deleteNote { (ownerUUID, noteUUID) =>
        authenticate(ExtendedAuth(authenticator, "shareable", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[DeleteItemResult] {
                setLogContext(securityContext, ownerUUID, noteUUID)
                noteActions.deleteNote(getOwner(ownerUUID, securityContext), noteUUID) match {
                  case Right(dir) => processResult(dir)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      undeleteNote { (ownerUUID, noteUUID) =>
        authenticate(ExtendedAuth(authenticator, "shareable", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[SetResult] {
                setLogContext(securityContext, ownerUUID, noteUUID)
                noteActions.undeleteNote(getOwner(ownerUUID, securityContext), noteUUID) match {
                  case Right(sr) => processResult(sr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      }  ~
      favoriteNote { (ownerUUID, noteUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[FavoriteNoteResult] {
                setLogContext(securityContext, ownerUUID, noteUUID)
                noteActions.favoriteNote(getOwner(ownerUUID, securityContext), noteUUID) match {
                  case Right(fnr) => processResult(fnr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      unfavoriteNote { (ownerUUID, noteUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[SetResult] {
                setLogContext(securityContext, ownerUUID, noteUUID)
                noteActions.unfavoriteNote(getOwner(ownerUUID, securityContext), noteUUID) match {
                  case Right(sr) => processResult(sr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~      
      noteToTask { (ownerUUID, noteUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Note]) { note =>
              complete {
                Future[Task] {
                  setLogContext(securityContext, ownerUUID, noteUUID)
                  noteActions.noteToTask(getOwner(ownerUUID, securityContext), noteUUID, note) match {
                    case Right(task) => processResult(task)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      noteToList { (ownerUUID, noteUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Note]) { note =>
              complete {
                Future[List] {
                  setLogContext(securityContext, ownerUUID, noteUUID)
                  noteActions.noteToList(getOwner(ownerUUID, securityContext), noteUUID, note) match {
                    case Right(list) => processResult(list)
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
