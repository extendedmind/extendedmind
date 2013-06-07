package org.extendedmind.test

import spray.testkit.ScalatestRouteTest
import org.extendedmind.Service
import org.extendedmind.SettingsExtension

class ServiceSpec extends SpecBase with ScalatestRouteTest with Service{
  
  def actorRefFactory = system
  
  // Initialize settings correctly here
  def settings = SettingsExtension(system)
  
  describe("Extended Mind Service"){
    it("should return a list of available commands at root"){
      
    }  
  }
}