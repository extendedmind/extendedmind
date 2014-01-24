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

trait ItemService extends ServiceBase {

  import JsonImplicits._
  
  def itemRoutes = {
      getItems { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(readAccess(ownerUUID, securityContext)) {
            complete {
              Future[Items] {
                itemActions.getItems(getOwner(ownerUUID, securityContext)) match {
                  case Right(items) => items
                  case Left(e) => processErrors(e)
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
                itemActions.getItem(getOwner(ownerUUID, securityContext), itemUUID) match {
                  case Right(item) => item
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
                  itemActions.putNewItem(getOwner(ownerUUID, securityContext), item) match {
                    case Right(sr) => sr
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
                  itemActions.putExistingItem(getOwner(ownerUUID, securityContext), itemUUID, item) match {
                    case Right(sr) => sr
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
                itemActions.deleteItem(getOwner(ownerUUID, securityContext), itemUUID) match {
                  case Right(dir) => dir
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
                itemActions.undeleteItem(getOwner(ownerUUID, securityContext), itemUUID) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      }
  }
}
