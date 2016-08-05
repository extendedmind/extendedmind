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
trait APIv2 extends LegacyAPI {

  // USERS

  // Security
  val v2PostAuthenticate = post & path("v2" / "users" / "authenticate".r)
  val v2PostLogout = post & path("v2" / "users" / "log_out".r)
  val v2PostSignUp = post & path("v2" / "users"/ "sign_up".r)
  val v2PostDestroyTokens = post & path("v2" / "users" / "destroy_tokens".r)
  val v2PostResendVerification = post & path("v2" / "users"/ "resend_verification".r)
  val v2PostChangePassword = post & path("v2" / "users" / "change_password".r)
  val v2PostChangeEmail = post & path("v2" / "users" / "change_email".r)
  val v2PostForgotPassword = post & path("v2" / "users" / "forgot_password".r)
  val v2PostVerifyEmail = post & path("v2" / "users" / "verify_email".r)
  val v2PostResetPassword = post & path("v2" / "users" / "reset_password".r)
  val v2GetPasswordResetExpires = get & path("v2" / "users" / "password_expires" / HexLongNumber)

  // Account
  val v2GetUser = get & path("v2" / "users"/ JavaUUID)
  val v2PatchUser = patch & path("v2" / "users" / JavaUUID)
  val v2DeleteUser = delete & path("v2" / "users" / JavaUUID)
  val v2GetUsers = get & path("v2" / "users".r)
  val v2PostSubscribe = post & path("v2" / "users" / JavaUUID / "subscribe")

  // Agreements
  val v2PutNewAgreement = put & path("v2" / "users" / "agreements".r)
  val v2PostAgreementAccess = post & path("v2" / "users" / "agreements" / JavaUUID / "change_accesss")
  val v2PostAgreementResend = post & path("v2" / "users" / "agreements" / JavaUUID / "resend_agreement")
  val v2DeleteAgreement = delete & path("v2" / "users" / "agreements" / JavaUUID)
  val v2PostAgreementAccept = post & path("v2" / "users" / "accept_agreement".r)

  // COLLECTIVES

  val v2PostCreateCollective = post & path("v2" / "collectives" / "create_collective".r)
  val v2PatchExistingCollective = patch & path("v2" / "collectives" / JavaUUID)
  val v2GetCollective = get & path("v2" / "collectives" / JavaUUID)
  val v2PostCollectiveChangePermission = post & path("v2" / "collectives" / JavaUUID / "change_permission" / JavaUUID)

  // OWNERS

  val v2GetOwners = get & path("v2" / "owners".r)
  val v2GetData = get & path("v2" / "owners" / JavaUUID / "data")
  val v2GetPreview = get & path("v2" / "owners" / JavaUUID / "data" / JavaUUID / "preview" / HexLongNumber)
  val v2GetRevisionList = get & path("v2" / "owners" / JavaUUID / "data" / JavaUUID / "revisions")
  val v2GetRevision = get & path("v2" /  "owners" / JavaUUID / "data" / JavaUUID / "revision" / LongNumber)

  // Items
  val v2GetItem = get & path("v2" / "owners" / JavaUUID / "data" / "items" / JavaUUID)
  val v2PutNewItem = put & path("v2" / "owners" / JavaUUID / "data" / "items")
  val v2PutExistingItem = put & path("v2" / "owners" / JavaUUID / "data" / "items" / JavaUUID)
  val v2DeleteItem = delete & path("v2" / "owners" / JavaUUID / "data" / "items" / JavaUUID)
  val v2UndeleteItem = post & path("v2" / "owners" / JavaUUID / "data" / "items" / JavaUUID / "undelete")

  // Tasks
  val v2GetTask = get & path("v2" / "owners" / JavaUUID / "data" / "tasks" / JavaUUID)
  val v2PutNewTask = put & path("v2" / "owners" / JavaUUID / "data" / "tasks")
  val v2PutExistingTask = put & path("v2" / "owners" / JavaUUID / "data" / "tasks" / JavaUUID)
  val v2DeleteTask = delete & path("v2" / "owners" / JavaUUID / "data" / "tasks" / JavaUUID)
  val v2UndeleteTask = post & path("v2" / "owners" / JavaUUID / "data" / "tasks" / JavaUUID / "undelete")
  val v2CompleteTask = post & path("v2" / "owners" / JavaUUID / "data" / "tasks" / JavaUUID / "complete")
  val v2UncompleteTask = post & path("v2" / "owners" / JavaUUID / "data" / "tasks" / JavaUUID / "uncomplete")
  val v2TaskToList = post & path("v2" / "owners" / JavaUUID / "data" / "tasks" / JavaUUID / "convert_to_list")
  val v2TaskToNote = post & path("v2" / "owners" / JavaUUID / "data" / "tasks" / JavaUUID / "convert_to_note")

  // Notes
  val v2GetNote = get & path("v2" / "owners" / JavaUUID / "data" / "notes" / JavaUUID)
  val v2PutNewNote = put & path("v2" / "owners" / JavaUUID / "data" / "notes")
  val v2PutExistingNote = put & path("v2" / "owners" / JavaUUID / "data" / "notes" / JavaUUID)
  val v2DeleteNote = delete & path("v2" / "owners" / JavaUUID / "data" / "notes" / JavaUUID)
  val v2UndeleteNote = post & path("v2" / "owners" / JavaUUID / "data" / "notes" / JavaUUID / "undelete")
  val v2FavoriteNote = post & path("v2" / "owners" / JavaUUID / "data" / "notes" / JavaUUID / "favorite")
  val v2UnfavoriteNote = post & path("v2" / "owners" / JavaUUID / "data" / "notes" / JavaUUID / "unfavorite")
  val v2NoteToTask = post & path("v2" / "owners" / JavaUUID / "data" / "notes" / JavaUUID / "convert_to_task")
  val v2NoteToList = post & path("v2" / "owners" / JavaUUID / "data" / "notes" / JavaUUID / "convert_to_list")
  val v2PublishNote = post & path("v2" / "owners" / JavaUUID / "data" / "notes" / JavaUUID / "publish")
  val v2UnpublishNote = post & path("v2" / "owners" / JavaUUID / "data" / "notes" / JavaUUID / "unpublish")
  val v2PreviewNote = post & path("v2" / "owners" / JavaUUID / "data" / "notes" / JavaUUID / "create_preview")

  // Lists
  val v2GetList = get & path("v2" / "owners" / JavaUUID / "data" / "lists" / JavaUUID)
  val v2PutNewList = put & path("v2" / "owners" / JavaUUID / "data" / "lists")
  val v2PutExistingList = put & path("v2" / "owners" / JavaUUID / "data" / "lists" / JavaUUID)
  val v2DeleteList = delete & path("v2" / "owners" / JavaUUID / "data" / "lists" / JavaUUID)
  val v2UndeleteList = post & path("v2" / "owners" / JavaUUID / "data" / "lists" / JavaUUID / "undelete")
  val v2ArchiveList = post & path("v2" / "owners" / JavaUUID / "data" / "lists" / JavaUUID / "archive")
  val v2UnarchiveList = post & path("v2" / "owners" / JavaUUID / "data" / "lists" / JavaUUID / "unarchive")
  val v2ListToTask = post & path("v2" / "owners" / JavaUUID / "data" / "lists" / JavaUUID / "convert_to_task")
  val v2ListToNote = post & path("v2" / "owners" / JavaUUID / "data" / "lists" / JavaUUID / "convert_to_note")

  // Tags
  val v2GetTag = get & path("v2" / "owners" / JavaUUID / "data" / "tags" / JavaUUID)
  val v2PutNewTag = put & path("v2" / "owners" / JavaUUID / "data" / "tags")
  val v2PutExistingTag = put & path("v2" / "owners" / JavaUUID / "data" / "tags" / JavaUUID)
  val v2DeleteTag = delete & path("v2" / "owners" / JavaUUID / "data" / "tags" / JavaUUID)
  val v2UndeleteTag = post & path("v2" / "owners" / JavaUUID / "data" / "tags" / JavaUUID / "undelete")

  // Invites
  val v2PutNewInvite = put & path("v2" / "owners" / JavaUUID / "invites")
  val v2PostResendInvite = put & path("v2" / "owners" / JavaUUID / "invites" / JavaUUID)
  val v2DeleteInvite = delete & path("v2" / "owners" / JavaUUID / "invites" / JavaUUID)
  val v2GetInvites = get & path("v2" / "owners" / JavaUUID / "invites")

  // INBOX

  val v2PostInbox = post & path("v2" / "inbox" / """^[0-9a-z]{8,32}""".r )

  // PUBLIC

  val v2GetPublicStats = get & path("v2" / "public".r)
  val v2GetPublicItems = get & path("v2" / "public" / """^[0-9a-z-]+$""".r )
  val v2GetPublicItem = get & path("v2" / "public" / """^[0-9a-z-]+$""".r / """^[0-9a-z-]+$""".r )

  // SHORT URL

  val v2GetPublicItemHeader = get & path("v2" / "short" / """^[0-9][1-9A-Za-z]{0,20}$""".r )

  // UPDATES QUERY

  val v2GetUpdate = get & path("v2" / "update".r)

  // ADMIN

  val v2GetStatistics = get & path("v2" / "admin".r)
  val v2DestroyUser = post & path("v2" / "admin" / "users" / JavaUUID / "destroy_user")
  val v2PostChangeUserType = post & path("v2" / "admin" / "users" / JavaUUID / "change_user_type")
  val v2RebuildUserItemsIndex = post & path("v2" / "admin" / "users" / JavaUUID / "rebuild_items_index")
  val v2RebuildItemsIndexes = post & path("v2" / "admin" / "rebuild_items_indexes".r)
  val v2RebuildUserIndexes = post & path("v2" / "admin" / "rebuild_users_index".r)
  val v2RebuildPublicAndItemsIndexes = post & path("v2" / "admin" / "rebuild_public_and_items_indexes".r)
  val v2ResetTokens = post & path("v2" / "admin" / "reset_tokens".r)
  val v2GetItemStatistics = get & path("v2" / "admin" / "items" / JavaUUID / "stats")
  val v2GetOwnerStatistics = get & path("v2" / "admin" / "owners" / JavaUUID / "stats")
  val v2PostSetItemProperty = post & path("v2" / "admin" / "items" / JavaUUID / "change_property")
  val v2PostSetOwnerProperty = post & path("v2" / "admin" / "owners" / JavaUUID / "change_property")
  val v2PostUpdateVersion = post & path("v2" / "admin" / "update_version".r)

}
