package org.extendedmind.test

import spray.testkit.ScalatestRouteTest
import org.extendedmind.bl.UserActions
import scaldi.Module
import org.mockito.Mockito._
import org.extendedmind.domain.User

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
    it("should return a list of available commands at root"){
      Get() ~> emRoute ~> check { entityAs[String] should include("is running") }
    }
    it("should return a list of users at /users"){
      val users = List(User("timo@ext.md"), User("jp@ext.md"))
      stub(mockUserActions.getUsers()).toReturn(users);
      Get("/users") ~> emRoute ~> check { 
        val response = entityAs[String]
        println(response)
        response should include("timo@ext.md") 
      }
      verify(mockUserActions).getUsers()
    }
  }
}