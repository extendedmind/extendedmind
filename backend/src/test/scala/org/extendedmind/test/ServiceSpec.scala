package org.extendedmind.test

import spray.testkit.ScalatestRouteTest
import org.extendedmind.Service
import org.extendedmind.domain.GraphDatabase
import org.extendedmind.Settings
import scaldi.Module
import org.extendedmind.bl.UserActions
import org.extendedmind.Configuration
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.bl.SearchIndex
import org.extendedmind.bl.UserActionsImpl

class ServiceSpec extends SpecBase{
  
  // Mock out all peripherals
  class ServiceTestConfiguration(settings: Settings) extends Module {
    bind [UserActions] to MockUserActions
  }
  def configurations = new ServiceTestConfiguration(this.settings) :: new TestConfiguration(this.settings) :: new Configuration(this.settings)
  
  describe("Extended Mind Service"){
    it("should return a list of available paths at root"){
      Get() ~> emRoute ~> check { entityAs[String] should include("is running") }
    }  
  }
}