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
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
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
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
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
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
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
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
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
      }
  }
}
