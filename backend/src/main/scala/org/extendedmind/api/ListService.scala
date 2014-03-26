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
      }
    }
}
