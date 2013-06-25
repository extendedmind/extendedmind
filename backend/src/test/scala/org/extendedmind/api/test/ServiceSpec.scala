package org.extendedmind.api.test
import org.extendedmind.bl.UserActions
import scaldi.Module
import org.mockito.Mockito._
import org.extendedmind.domain.User
import org.extendedmind.test.SpecBase
import java.io.PrintWriter
import spray.testkit.ScalatestRouteTest
import org.extendedmind.api.Service
import org.extendedmind.SettingsExtension
import org.extendedmind.test.SpraySpecBase
import org.extendedmind.bl.SecurityActions
import spray.http.HttpHeaders.Authorization
import spray.http.BasicHttpCredentials

class ServiceSpec extends SpraySpecBase{

  // Mock out all action classes to test only the Service class
  val mockUserActions = mock[UserActions]
  val mockSecurityActions = mock[SecurityActions]
  object ServiceTestConfiguration extends Module{
    bind [UserActions] to mockUserActions
    bind [SecurityActions] to mockSecurityActions
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
        val getUsersResponse = entityAs[String]
        writeJsonOutput("getUsersResponse", getUsersResponse)
        getUsersResponse should include("timo@ext.md")
      }
      verify(mockUserActions).getUsers()
    }
    
    it("should return token on authenticate"){
      val users = List(User("timo@ext.md"), User("jp@ext.md"))
      stub(mockSecurityActions.generateToken("timo@ext.md")).toReturn("12345");
      Post("/authenticate") ~> addHeader(Authorization(BasicHttpCredentials("timo@ext.md", "test"))) ~> emRoute ~> check { 
        val authenticateResponse = entityAs[String]
        writeJsonOutput("authenticateResponse", authenticateResponse)
        authenticateResponse should include("12345")
      }
      verify(mockSecurityActions).generateToken("timo@ext.md")
    }
  }
  
  
  // Helper file writer
  def writeJsonOutput(filename: String, contents: String): Unit = {
    Some(new PrintWriter("target/test-classes/" + filename + ".json")).foreach{p => p.write(contents); p.close}
  }
}