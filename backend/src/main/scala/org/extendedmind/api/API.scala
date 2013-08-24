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
  val searchPost = path("search") & post
  val notesGet = path("notes") & get
  val noteGet = path("note" / IntNumber) & get
  val notePut = path("note" / IntNumber) & put
  val tasksGet = path("tasks") & get
  val taskGet = path("task" / IntNumber) & get
  val taskPut = path("task" / IntNumber) & put

}