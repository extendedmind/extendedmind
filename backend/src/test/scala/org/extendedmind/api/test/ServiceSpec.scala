package org.extendedmind.api.test
import scaldi.Module
import org.mockito.Mockito._
import java.io.PrintWriter
import spray.testkit.ScalatestRouteTest
import org.extendedmind.api._
import org.extendedmind.domain._
import org.extendedmind.db._
import org.extendedmind._
import org.extendedmind.test._
import org.extendedmind.security._
import org.extendedmind.bl._
import org.extendedmind.test.TestGraphDatabase._
import org.extendedmind.api.JsonImplicits._
import spray.http.HttpHeaders.Authorization
import spray.http.BasicHttpCredentials
import java.util.UUID
import spray.httpx.SprayJsonSupport._
import spray.httpx.marshalling._

class ServiceSpec extends SpraySpecBase with ImpermanentGraphDatabaseSpecBase{

  // Mock out all action classes to use only the Service class for output
  val mockItemActions = mock[ItemActions]
  val mockGraphDatabase = mock[GraphDatabase]

  object ServiceTestConfiguration extends Module {
    bind[GraphDatabase] to mockGraphDatabase
  }

  override def configurations = ServiceTestConfiguration

  before{
    db.insertTestData()
  }
  
  after {
    cleanDb(db.ds.gds)
    // Reset mocks after each test to be able to use verify after each test
    reset(mockGraphDatabase)
  }

  describe("Service") {

    it("should return a list of available commands at root") {
      Get() ~> route ~> check { entityAs[String] should include("is running") }
    }

    it("should generate token response on /authenticate") {
      stubTimoAuthenticate()
      Post("/authenticate"
          ) ~> addHeader(Authorization(BasicHttpCredentials(TIMO_EMAIL, TIMO_PASSWORD))
          ) ~> route ~> check {
        val authenticateResponse = entityAs[String]
        authenticateResponse should include("token")
      }
      verify(mockGraphDatabase).generateToken(TIMO_EMAIL, TIMO_PASSWORD, None)
    }
  }

  def stubTimoAuthenticate(): SecurityContext = {
    val uuid = UUID.randomUUID()
    val token = Token.encryptToken(Token(uuid))
    val securityContext = SecurityContext(uuid, Token.ADMIN, Some(token), None)
    stub(mockGraphDatabase.generateToken(TIMO_EMAIL, TIMO_PASSWORD, None)).toReturn(
      Right(securityContext))
    stub(mockGraphDatabase.authenticate(token, None)).toReturn(
      Right(securityContext))
    securityContext
  }
  
}