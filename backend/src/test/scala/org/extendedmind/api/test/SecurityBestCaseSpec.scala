package org.extendedmind.test

import java.io.PrintWriter
import java.util.UUID
import org.extendedmind._
import org.extendedmind.bl._
import org.extendedmind.db._
import org.extendedmind.domain._
import org.extendedmind.security._
import org.extendedmind.email._
import org.extendedmind.test._
import org.extendedmind.test.TestGraphDatabase._
import org.mockito.Mockito._
import org.mockito.Matchers._
import org.mockito.Matchers.{ eq => mockEq }
import scaldi.Module
import spray.http.BasicHttpCredentials
import spray.http.HttpHeaders.Authorization
import org.zeroturnaround.zip.ZipUtil
import java.io.File
import org.zeroturnaround.zip.FileUtil
import org.apache.commons.io.FileUtils
import org.extendedmind.api.JsonImplicits._
import spray.httpx.SprayJsonSupport._
import spray.httpx.marshalling._
import spray.json.DefaultJsonProtocol._
import scala.concurrent.Future

/**
 * Best case test for security routes. Also generates .json files.
 */
class SecurityBestCaseSpec extends ServiceBestCaseSpecBase {

  val mockMailgunClient = mock[MailgunClient]

  object TestDataGeneratorConfiguration extends Module {
    bind[GraphDatabase] to db
    bind[MailgunClient] to mockMailgunClient
  }

  override def configurations = TestDataGeneratorConfiguration :: new Configuration(settings, actorRefFactory)

  before {
    db.insertTestData()
  }

  after {
    cleanDb(db.ds.gds)
    reset(mockMailgunClient)
  }

  describe("In the best case, SecurityService") {
    it("should return token on authenticate") {
      Post("/authenticate") ~> addHeader(Authorization(BasicHttpCredentials(TIMO_EMAIL, TIMO_PASSWORD))) ~> route ~> check {
        val authenticateResponse = entityAs[String]
        writeJsonOutput("authenticateResponse", authenticateResponse)
        authenticateResponse should include("token")
      }
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      authenticateResponse.token should not be (None)
    }
    it("should swap token on token authentication") {
      val authenticateResponse = emailPasswordAuthenticateRememberMe(TIMO_EMAIL, TIMO_PASSWORD)
      val payload = AuthenticatePayload(true)
      Post("/authenticate", marshal(payload).right.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        writeJsonOutput("swapTokenResponse", entityAs[String])
        val tokenAuthenticateResponse = entityAs[SecurityContext]
        tokenAuthenticateResponse.token.get should not be (authenticateResponse.token.get)
        tokenAuthenticateResponse.collectives should not be None
        // Should be able to swap it again, but this time without rememberMe
        Post("/authenticate") ~> addCredentials(BasicHttpCredentials("token", tokenAuthenticateResponse.token.get)) ~> route ~> check {
          val tokenReAuthenticateResponse = entityAs[SecurityContext]
          tokenReAuthenticateResponse.token.get should not be (tokenAuthenticateResponse.token.get)
          // Shouldn't be able to swap it again because rememberMe was missing the last time
          Post("/authenticate") ~> addCredentials(BasicHttpCredentials("token", tokenReAuthenticateResponse.token.get)) ~> route ~> check {
            val failure = entityAs[String]
            // TODO: Fix bug with Internal Server Error!
            failure should include("error")
          }
        }
      }
    }
    it("should successfully logout with POST to /logout") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Post("/logout") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        writeJsonOutput("logoutResponse", entityAs[String])
        val logoutResponse = entityAs[CountResult]
        logoutResponse.count should equal(1)
      }
      val authenticateResponse1 = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
      val authenticateResponse2 = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
      Post("/logout",
        marshal(LogoutPayload(true)).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse1.token.get)) ~> route ~> check {
          val logoutResponse = entityAs[CountResult]
          logoutResponse.count should equal(2)
        }
    }
    it("should successfully change password with PUT to /password") {
      val authenticateResponse = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
      val newPassword = "newTestPassword"
      Put("/password",
        marshal(NewPassword(newPassword)).right.get) ~> addHeader("Content-Type", "application/json") ~> addHeader(Authorization(BasicHttpCredentials(LAURI_EMAIL, LAURI_PASSWORD))) ~> route ~> check {
          writeJsonOutput("passwordResponse", entityAs[String])
          val passwordResponse = entityAs[CountResult]
          passwordResponse.count should equal(1)
        }
      val newPasswordAuthenticateResponse = emailPasswordAuthenticate(LAURI_EMAIL, newPassword)
      newPasswordAuthenticateResponse.userUUID should not be None
    }
  }

}
