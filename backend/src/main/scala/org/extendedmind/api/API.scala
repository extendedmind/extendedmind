/**
 * Copyright (c) 2013-2014 Extended Mind Technologies Oy
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

  // INVITE
  val postInvite = post & path(JavaUUID / "invite")
  val postInviteRequest = post & path("invite" / "request".r)
  val getInviteRequestQueueNumber = get & path("invite" / "request" / JavaUUID)
  val postInviteRequestBypass = post & path("invite" / "request" / JavaUUID / "bypass")
  val getInvite = get & path("invite" / HexLongNumber)
  val postInviteResend = post & path("invite" / JavaUUID / "resend")
  val postInviteAccept = post & path("invite" / HexLongNumber / "accept")

  // USER
  val postSignUp = post & path("signup".r)
  val getAccount = get & path("account".r)
  val putAccount = put & path("account".r)
  val getUser = get & path("user".r)

  // SECURITY
  val postAuthenticate = post & path("authenticate".r)
  val postLogout = post & path("logout".r)
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

  // TASKS
  val getTask = get & path(JavaUUID / "task" / JavaUUID)
  val putNewTask = put & path(JavaUUID / "task")
  val putExistingTask = put & path(JavaUUID / "task" / JavaUUID)
  val deleteTask = delete & path(JavaUUID / "task" / JavaUUID)
  val undeleteTask = post & path(JavaUUID / "task" / JavaUUID / "undelete")
  val completeTask = post & path(JavaUUID / "task" / JavaUUID / "complete")
  val uncompleteTask = post & path(JavaUUID / "task" / JavaUUID / "uncomplete")
  val assignTask = post & path(JavaUUID / "task" / JavaUUID / "assign")

  // NOTES
  val getNote = get & path(JavaUUID / "note" / JavaUUID)
  val putNewNote = put & path(JavaUUID / "note")
  val putExistingNote = put & path(JavaUUID / "note" / JavaUUID)
  val deleteNote = delete & path(JavaUUID / "note" / JavaUUID)
  val undeleteNote = post & path(JavaUUID / "note" / JavaUUID / "undelete")

  // LISTS
  val getList = get & path(JavaUUID / "list" / JavaUUID)
  val putNewList = put & path(JavaUUID / "list")
  val putExistingList = put & path(JavaUUID / "list" / JavaUUID)
  val deleteList = delete & path(JavaUUID / "list" / JavaUUID)
  val undeleteList = post & path(JavaUUID / "list" / JavaUUID / "undelete")
  val archiveList = post & path(JavaUUID / "list" / JavaUUID / "archive")
  // TODO:
  val unarchiveList = post & path(JavaUUID / "list" / JavaUUID / "unarchive")

  // TAGS
  val getTag = get & path(JavaUUID / "tag" / JavaUUID)
  val putNewTag = put & path(JavaUUID / "tag")
  val putExistingTag = put & path(JavaUUID / "tag" / JavaUUID)
  val deleteTag = delete & path(JavaUUID / "tag" / JavaUUID)
  val undeleteTag = post & path(JavaUUID / "tag" / JavaUUID / "undelete")

  // ADMIN
  val getStatistics = get & path("admin".r)
  // Users
  val deleteUser = delete & path("admin" / "user" / JavaUUID)
  val getUsers = get & path("admin" / "users".r)
  val postChangeUserType = post & path("admin" / "user" / JavaUUID / "type" / IntNumber)
  val rebuildUserItemsIndex = post & path("admin" / "user" / JavaUUID / "items" / "rebuild")
  val rebuildUserIndexes = post & path("admin" / "users" / "rebuild".r)
  val upgradeOwners = post & path("admin" / "owners" / "upgrade".r)
  val upgradeOwner = post & path("admin" / "owner" / JavaUUID / "upgrade")
  val upgradeItems = post & path("admin" / "items" / "upgrade".r)
  val upgradeInvites = post & path("admin" / "invites" / "upgrade".r)

  // Invites
  val rebuildInviteRequestsIndex = post & path("admin" / "invite" / "requests" / "rebuild".r)
  val putInviteRequest = put & path("admin" / "invite" / "request".r)
  val getInviteRequests = get & path("admin" / "invite" / "requests".r)
  val deleteInviteRequest = delete & path("admin" / "invite" / "request" / JavaUUID)
  val postInviteRequestAccept = post & path("admin" / "invite" / "request" / JavaUUID / "accept")
  val getInvites = get & path("admin" / "invites".r)
  // Security
  val resetTokens = post & path("admin" / "tokens" / "reset".r)

  // SYSTEM
  val shutdown = post & path("shutdown".r)

}