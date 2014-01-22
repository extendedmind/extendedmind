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
                tagActions.getTag(getOwner(ownerUUID, securityContext), tagUUID) match {
                  case Right(tag) => tag
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
                  tagActions.putNewTag(getOwner(ownerUUID, securityContext), tag) match {
                    case Right(sr) => sr
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
                  tagActions.putExistingTag(getOwner(ownerUUID, securityContext), tagUUID, tag) match {
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
}
