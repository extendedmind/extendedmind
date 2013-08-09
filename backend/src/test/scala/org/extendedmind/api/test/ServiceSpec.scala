package org.extendedmind.api.test
import org.extendedmind.bl.ItemActions
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
  val mockItemActions = mock[ItemActions]
  val mockSecurityActions = mock[SecurityActions]

  // Create test database  
  val db = new TestImpermanentGraphDatabase

  object ServiceTestConfiguration extends Module{
    bind [ItemActions] to mockItemActions
    bind [SecurityActions] to mockSecurityActions
    bind [GraphDatabase] to db
  }
  def configurations = ServiceTestConfiguration 

  before{
    db.insertTestUsers
  }

  // Reset mocks after each test to be able to use verify after each test
  after{
    reset(mockItemActions)
    reset(mockSecurityActions)
    db.shutdown(db.ds)
  }
  
  describe("Extended Mind Service"){
    it("should return token on authenticate"){
      Post("/authenticate") ~> addHeader(Authorization(BasicHttpCredentials(TIMO_EMAIL, TIMO_PASSWORD))) ~> emRoute ~> check { 
        val authenticateResponse = entityAs[String]
        writeJsonOutput("authenticateResponse", authenticateResponse)
        authenticateResponse should include("token")
      }
    }
  }
  
  
  // Helper file writer
  def writeJsonOutput(filename: String, contents: String): Unit = {
    Some(new PrintWriter("target/test-classes/" + filename + ".json")).foreach{p => p.write(contents); p.close}
  }
}