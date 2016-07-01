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
import akka.event.DiagnosticLoggingAdapter

trait ItemService extends ServiceBase {

  import JsonImplicits._

  def itemRoutes = {
      v2GetData { ownerUUID =>
        parameters('modified.as[Long].?, 'active ? true, 'deleted ? false, 'archived ? false, 'completed ? false, 'tagsOnly? false) { (modified, active, deleted, archived, completed, tagsOnly) =>
          authenticate(ExtendedAuth(authenticator, "shareable", Some(ownerUUID))) { securityContext =>
            authorize(readAccess(ownerUUID, securityContext, shareable = true)) {
              complete {
                Future[Items] {
                  setLogContext(securityContext, ownerUUID)
                  itemActions.getItems(getOwner(ownerUUID, securityContext), modified, active, deleted, archived, completed, tagsOnly) match {
                    case Right(items) => processResult(items)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      v2GetItem { (ownerUUID, itemUUID) =>
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
      v2PutNewItem { ownerUUID =>
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
      v2PutExistingItem { (ownerUUID, itemUUID) =>
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
      v2DeleteItem { (ownerUUID, itemUUID) =>
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
      v2UndeleteItem { (ownerUUID, itemUUID) =>
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
      } ~
      v2PostInbox { inboxId =>
        entity(as[FormData]) { formData =>
          complete {
            Future[SetResult] {
              itemActions.putNewItemToInbox(inboxId, formData.fields) match {
                case Right(sr) => processResult(sr)
                case Left(e) => processErrors(e, useNotAcceptable=true)
              }
            }
          }
        }
      } ~
      v2GetPublicStats { url =>
        parameters('modified.as[Long].?) { modified =>
          complete {
            Future[PublicStats] {
              itemActions.getPublicStats(modified) match {
                case Right(ps) => processResult(ps)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      v2GetPublicItems { handle =>
        parameters('modified.as[Long].?) { modified =>
          complete {
            Future[PublicItems] {
              itemActions.getPublicItems(handle, modified) match {
                case Right(pis) => processResult(pis)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      v2GetPublicItem { (handle, path) =>
        complete {
          Future[PublicItem] {
            itemActions.getPublicItem(handle, path) match {
              case Right(pi) => processResult(pi)
              case Left(e) => processErrors(e)
            }
          }
        }
      } ~
      v2GetPublicItemHeader { (shortId) =>
        complete {
          Future[PublicItemHeader] {
            itemActions.getPublicItemHeader(shortId) match {
              case Right(pi) => processResult(pi)
              case Left(e) => processErrors(e)
            }
          }
        }
      } ~
      v2GetPreview { (ownerUUID, itemUUID, previewCode) =>
        complete {
          Future[PublicItem] {
            itemActions.getPreviewItem(ownerUUID, itemUUID, previewCode) match {
              case Right(pi) => processResult(pi)
              case Left(e) => processErrors(e)
            }
          }
        }
      } ~
      v2GetRevisionList { (ownerUUID, itemUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[ItemRevisions] {
                setLogContext(securityContext, ownerUUID)
                itemActions.getItemRevisionList(ownerUUID, itemUUID) match {
                  case Right(sr) => processResult(sr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      v2GetRevision { (ownerUUID, itemUUID, revision) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[ExtendedItemChoice] {
                setLogContext(securityContext, ownerUUID)
                itemActions.getItemRevision(ownerUUID, itemUUID, revision) match {
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
