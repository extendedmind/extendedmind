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

trait TagService extends ServiceBase {
  
  import JsonImplicits._
  
  def tagRoutes = {
      getTag { (ownerUUID, tagUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(readAccess(ownerUUID, securityContext)) {
            complete {
              Future[Tag] {
                setLogContext(securityContext, ownerUUID, tagUUID)
                tagActions.getTag(getOwner(ownerUUID, securityContext), tagUUID) match {
                  case Right(tag) => processResult(tag)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putNewTag { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Tag]) { tag =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext, ownerUUID)
                  tagActions.putNewTag(getOwner(ownerUUID, securityContext), tag) match {
                    case Right(sr) => processNewItemResult("tag",sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      putExistingTag { (ownerUUID, tagUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Tag]) { tag =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext, ownerUUID, tagUUID)
                  tagActions.putExistingTag(getOwner(ownerUUID, securityContext), tagUUID, tag) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      deleteTag { (ownerUUID, tagUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[DeleteItemResult] {
                setLogContext(securityContext, ownerUUID, tagUUID)
                tagActions.deleteTag(getOwner(ownerUUID, securityContext), tagUUID) match {
                  case Right(dir) => processResult(dir)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      undeleteTag { (ownerUUID, tagUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[SetResult] {
                setLogContext(securityContext, ownerUUID, tagUUID)
                tagActions.undeleteTag(getOwner(ownerUUID, securityContext), tagUUID) match {
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
