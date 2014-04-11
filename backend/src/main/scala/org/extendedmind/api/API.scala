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

  // User
  val postSignUp = post & path("signup".r)
  val getUser = get & path("user".r)
  val deleteUser = delete & path("user" / JavaUUID)
  
  // Invite
  val postInvite = post & path(JavaUUID / "invite")
  val postInviteRequest = post & path("invite" / "request".r)
  val putInviteRequest = put & path("invite" / "request".r)
  val getInviteRequests = get & path("invite" / "requests".r)
  val getInviteRequestQueueNumber = get & path("invite" / "request" / JavaUUID)
  val postInviteRequestAccept = post & path("invite" / "request" / JavaUUID / "accept")
  val postInviteRequestBypass = post & path("invite" / "request" / JavaUUID / "bypass")
  val deleteInviteRequest = delete & path("invite" / "request" / JavaUUID)
  val getInvite = get & path("invite" / HexLongNumber)  
  val getInvites = get & path("invites".r)
  val postInviteAccept = post & path("invite" / HexLongNumber / "accept")
  
  // Security
  val postAuthenticate = post & path("authenticate".r)
  val postLogout = post & path("logout".r)
  val putChangePassword = put & path("password".r)
  val getAccount = get & path("account".r)
  val putAccount = put & path("account".r)
  val putEmail = put & path("email".r)
  val postChangeUserType = post & path("user" / JavaUUID / "type" / IntNumber)
  val postForgotPassword = post & path("password" / "forgot".r)
  val getPasswordResetExpires = get & path("password" / HexLongNumber)
  val postResetPassword = post & path("password" / HexLongNumber / "reset")
  val postVerifyEmail = post & path("email" / HexLongNumber / "verify")
  
  // Collectives
  val putNewCollective = put & path("collective".r)
  val putExistingCollective = put & path("collective" / JavaUUID)
  val getCollective = get & path("collective" / JavaUUID)
  val postCollectiveUserPermission = post & path("collective" / JavaUUID / "user" / JavaUUID)
  
  // Items
  val getItems = get & path(JavaUUID / "items")
  val getItem = get & path(JavaUUID / "item" / JavaUUID)
  val putNewItem = put & path(JavaUUID / "item")
  val putExistingItem = put & path(JavaUUID / "item" / JavaUUID)
  val deleteItem = delete & path(JavaUUID / "item" / JavaUUID)
  val undeleteItem = post & path(JavaUUID / "item" / JavaUUID / "undelete")
  
  // Tasks
  val getTask = get & path(JavaUUID / "task" / JavaUUID)
  val putNewTask = put & path(JavaUUID / "task")
  val putExistingTask = put & path(JavaUUID / "task" / JavaUUID)
  val deleteTask = delete & path(JavaUUID / "task" / JavaUUID)
  val undeleteTask = post & path(JavaUUID / "task" / JavaUUID / "undelete")
  val completeTask = post & path(JavaUUID / "task" / JavaUUID / "complete")
  val uncompleteTask = post & path(JavaUUID / "task" / JavaUUID / "uncomplete")
  val assignTask = post & path(JavaUUID / "task" / JavaUUID / "assign")
  
  // Notes
  val getNote = get & path(JavaUUID / "note" / JavaUUID)
  val putNewNote = put & path(JavaUUID / "note")
  val putExistingNote = put & path(JavaUUID / "note" / JavaUUID)
  val deleteNote = delete & path(JavaUUID / "note" / JavaUUID)
  val undeleteNote = post & path(JavaUUID / "note" / JavaUUID / "undelete")
  
  // Lists
  val getList = get & path(JavaUUID / "list" / JavaUUID)
  val putNewList = put & path(JavaUUID / "list")
  val putExistingList = put & path(JavaUUID / "list" / JavaUUID)
  val deleteList = delete & path(JavaUUID / "list" / JavaUUID)
  val undeleteList = post & path(JavaUUID / "list" / JavaUUID / "undelete")
  val archiveList = post & path(JavaUUID / "list" / JavaUUID / "archive")
  // TODO:
  val unarchiveList = post & path(JavaUUID / "list" / JavaUUID / "unarchive")
  
  // Tags
  val getTag = get & path(JavaUUID / "tag" / JavaUUID)
  val putNewTag = put & path(JavaUUID / "tag")
  val putExistingTag = put & path(JavaUUID / "tag" / JavaUUID)
  val deleteTag = delete & path(JavaUUID / "tag" / JavaUUID)
  val undeleteTag = post & path(JavaUUID / "tag" / JavaUUID / "undelete")
  
  // Admin
  val resetTokens = post & path("tokens" / "reset".r)
  val rebuildItemsIndex = post & path(JavaUUID / "items" / "rebuild")
  val rebuildUserIndexes = post & path("users"/ "rebuild".r)
  val rebuildInviteRequestsIndex = post & path("invite"/ "requests"/ "rebuild".r)
  val migrateToLists = post & path(JavaUUID / "migrate"/ "lists")
  val shutdown = post & path("shutdown".r)

}