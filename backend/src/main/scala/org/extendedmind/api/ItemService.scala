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
import akka.event.DiagnosticLoggingAdapter

trait ItemService extends ServiceBase {

  import JsonImplicits._
  
  def itemRoutes = {
      getItems { ownerUUID =>
        parameters('modified.as[Long].?, 'active ? true, 'deleted ? false, 'archived ? false, 'completed ? false) { (modified, active, deleted, archived, completed) =>
      	  authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
            authorize(readAccess(ownerUUID, securityContext)) {
              complete {
                Future[Items] {
                  setLogContext(securityContext, ownerUUID)
                  itemActions.getItems(getOwner(ownerUUID, securityContext), modified, active, deleted, archived, completed) match {
                    case Right(items) => processResult(items)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      getItem { (ownerUUID, itemUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(readAccess(ownerUUID, securityContext)) {
            complete {
              Future[Item] {
                setLogContext(securityContext, ownerUUID, itemUUID)
                itemActions.getItem(getOwner(ownerUUID, securityContext), itemUUID) match {
                  case Right(item) => processResult(item)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putNewItem { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Item]) { item =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext, ownerUUID)
                  itemActions.putNewItem(getOwner(ownerUUID, securityContext), item) match {
                    case Right(sr) => processNewItemResult("item", sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      putExistingItem { (ownerUUID, itemUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Item]) { item =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext, ownerUUID, itemUUID)
                  itemActions.putExistingItem(getOwner(ownerUUID, securityContext), itemUUID, item) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      deleteItem { (ownerUUID, itemUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[DeleteItemResult] {
                setLogContext(securityContext, ownerUUID, itemUUID)
                itemActions.deleteItem(getOwner(ownerUUID, securityContext), itemUUID) match {
                  case Right(dir) => processResult(dir)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      undeleteItem { (ownerUUID, itemUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[SetResult] {
                setLogContext(securityContext, ownerUUID, itemUUID)
                itemActions.undeleteItem(getOwner(ownerUUID, securityContext), itemUUID) match {
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
