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
  val postInvite = post & path(JavaUUID / "invite")
  val postInviteRequest = post & path("invite" / "request".r)
  val postAcceptInvite = post & path("invite" / "accept" / HexLongNumber)
  val getInviteRequests = get & path("invite" / "requests".r)
  
  // Security
  val postAuthenticate = post & path("authenticate".r) 
  
  // Items
  val getItems = get & path(JavaUUID / "items")
  val getItem = get & path(JavaUUID / "item" / JavaUUID)
  val putNewItem = put & path(JavaUUID / "item")
  val putExistingItem = put & path(JavaUUID / "item" / JavaUUID)
  
  // Tasks
  val getTask = get & path(JavaUUID / "task" / JavaUUID)
  val putNewTask = put & path(JavaUUID / "task")
  val putExistingTask = put & path(JavaUUID / "task" / JavaUUID)
  val completeTask = post & path(JavaUUID / "task" / JavaUUID / "complete")
  val uncompleteTask = post & path(JavaUUID / "task" / JavaUUID / "uncomplete")
  
  // Notes
  val getNote = get & path(JavaUUID / "note" / JavaUUID)
  val putNewNote = put & path(JavaUUID / "note")
  val putExistingNote = put & path(JavaUUID / "note" / JavaUUID)
  
  // Tags
  val getTag = get & path(JavaUUID / "tag" / JavaUUID)
  val putNewTag = put & path(JavaUUID / "tag")
  val putExistingTag = put & path(JavaUUID / "tag" / JavaUUID)

}