package org.extendedmind.test

import spray.testkit.ScalatestRouteTest
import org.extendedmind.bl.UserActions
import scaldi.Module
import org.mockito.Mockito._

class ServiceSpec extends SpecBase{

  // Mock out all action classes to test only the Service class
  val mockUserActions = mock[UserActions]
  object ServiceTestConfiguration extends Module{
    bind [UserActions] to mockUserActions
  }
  def configurations = ServiceTestConfiguration 
  
  // Reset mocks after each test to be able to use verify after each test
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