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

package org.extendedmind.test

import spray.testkit.ScalatestRouteTest
import org.extendedmind.api.Service
import org.extendedmind.api.JsonImplicits._
import org.extendedmind.SettingsExtension
import scaldi.Module
import org.extendedmind.security.SecurityContext
import java.util.UUID
import spray.util.LoggingContext
import org.extendedmind.Response._
import org.extendedmind.SetResult

abstract class SpraySpecBase extends SpecBase 
    with ScalatestRouteTest with Service{

  // Setup implicits to scope
  implicit def rejectionHandler(implicit log: LoggingContext) = Service.rejectionHandler
  implicit def exceptionHandler(implicit log: LoggingContext) = Service.exceptionHandler
  
  // spray-testkit
  def actorRefFactory = system

  override implicit val executor = super[ScalatestRouteTest].executor
  
  // Initialize settings correctly here
  def settings = SettingsExtension(system)
  
  // Initialize simple logger
  override def putMdc(mdc: Map[String, Any]) {}
  override def processResult[T <: Any](result: T): T = {result}
  override def processNewItemResult(itemType: String, result: SetResult) = {result}
  override def logErrors(errors: scala.List[ResponseContent]) = {
    errors foreach (e => {
    	val errorString = e.responseType + ": " + e.description
    	println(errorString)
      }
    )
  }
  
  // Empty Scaldi bindings
  object EmptyTestConfiguration extends Module
  
    
  protected def getCollectiveAccess(securityContext: SecurityContext): Set[(String, Byte, Boolean)] = {
    securityContext.collectives.get.map(collectiveAccess => collectiveAccess._2).toSet
  }
  
  protected def getCollectiveUUIDMap(securityContext: SecurityContext): Map[String, UUID] = {
    securityContext.collectives.get.map(collectiveAccess => (collectiveAccess._2._1 -> collectiveAccess._1))
  }
}