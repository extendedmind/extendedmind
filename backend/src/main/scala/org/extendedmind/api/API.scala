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
  val postAuthenticate = post & path("authenticate".r) 
  val getItems = get & path(JavaUUID / "items")
  val getItem = get & path(JavaUUID / "item" / JavaUUID)
  val putNewItem = put & path(JavaUUID / "item")
  val putExistingItem = put & path(JavaUUID / "item" / JavaUUID)
  val getTask = get & path(JavaUUID / "task" / JavaUUID)
  val putNewTask = put & path(JavaUUID / "task")
  val putExistingTask = put & path(JavaUUID / "task" / JavaUUID)
  val getNote = get & path(JavaUUID / "note" / JavaUUID)
  val putNewNote = put & path(JavaUUID / "note")
  val putExistingNote = put & path(JavaUUID / "note" / JavaUUID)
  
  val searchPost = path("search") & post

}