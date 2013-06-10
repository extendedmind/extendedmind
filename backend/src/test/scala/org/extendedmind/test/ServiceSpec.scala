package org.extendedmind.test

import spray.testkit.ScalatestRouteTest
import org.extendedmind.bl.UserActions
import scaldi.DynamicModule
import org.mockito.Mockito._

class ServiceSpec extends SpecBase{
  // Mock out all peripherals
  object ServiceTestConfiguration extends DynamicModule
  def configurations = ServiceTestConfiguration 
  val mockUserActions = mock[UserActions]
  ServiceTestConfiguration.bind [UserActions] to mockUserActions
  
  // Reset mocks after each test
  after{
    reset(mockUserActions)
  }

  describe("Extended Mind Service"){
    it("TESTING"){
      Get() ~> emRoute ~> check { entityAs[String] should include("is running") }
      verify(mockUserActions).getUsers()
    }
    it("TESTING2"){
      Get() ~> emRoute ~> check { entityAs[String] should include("is running") }
      verify(mockUserActions).getUsers()
    }
  }
}