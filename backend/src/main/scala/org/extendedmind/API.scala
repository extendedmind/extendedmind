package org.extendedmind

import spray.routing.HttpService

/**
 * Specifies the Extended Mind API
 */
trait API extends HttpService{
  
  // /api
  val rootPath = path("") & get

   
 
}