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
 * Specifies the Extended Mind API
 */
trait API extends HttpService {

  // All valid paths
  val getRoot = get & path("")

  // USER
  val postSignUp = post & path("signup".r)
  val postVerifyResend = post & path("email" / "resend".r)
  val getAccount = get & path("account".r)
  val putAccount = put & path("account".r)
  val deleteAccount = delete & path("account".r)
  val getUser = get & path("user".r)
  val postSubscribe = post & path("subscribe".r)
  val putNewAgreement = put & path("agreement".r)
  val postAgreementAccess = post & path("agreement" / JavaUUID / "access" / IntNumber)
  val postAgreementResend = post & path("agreement" / JavaUUID / "resend")
  val deleteAgreement = delete & path("agreement" / JavaUUID)
  val postAgreementAccept = post & path("agreement" / HexLongNumber / "accept")

  // SECURITY
  val postAuthenticate = post & path("authenticate".r)
  val postLogout = post & path("logout".r)
  val postClear = post & path("clear".r)
  val putChangePassword = put & path("password".r)
  val putEmail = put & path("email".r)
  val postForgotPassword = post & path("password" / "forgot".r)
  val getPasswordResetExpires = get & path("password" / HexLongNumber)
  val postResetPassword = post & path("password" / HexLongNumber / "reset")
  val postVerifyEmail = post & path("email" / HexLongNumber / "verify")

  // COLLECTIVES
  val putNewCollective = put & path("collective".r)
  val putExistingCollective = put & path("collective" / JavaUUID)
  val getCollective = get & path("collective" / JavaUUID)
  val postCollectiveUserPermission = post & path("collective" / JavaUUID / "user" / JavaUUID)

  // ITEMS
  val getItems = get & path(JavaUUID / "items")
  val getItem = get & path(JavaUUID / "item" / JavaUUID)
  val putNewItem = put & path(JavaUUID / "item")
  val putExistingItem = put & path(JavaUUID / "item" / JavaUUID)
  val deleteItem = delete & path(JavaUUID / "item" / JavaUUID)
  val undeleteItem = post & path(JavaUUID / "item" / JavaUUID / "undelete")
  val postInbox = post & path("inbox" / """^[0-9a-z]{8,32}""".r )
  val getPublicItems = get & path("public" / """^[0-9a-z-]+$""".r )
  val getPublicItem = get & path("public" / """^[0-9a-z-]+$""".r / """^[0-9a-z-]+$""".r )
  val getPreviewItem = get & path(JavaUUID / "item" / JavaUUID / "preview" / HexLongNumber)
  val getItemRevisionList = get & path(JavaUUID / "item" / JavaUUID / "revisions")
  val getItemRevision = get & path(JavaUUID / "item" / JavaUUID / "revision" / LongNumber)

  // TASKS
  val getTask = get & path(JavaUUID / "task" / JavaUUID)
  val putNewTask = put & path(JavaUUID / "task")
  val putExistingTask = put & path(JavaUUID / "task" / JavaUUID)
  val deleteTask = delete & path(JavaUUID / "task" / JavaUUID)
  val undeleteTask = post & path(JavaUUID / "task" / JavaUUID / "undelete")
  val completeTask = post & path(JavaUUID / "task" / JavaUUID / "complete")
  val uncompleteTask = post & path(JavaUUID / "task" / JavaUUID / "uncomplete")
  val taskToList = post & path(JavaUUID / "task" / JavaUUID / "list")
  val taskToNote = post & path(JavaUUID / "task" / JavaUUID / "note")

  // INVITES
  val putNewInvite = put & path(JavaUUID / "invite")
  val postResendInvite = put & path(JavaUUID / "invite" / JavaUUID)
  val deleteInvite = delete & path(JavaUUID / "invite" / JavaUUID)
  val getInvites = get & path(JavaUUID / "invites")

  // NOTES
  val getNote = get & path(JavaUUID / "note" / JavaUUID)
  val putNewNote = put & path(JavaUUID / "note")
  val putExistingNote = put & path(JavaUUID / "note" / JavaUUID)
  val deleteNote = delete & path(JavaUUID / "note" / JavaUUID)
  val undeleteNote = post & path(JavaUUID / "note" / JavaUUID / "undelete")
  val favoriteNote = post & path(JavaUUID / "note" / JavaUUID / "favorite")
  val unfavoriteNote = post & path(JavaUUID / "note" / JavaUUID / "unfavorite")
  val noteToTask = post & path(JavaUUID / "note" / JavaUUID / "task")
  val noteToList = post & path(JavaUUID / "note" / JavaUUID / "list")
  val publishNote = post & path(JavaUUID / "note" / JavaUUID / "publish")
  val unpublishNote = post & path(JavaUUID / "note" / JavaUUID / "unpublish")
  val previewNote = post & path(JavaUUID / "note" / JavaUUID / "preview")

  // LISTS
  val getList = get & path(JavaUUID / "list" / JavaUUID)
  val putNewList = put & path(JavaUUID / "list")
  val putExistingList = put & path(JavaUUID / "list" / JavaUUID)
  val deleteList = delete & path(JavaUUID / "list" / JavaUUID)
  val undeleteList = post & path(JavaUUID / "list" / JavaUUID / "undelete")
  val archiveList = post & path(JavaUUID / "list" / JavaUUID / "archive")
  val unarchiveList = post & path(JavaUUID / "list" / JavaUUID / "unarchive")
  val listToTask = post & path(JavaUUID / "list" / JavaUUID / "task")
  val listToNote = post & path(JavaUUID / "list" / JavaUUID / "note")

  // TAGS
  val getTag = get & path(JavaUUID / "tag" / JavaUUID)
  val putNewTag = put & path(JavaUUID / "tag")
  val putExistingTag = put & path(JavaUUID / "tag" / JavaUUID)
  val deleteTag = delete & path(JavaUUID / "tag" / JavaUUID)
  val undeleteTag = post & path(JavaUUID / "tag" / JavaUUID / "undelete")

  // ADMIN
  val getStatistics = get & path("admin".r)
  val deleteUser = delete & path("admin" / "user" / JavaUUID)
  val getUsers = get & path("admin" / "users".r)
  val postChangeUserType = post & path("admin" / "user" / JavaUUID / "type" / IntNumber)
  val rebuildUserItemsIndex = post & path("admin" / "user" / JavaUUID / "items" / "rebuild")
  val rebuildItemsIndexes = post & path("admin" / "items" / "rebuild".r)
  val rebuildUserIndexes = post & path("admin" / "users" / "rebuild".r)
  val resetTokens = post & path("admin" / "tokens" / "reset".r)
  val postUpgradePublishedNotes = post & path("admin" / "owner" / JavaUUID / "published" / "upgrade")
  val getItemStatistics = get & path("admin" / "item" / JavaUUID)
  val getOwnerStatistics = get & path("admin" / "owner" / JavaUUID)
  val postSetItemProperty = post & path("admin" / "item" / JavaUUID / "property")
  val putInfo = put & path("admin" / "info".r)

  // SYSTEM
  val shutdown = post & path("shutdown")
  val tick = post & path("tick")
  val getInfo = get & path("info")
  val getHAAvailable = get & path("ha" / "available")
  val getHAMaster = get & path("ha" / "master")
  val getHASlave = get & path("ha" / "slave")

}
