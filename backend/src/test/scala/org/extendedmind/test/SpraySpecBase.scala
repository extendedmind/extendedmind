package org.extendedmind.test

import spray.testkit.ScalatestRouteTest
import org.extendedmind.api.Service
import org.extendedmind.api.JsonImplicits._
import org.extendedmind.SettingsExtension
import scaldi.Module
import org.extendedmind.security.SecurityContext
import java.util.UUID

abstract class SpraySpecBase extends SpecBase 
    with ScalatestRouteTest with Service{

  // Setup implicits to scope
  implicit val rejectionHandler = Service.rejectionHandler

  // spray-testkit
  def actorRefFactory = system

  override implicit val executor = super[ScalatestRouteTest].executor
  
  // Initialize settings correctly here
  def settings = SettingsExtension(system)
  
  // Empty Scaldi bindings
  object EmptyTestConfiguration extends Module
  
    
  protected def getCollectiveAccess(securityContext: SecurityContext): Set[(String, Byte, Boolean)] = {
    securityContext.collectives.get.map(collectiveAccess => collectiveAccess._2).toSet
  }
  
  protected def getCollectiveUUIDMap(securityContext: SecurityContext): Map[String, UUID] = {
    securityContext.collectives.get.map(collectiveAccess => (collectiveAccess._2._1 -> collectiveAccess._1))
  }
}