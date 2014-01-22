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
 * Best case test for user routes. Also generates .json files.
 */
class UserBestCaseSpec extends ServiceBestCaseSpecBase {

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

  describe("In the best case, UserService") {
    it("should create an administrator with POST to /signup because adminSignUp is set to true") {
      val signUp = SignUp("test@ext.md", "infopwd")
      Post("/signup",
        marshal(signUp).right.get) ~> route ~> check {
          val signUpResponse = entityAs[String]
          writeJsonOutput("signUpResponse", signUpResponse)
          signUpResponse should include("uuid")
          signUpResponse should include("modified")
          val authenticationResponse = emailPasswordAuthenticate(signUp.email, signUp.password)
          authenticationResponse.userType should be(0)
        }
    }
    it("should successfully get user with GET to /account, "
      + "change email with PUT to /account "
      + "and get the changed email back") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Get("/account") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        writeJsonOutput("accountResponse", entityAs[String])
        val accountResponse = entityAs[User]
        accountResponse.uuid.get should equal(authenticateResponse.userUUID)
        accountResponse.email should equal(TIMO_EMAIL)
      }
      val newUser = User("timo.tiuraniemi@iki.fi")
      Put("/account",
        marshal(newUser).right.get) ~> addHeader("Content-Type", "application/json") ~> addHeader(Authorization(BasicHttpCredentials(TIMO_EMAIL, TIMO_PASSWORD))) ~> route ~> check {
          writeJsonOutput("putAccountResponse", entityAs[String])
          val putAccountResponse = entityAs[SetResult]
          putAccountResponse.modified should not be None
        }
      Get("/account") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val accountResponse = entityAs[User]
        accountResponse.email should equal(newUser.email)
      }
      val newEmailAuthenticateResponse = emailPasswordAuthenticate(newUser.email, TIMO_PASSWORD)
      newEmailAuthenticateResponse.userUUID should not be None
    }
  }

}
