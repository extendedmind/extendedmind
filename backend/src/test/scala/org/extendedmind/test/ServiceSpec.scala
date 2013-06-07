package org.extendedmind.test

import spray.testkit.ScalatestRouteTest
import org.extendedmind.Service
import org.extendedmind.domain.GraphDatabase

class ServiceSpec extends SpecBase{
  
   
  describe("Extended Mind Service"){
    it("should return a list of available commands at root"){
      // Setup Subcut with impermanent database
      settings.configuration.modifyBindings { implicit testModule => 
        // FIXME: For some reason this doesn't work, EmbeddedGraphDatabase
        //        is still found in the service
        testModule.bind [GraphDatabase] toSingle new TestGraphDatabase(settings)
        Get() ~> emRoute ~> check { entityAs[String] should include("is running") }

      }
    }  
  }
}