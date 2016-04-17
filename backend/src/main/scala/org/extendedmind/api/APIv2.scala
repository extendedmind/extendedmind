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

import spray.routing.ConjunctionMagnet.fromDirective
import spray.routing.HttpService
import spray.routing.PathMatchers._

/**
 * Specifies the Extended Mind API v2
 */
trait APIv2 extends HttpService {

  // All valid paths
  val v2getRoot = get & path("v2")

  // USER
  val v2PostSignUp = post & path("v2" / "signup".r)
  val v2PostVerifyResend = post & path("v2" / "email" / "resend".r)
  val v2GetAccount = get & path("v2" / "account".r)
  val v2PutAccount = put & path("v2" / "account".r)
  val v2DeleteAccount = delete & path("v2" / "account".r)
  val v2GetUser = get & path("v2" / "user".r)
  val v2PostSubscribe = post & path("v2" / "subscribe".r)
  val v2PutNewAgreement = put & path("v2" / "agreement".r)
  val v2PostAgreementAccess = post & path("v2" / "agreement" / JavaUUID / "access" / IntNumber)
  val v2PostAgreementResend = post & path("v2" / "agreement" / JavaUUID / "resend")
  val v2DeleteAgreement = delete & path("v2" / "agreement" / JavaUUID)
  val v2PostAgreementAccept = post & path("v2" / "agreement" / HexLongNumber / "accept")

  // SECURITY
  val v2PostAuthenticate = post & path("v2" / "authenticate".r)
  val v2PostLogout = post & path("v2" / "logout".r)
  val v2PostClear = post & path("v2" / "clear".r)
  val v2PutChangePassword = put & path("v2" / "password".r)
  val v2PutEmail = put & path("v2" / "email".r)
  val v2PostForgotPassword = post & path("v2" / "password" / "forgot".r)
  val v2GetPasswordResetExpires = get & path("v2" / "password" / HexLongNumber)
  val v2PostResetPassword = post & path("v2" / "password" / HexLongNumber / "reset")
  val v2PostVerifyEmail = post & path("v2" / "email" / HexLongNumber / "verify")

  // COLLECTIVES
  val v2PutNewCollective = put & path("v2" / "collective".r)
  val v2PutExistingCollective = put & path("v2" / "collective" / JavaUUID)
  val v2GetCollective = get & path("v2" / "collective" / JavaUUID)
  val v2PostCollectiveUserPermission = post & path("v2" / "collective" / JavaUUID / "user" / JavaUUID)

  // ITEMS
  val v2GetItems = get & path("v2" / JavaUUID / "items")
  val v2GetItem = get & path("v2" / JavaUUID / "item" / JavaUUID)
  val v2PutNewItem = put & path("v2" / JavaUUID / "item")
  val v2PutExistingItem = put & path("v2" / JavaUUID / "item" / JavaUUID)
  val v2DeleteItem = delete & path("v2" / JavaUUID / "item" / JavaUUID)
  val v2UndeleteItem = post & path("v2" / JavaUUID / "item" / JavaUUID / "undelete")
  val v2PostInbox = post & path("v2" / "inbox" / """^[0-9a-z]{8,32}""".r )
  val v2GetPublicItems = get & path("v2" / "public" / """^[0-9a-z-]+$""".r )
  val v2GetPublicItem = get & path("v2" / "public" / """^[0-9a-z-]+$""".r / """^[0-9a-z-]+$""".r )
  val v2GetPublicItemHeader = get & path("v2" / "short" / """^[0-9][1-9A-Za-z]{0,20}$""".r )
  val v2GetPreviewItem = get & path("v2" / JavaUUID / "item" / JavaUUID / "preview" / HexLongNumber)
  val v2GetItemRevisionList = get & path("v2" / JavaUUID / "item" / JavaUUID / "revisions")
  val v2GetItemRevision = get & path("v2" / JavaUUID / "item" / JavaUUID / "revision" / LongNumber)

  // TASKS
  val v2GetTask = get & path("v2" / JavaUUID / "task" / JavaUUID)
  val v2PutNewTask = put & path("v2" / JavaUUID / "task")
  val v2PutExistingTask = put & path("v2" / JavaUUID / "task" / JavaUUID)
  val v2DeleteTask = delete & path("v2" / JavaUUID / "task" / JavaUUID)
  val v2UndeleteTask = post & path("v2" / JavaUUID / "task" / JavaUUID / "undelete")
  val v2CompleteTask = post & path("v2" / JavaUUID / "task" / JavaUUID / "complete")
  val v2UncompleteTask = post & path("v2" / JavaUUID / "task" / JavaUUID / "uncomplete")
  val v2TaskToList = post & path("v2" / JavaUUID / "task" / JavaUUID / "list")
  val v2TaskToNote = post & path("v2" / JavaUUID / "task" / JavaUUID / "note")

  // INVITES
  val v2PutNewInvite = put & path("v2" / JavaUUID / "invite")
  val v2PostResendInvite = put & path("v2" / JavaUUID / "invite" / JavaUUID)
  val v2DeleteInvite = delete & path("v2" / JavaUUID / "invite" / JavaUUID)
  val v2GetInvites = get & path("v2" / JavaUUID / "invites")

  // NOTES
  val v2GetNote = get & path("v2" / JavaUUID / "note" / JavaUUID)
  val v2PutNewNote = put & path("v2" / JavaUUID / "note")
  val v2PutExistingNote = put & path("v2" / JavaUUID / "note" / JavaUUID)
  val v2DeleteNote = delete & path("v2" / JavaUUID / "note" / JavaUUID)
  val v2UndeleteNote = post & path("v2" / JavaUUID / "note" / JavaUUID / "undelete")
  val v2FavoriteNote = post & path("v2" / JavaUUID / "note" / JavaUUID / "favorite")
  val v2UnfavoriteNote = post & path("v2" / JavaUUID / "note" / JavaUUID / "unfavorite")
  val v2NoteToTask = post & path("v2" / JavaUUID / "note" / JavaUUID / "task")
  val v2NoteToList = post & path("v2" / JavaUUID / "note" / JavaUUID / "list")
  val v2PublishNote = post & path("v2" / JavaUUID / "note" / JavaUUID / "publish")
  val v2UnpublishNote = post & path("v2" / JavaUUID / "note" / JavaUUID / "unpublish")
  val v2PreviewNote = post & path("v2" / JavaUUID / "note" / JavaUUID / "preview")

  // LISTS
  val v2GetList = get & path("v2" / JavaUUID / "list" / JavaUUID)
  val v2PutNewList = put & path("v2" / JavaUUID / "list")
  val v2PutExistingList = put & path("v2" / JavaUUID / "list" / JavaUUID)
  val v2DeleteList = delete & path("v2" / JavaUUID / "list" / JavaUUID)
  val v2UndeleteList = post & path("v2" / JavaUUID / "list" / JavaUUID / "undelete")
  val v2ArchiveList = post & path("v2" / JavaUUID / "list" / JavaUUID / "archive")
  val v2UnarchiveList = post & path("v2" / JavaUUID / "list" / JavaUUID / "unarchive")
  val v2ListToTask = post & path("v2" / JavaUUID / "list" / JavaUUID / "task")
  val v2ListToNote = post & path("v2" / JavaUUID / "list" / JavaUUID / "note")

  // TAGS
  val v2GetTag = get & path("v2" / JavaUUID / "tag" / JavaUUID)
  val v2PutNewTag = put & path("v2" / JavaUUID / "tag")
  val v2PutExistingTag = put & path("v2" / JavaUUID / "tag" / JavaUUID)
  val v2DeleteTag = delete & path("v2" / JavaUUID / "tag" / JavaUUID)
  val v2UndeleteTag = post & path("v2" / JavaUUID / "tag" / JavaUUID / "undelete")

  // ADMIN
  val v2GetStatistics = get & path("v2" / "admin".r)
  val v2DeleteUser = delete & path("v2" / "admin" / "user" / JavaUUID)
  val v2GetUsers = get & path("v2" / "admin" / "users".r)
  val v2PostChangeUserType = post & path("v2" / "admin" / "user" / JavaUUID / "type" / IntNumber)
  val v2RebuildUserItemsIndex = post & path("v2" / "admin" / "user" / JavaUUID / "items" / "rebuild")
  val v2RebuildItemsIndexes = post & path("v2" / "admin" / "items" / "rebuild".r)
  val v2RebuildUserIndexes = post & path("v2" / "admin" / "users" / "rebuild".r)
  val v2ResetTokens = post & path("v2" / "admin" / "tokens" / "reset".r)
  val v2GetItemStatistics = get & path("v2" / "admin" / "item" / JavaUUID)
  val v2GetOwnerStatistics = get & path("v2" / "admin" / "owner" / JavaUUID)
  val v2PostSetItemProperty = post & path("v2" / "admin" / "item" / JavaUUID / "property")
  val v2PostSetOwnerProperty = post & path("v2" / "admin" / "owner" / JavaUUID / "property")
  val v2PutInfo = put & path("v2" / "admin" / "info".r)

  // SYSTEM
  val v2Shutdown = post & path("v2" / "shutdown")
  val v2Tick = post & path("v2" / "tick")
  val v2GetInfo = get & path("v2" / "info")
  val v2GetHAAvailable = get & path("v2" / "ha" / "available")
  val v2GetHAMaster = get & path("v2" / "ha" / "master")
  val v2GetHASlave = get & path("v2" / "ha" / "slave")

}
