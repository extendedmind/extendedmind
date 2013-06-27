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
import java.util.UUID
import org.extendedmind.domain.UserWrapper
import org.extendedmind.test.TestImpermanentGraphDatabase
import org.extendedmind.db.GraphDatabase
import org.extendedmind.test.TestGraphDatabase._

class ServiceSpec extends SpraySpecBase{

  // Mock out all action classes to test only the Service class
  val mockUserActions = mock[UserActions]
  val mockSecurityActions = mock[SecurityActions]

  // Create test database  
  val db = new TestImpermanentGraphDatabase

  object ServiceTestConfiguration extends Module{
    bind [UserActions] to mockUserActions
    bind [SecurityActions] to mockSecurityActions
    bind [GraphDatabase] to db
  }
  def configurations = ServiceTestConfiguration 

  before{
    db.insertTestUsers
  }

  // Reset mocks after each test to be able to use verify after each test
  after{
    reset(mockUserActions)
    reset(mockSecurityActions)
    db.shutdown(db.ds)
  }

  
  describe("Extended Mind Service"){
    it("should return token on authenticate"){
      stub(mockSecurityActions.generateToken(TIMO_EMAIL)).toReturn("12345");
      Post("/authenticate") ~> addHeader(Authorization(BasicHttpCredentials(TIMO_EMAIL, TIMO_PASSWORD))) ~> emRoute ~> check { 
        val authenticateResponse = entityAs[String]
        writeJsonOutput("authenticateResponse", authenticateResponse)
        authenticateResponse should include("12345")
      }
      verify(mockSecurityActions).generateToken(TIMO_EMAIL)
    }
  }
  
  
  // Helper file writer
  def writeJsonOutput(filename: String, contents: String): Unit = {
    Some(new PrintWriter("target/test-classes/" + filename + ".json")).foreach{p => p.write(contents); p.close}
  }
}