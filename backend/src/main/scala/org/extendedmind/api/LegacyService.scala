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

trait LegacyService extends ServiceBase {

  import JsonImplicits._

  def legacyRoutes = {
      getStatistics { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[Statistics] {
                setLogContext(securityContext)
                adminActions.getStatistics match {
                  case Right(users) => processResult(users)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      postChangeUserType { (userUUID, userType) =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can change user type
          authorize(adminAccess(securityContext)) {
            complete {
              Future[SetResult] {
                setLogContext(securityContext)
                userActions.changeUserType(userUUID, userType) match {
                  case Right(sr) => processResult(sr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getUser { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can get users for now
          authorize(adminAccess(securityContext)) {
            parameters("email") { email =>
              complete {
                Future[PublicUser] {
                  setLogContext(securityContext)
                  userActions.getPublicUser(email) match {
                    case Right(publicUser) => processResult(publicUser)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      deleteUser { userUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can destroy users
          authorize(adminAccess(securityContext)) {
            complete {
              Future[DestroyResult] {
                setLogContext(securityContext)
                userActions.destroyUser(userUUID) match {
                  case Right(result) => processResult(result)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getUsers { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[Users] {
                setLogContext(securityContext)
                userActions.getUsers match {
                  case Right(users) => processResult(users)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putNewCollective { url =>
        authenticate(ExtendedAuth(authenticator, "shareable", None)) { securityContext =>
          // Only admins can create new collectives for now
          authorize(adminAccess(securityContext)) {
            entity(as[Collective]) { collective =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext)
                  collectiveActions.putNewCollective(securityContext.userUUID, collective) match {
                    case Right(sr) => processNewItemResult("collective", sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      putExistingCollective { collectiveUUID =>
        authenticate(ExtendedAuth(authenticator, "collective", None)) { securityContext =>
          // Only admins can update collectives for now
          authorize(adminAccess(securityContext)) {
            entity(as[Collective]) { collective =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext)
                  collectiveActions.putExistingCollective(collectiveUUID, collective) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      postCollectiveUserPermission { (collectiveUUID, userUUID) =>
        authenticate(ExtendedAuth(authenticator, "collective", None)) { securityContext =>
          // Only founder admin can assign people to exclusive collectives for now
          authorize(adminAccess(securityContext)) {
            entity(as[UserAccessRight]) { userAccessRight =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext)
                  collectiveActions.setCollectiveUserPermission(collectiveUUID, securityContext.userUUID, userUUID, userAccessRight.access) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      resetTokens { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                setLogContext(securityContext)
                adminActions.resetTokens match {
                  case Right(result) => processResult(result)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      rebuildUserItemsIndex { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                setLogContext(securityContext)
                adminActions.rebuildItemsIndex(ownerUUID) match {
                  case Right(result) => processResult(result)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      rebuildItemsIndexes { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                setLogContext(securityContext)
                adminActions.rebuildItemsIndexes match {
                  case Right(result) => processResult(result)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      rebuildUserIndexes { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                setLogContext(securityContext)
                adminActions.rebuildUserIndexes match {
                  case Right(result) => processResult(result)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getItemStatistics { uuid =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[NodeStatistics] {
                setLogContext(securityContext)
                adminActions.getItemStatistics(uuid) match {
                  case Right(stats) => processResult(stats)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getOwnerStatistics{ uuid =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[NodeStatistics] {
                setLogContext(securityContext)
                adminActions.getOwnerStatistics(uuid) match {
                  case Right(stats) => processResult(stats)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      postSetItemProperty { uuid =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            entity(as[NodeProperty]) { property =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext)
                  adminActions.setItemProperty(uuid, property) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      postSetOwnerProperty{ uuid =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            entity(as[NodeProperty]) { property =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext)
                  adminActions.setOwnerProperty(uuid, property) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      putInfo { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            entity(as[Info]) { info =>
              complete {
                Future[SetResult] {
                  adminActions.putInfo(info) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      getCollective { collectiveUUID =>
        authenticate(ExtendedAuth(authenticator, "collective", None)) { securityContext =>
          authorize(readAccess(collectiveUUID, securityContext)) {
            complete {
              Future[Collective] {
                setLogContext(securityContext)
                collectiveActions.getCollective(collectiveUUID, securityContext) match {
                  case Right(collective) => processResult(collective)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putNewInvite { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Invite]) { invite =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext, ownerUUID)
                  inviteActions.putNewInvite(getOwner(ownerUUID, securityContext), invite) match {
                    case Right(sr) => processNewItemResult("invite", sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      postResendInvite { (ownerUUID, inviteUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[SetResult] {
                setLogContext(securityContext, ownerUUID, inviteUUID)
                inviteActions.resendInvite(getOwner(ownerUUID, securityContext), inviteUUID) match {
                  case Right(sr) => processResult(sr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      deleteInvite { (ownerUUID, inviteUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[DestroyResult] {
                setLogContext(securityContext, ownerUUID, inviteUUID)
                inviteActions.deleteInvite(getOwner(ownerUUID, securityContext), inviteUUID) match {
                  case Right(dr) => processResult(dr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getInvites { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(readAccess(ownerUUID, securityContext)) {
            complete {
              Future[Invites] {
                setLogContext(securityContext, ownerUUID)
                inviteActions.getInvites(getOwner(ownerUUID, securityContext)) match {
                  case Right(invites) => processResult(invites)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getItems { ownerUUID =>
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
      } ~
      postInbox { inboxId =>
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
      getPublicItems { handle =>
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
      getPublicItem { (handle, path) =>
        complete {
          Future[PublicItem] {
            itemActions.getPublicItem(handle, path) match {
              case Right(pi) => processResult(pi)
              case Left(e) => processErrors(e)
            }
          }
        }
      } ~
      getPublicItemHeader { (shortId) =>
        complete {
          Future[PublicItemHeader] {
            itemActions.getPublicItemHeader(shortId) match {
              case Right(pi) => processResult(pi)
              case Left(e) => processErrors(e)
            }
          }
        }
      } ~
      getPreviewItem { (ownerUUID, itemUUID, previewCode) =>
        complete {
          Future[PublicItem] {
            itemActions.getPreviewItem(ownerUUID, itemUUID, previewCode) match {
              case Right(pi) => processResult(pi)
              case Left(e) => processErrors(e)
            }
          }
        }
      } ~
      getItemRevisionList { (ownerUUID, itemUUID) =>
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
      getItemRevision { (ownerUUID, itemUUID, revision) =>
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
      } ~
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
            entity(as[Option[ArchivePayload]]) { payload =>
              complete {
                Future[ArchiveListResult] {
                  setLogContext(securityContext, ownerUUID, listUUID)
                  listActions.archiveList(getOwner(ownerUUID, securityContext), listUUID, payload) match {
                    case Right(result) => processResult(result)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      unarchiveList { (ownerUUID, listUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Option[ArchivePayload]]) { payload =>
              complete {
                Future[UnarchiveListResult] {
                  setLogContext(securityContext, ownerUUID, listUUID)
                  listActions.unarchiveList(getOwner(ownerUUID, securityContext), listUUID, payload) match {
                    case Right(result) => processResult(result)
                    case Left(e) => processErrors(e)
                  }
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
      }  ~
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
          authorize(writeAccess(ownerUUID, securityContext, shareable=true)) {
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
          authorize(writeAccess(ownerUUID, securityContext, shareable=true)) {
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
          authorize(writeAccess(ownerUUID, securityContext, shareable=true)) {
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
          authorize(writeAccess(ownerUUID, securityContext, shareable=true)) {
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
      } ~
      previewNote { (ownerUUID, noteUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[PreviewPayload]) { payload =>
              complete {
                Future[PreviewNoteResult] {
                  setLogContext(securityContext, ownerUUID, noteUUID)
                  noteActions.previewNote(getOwner(ownerUUID, securityContext), noteUUID, payload) match {
                    case Right(pnr) => processResult(pnr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      publishNote { (ownerUUID, noteUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[PublishPayload]) { payload =>
              complete {
                Future[PublishNoteResult] {
                  setLogContext(securityContext, ownerUUID, noteUUID)
                  noteActions.publishNote(getOwner(ownerUUID, securityContext), noteUUID, payload) match {
                    case Right(pnr) => processResult(pnr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      unpublishNote { (ownerUUID, noteUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[SetResult] {
                setLogContext(securityContext, ownerUUID, noteUUID)
                noteActions.unpublishNote(getOwner(ownerUUID, securityContext), noteUUID) match {
                  case Right(sr) => processResult(sr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      postAuthenticate { url =>
        authenticate(ExtendedAuth(authenticateAuthenticator)) { securityContext =>
          complete {
            setLogContext(securityContext)
            log.info("authenticate")
            processResult(securityContext)
          }
        }
      } ~
      postLogout { url =>
        authenticate(ExtendedAuth(authenticator, "logout", None)) { securityContext =>
          entity(as[Option[LogoutPayload]]) { payload =>
            complete {
              Future[CountResult] {
                setLogContext(securityContext)
                securityActions.logout(securityContext.userUUID, payload) match {
                  case Right(deleteCount) => processResult(deleteCount)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      postClear { url =>
        authenticate(ExtendedAuth(authenticator, "secure", None)) { securityContext =>
          complete {
            Future[CountResult] {
              setLogContext(securityContext)
              securityActions.clear(securityContext.userUUID) match {
                case Right(deleteCount) => processResult(deleteCount)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      putChangePassword { url =>
        authenticate(ExtendedAuth(authenticator, "secure", None)) { securityContext =>
          entity(as[NewPassword]) { newPassword =>
            complete {
              Future[CountResult] {
            	setLogContext(securityContext)
                securityActions.changePassword(securityContext.userUUID, newPassword.password) match {
                  case Right(count) => processResult(count)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      postForgotPassword { url =>
        entity(as[UserEmail]) { userEmail =>
          complete {
            Future[ForgotPasswordResult] {
              securityActions.forgotPassword(userEmail) match {
                case Right(result) => processResult(result)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      getPasswordResetExpires { code =>
        parameters("email") { email =>
          complete {
            Future[ForgotPasswordResult] {
              securityActions.getPasswordResetExpires(code, email) match {
                case Right(result) => result
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      postResetPassword { code =>
        entity(as[SignUp]) { signUp =>
          complete {
            Future[CountResult] {
              securityActions.resetPassword(code, signUp.email, signUp.password) match {
                case Right(count) => count
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      postVerifyEmail { code =>
        entity(as[UserEmail]) { email =>
          complete {
            Future[SetResult] {
              securityActions.verifyEmail(code, email.email) match {
                case Right(result) => result
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
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
      } ~
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
          authorize(writeAccess(ownerUUID, securityContext, shareable=true)) {
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
          authorize(writeAccess(ownerUUID, securityContext, shareable=true)) {
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
          authorize(writeAccess(ownerUUID, securityContext, shareable=true)) {
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
          authorize(writeAccess(ownerUUID, securityContext, shareable=true)) {
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
          authorize(writeAccess(ownerUUID, securityContext, shareable=true)) {
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
          authorize(writeAccess(ownerUUID, securityContext, shareable=true)) {
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
      } ~
      postSignUp { url =>
        authorize(settings.signUpMethod == SIGNUP_ON) {
          entity(as[SignUp]) { signUp =>
            complete {
              Future[SetResult] {
                userActions.signUp(signUp) match {
                  case Right(sr) => processResult(sr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      postVerifyResend { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          complete {
            Future[CountResult] {
              userActions.resendVerifyEmail(securityContext.userUUID) match {
                case Right(result) => result
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      getAccount { url =>
        authenticate(ExtendedAuth(authenticator, "account", None)) { securityContext =>
          complete {
            Future[User] {
              setLogContext(securityContext)
              userActions.getAccount(securityContext) match {
                case Right(user) => processResult(user)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      putAccount { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          entity(as[User]) { user =>
            complete {
              Future[SetResult] {
                setLogContext(securityContext)
                userActions.patchUser(securityContext.userUUID, user) match {
                  case Right(sr) => processResult(sr.result)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      deleteAccount { url =>
        authenticate(ExtendedAuth(authenticator, "secure", None)) { securityContext =>
          complete {
            Future[DeleteItemResult] {
              setLogContext(securityContext)
              userActions.deleteUser(securityContext.userUUID) match {
                case Right(dr) => processResult(dr)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      postSubscribe { url =>
        authenticate(ExtendedAuth(authenticator, "secure", None)) { securityContext =>
          authorize(settings.signUpMode == MODE_NORMAL &&
                    (securityContext.userType == Token.BETA || securityContext.userType == Token.NORMAL)) {
            entity(as[Subscription]) { subscription =>
              complete {
                Future[SetResult] {
                  setLogContext(securityContext)
                  userActions.subscribe(securityContext.userUUID, subscription) match {
                    case Right(sr) => processResult(sr)
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      putEmail { url =>
        authenticate(ExtendedAuth(authenticator, "secure", None)) { securityContext =>
          entity(as[UserEmail]) { email =>
            complete {
              Future[SetResult] {
                setLogContext(securityContext)
                userActions.putEmail(securityContext.userUUID, email) match {
                  case Right(sr) => processResult(sr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putNewAgreement { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          entity(as[Agreement]) { agreement =>
            complete {
              Future[SetResult] {
                setLogContext(securityContext)
                userActions.putNewAgreement(securityContext.userUUID, agreement) match {
                  case Right(sr) => processResult(sr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      postAgreementAccess { (agreementUUID, access) =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          complete {
            Future[SetResult] {
              setLogContext(securityContext)
              userActions.changeAgreementAccess(securityContext.userUUID, securityContext.userType, agreementUUID, access.toByte) match {
                case Right(sr) => processResult(sr)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      deleteAgreement  { agreementUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          complete {
            Future[SetResult] {
              setLogContext(securityContext)
              userActions.destroyAgreement(securityContext.userUUID, agreementUUID) match {
                case Right(dr) => processResult(dr)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      postAgreementResend { agreementUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          complete {
            Future[CountResult] {
              setLogContext(securityContext)
              userActions.resendAgreement(securityContext.userUUID, agreementUUID) match {
                case Right(cr) => processResult(cr)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      postAgreementAccept { code =>
        entity(as[UserEmail]) { email =>
          complete {
            Future[SetResult] {
              userActions.acceptAgreement(code, email.email) match {
                case Right(sr) => processResult(sr)
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }
  }
}
