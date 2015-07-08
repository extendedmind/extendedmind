/**
 * Copyright (c) 2013-2015 Extended Mind Technologies Oy
 *
 * This file is part of Extended Mind.
 *
 * Extended Mind is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

package org.extendedmind.api.test

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
import spray.http.StatusCodes._
import org.mockito.ArgumentCaptor

/**
 * Best case test for security routes. Also generates .json files.
 */
class SecurityBestCaseSpec extends ServiceSpecBase {

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
        val authenticateResponse = responseAs[String]
        writeJsonOutput("authenticateResponse", authenticateResponse)
        authenticateResponse should include("token")
        authenticateResponse should include("authenticated")
        authenticateResponse should include("expires")
        authenticateResponse should not include("replaceable")
      }
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      authenticateResponse.token should not be (None)
    }
    it("should return token on extended authenticate") {
      val payload = AuthenticatePayload(true, Some(true))
      Post("/authenticate", marshal(payload).right.get) ~> addHeader(Authorization(BasicHttpCredentials(TIMO_EMAIL, TIMO_PASSWORD))) ~> route ~> check {
        val authenticateResponse = responseAs[String]
        authenticateResponse should include("token")
        authenticateResponse should include("authenticated")
        authenticateResponse should include("expires")
        authenticateResponse should include("replaceable")
      }
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      authenticateResponse.token should not be (None)
    }
    it("should swap token on token authentication") {
      val authenticateResponse = emailPasswordAuthenticateRememberMe(TIMO_EMAIL, TIMO_PASSWORD)
      val payload = AuthenticatePayload(true, Some(true))
      Post("/authenticate", marshal(payload).right.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        writeJsonOutput("swapTokenResponse", responseAs[String])
        val tokenAuthenticateResponse = responseAs[SecurityContext]
        tokenAuthenticateResponse.token.get should not be (authenticateResponse.token.get)
        tokenAuthenticateResponse.collectives should not be None
        tokenAuthenticateResponse.authenticated should not be None
        tokenAuthenticateResponse.expires should not be None
        tokenAuthenticateResponse.replaceable should not be None

        // Should be able to swap it again, but this time without rememberMe
        Post("/authenticate") ~> addCredentials(BasicHttpCredentials("token", tokenAuthenticateResponse.token.get)) ~> route ~> check {
          val tokenReAuthenticateResponse = responseAs[SecurityContext]
          tokenReAuthenticateResponse.token.get should not be (tokenAuthenticateResponse.token.get)
          tokenAuthenticateResponse.authenticated should not be None
          tokenAuthenticateResponse.expires should not be None
          tokenReAuthenticateResponse.replaceable should be (None)

          // Shouldn't be able to swap it again because rememberMe was missing the last time
          Post("/authenticate") ~> addCredentials(BasicHttpCredentials("token", tokenReAuthenticateResponse.token.get)) ~> route ~> check {
        	val failure = responseAs[ErrorResult]
        	status should be (Forbidden)
            failure.description should startWith("Authentication failed")
          }
        }
      }
    }
    it("should successfully logout with POST to /logout") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Post("/logout") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        writeJsonOutput("logoutResponse", responseAs[String])
        val logoutResponse = responseAs[CountResult]
        logoutResponse.count should equal(1)
      }
      val authenticateResponse1 = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
      val authenticateResponse2 = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
      Post("/logout",
        marshal(LogoutPayload(true)).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse1.token.get)) ~> route ~> check {
          val logoutResponse = responseAs[CountResult]
          logoutResponse.count should equal(2)
        }
    }
    it("should successfully clear all logins with POST to /clear") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Post("/clear") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials(TIMO_EMAIL, TIMO_PASSWORD)) ~> route ~> check {
        writeJsonOutput("clearResponse", responseAs[String])
        val clearResponse = responseAs[CountResult]
        clearResponse.count should equal(6)
      }
    }
    it("should successfully change password with PUT to /password") {
      val authenticateResponse = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
      val newPassword = "newTestPassword"
      Put("/password",
        marshal(NewPassword(newPassword)).right.get) ~> addHeader("Content-Type", "application/json") ~> addHeader(Authorization(BasicHttpCredentials(LAURI_EMAIL, LAURI_PASSWORD))) ~> route ~> check {
          writeJsonOutput("passwordResponse", responseAs[String])
          val passwordResponse = responseAs[CountResult]
          passwordResponse.count should equal(1)
        }
      val newPasswordAuthenticateResponse = emailPasswordAuthenticate(LAURI_EMAIL, newPassword)
      newPasswordAuthenticateResponse.userUUID should not be None
    }
    it("should successfully send password with email with POST to /password/forgot "
       + "get password expires with given code to ") {
      stub(mockMailgunClient.sendPasswordResetLink(mockEq(TIMO_EMAIL), anyObject())).toReturn(Future { SendEmailResponse("OK", "1234") })
      val resetCodeCaptor: ArgumentCaptor[Long] = ArgumentCaptor.forClass(classOf[Long])
      val emailCaptor: ArgumentCaptor[String] = ArgumentCaptor.forClass(classOf[String])

      Post("/password/forgot", marshal(UserEmail(TIMO_EMAIL)).right.get) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
        writeJsonOutput("forgotPasswordResponse", responseAs[String])
        val forgotPasswordResponse = responseAs[ForgotPasswordResult]
        forgotPasswordResponse.resetCodeExpires should not be None
        verify(mockMailgunClient).sendPasswordResetLink(emailCaptor.capture(), resetCodeCaptor.capture())
        // Get reset code expiration
        Get("/password/" + resetCodeCaptor.getValue().toHexString + "?email=" + TIMO_EMAIL) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
          val passwordResetExpiresResponse = responseAs[ForgotPasswordResult]
          writeJsonOutput("passwordResetExpiresResponse", responseAs[String])
        }
        // Reset password
        val testPassword = "testPassword"
        Post("/password/" + resetCodeCaptor.getValue.toHexString + "/reset", marshal(SignUp(TIMO_EMAIL, testPassword, Some(1), None)).right.get) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
          val resetPasswordResponse = responseAs[CountResult]
          writeJsonOutput("resetPasswordResponse", responseAs[String])
          val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, testPassword)
          // Make sure that reset password again with the same code fails
          Post("/password/" + resetCodeCaptor.getValue.toHexString + "/reset", marshal(SignUp(TIMO_EMAIL, testPassword, Some(1),None)).right.get) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
            val failure = responseAs[ErrorResult]
            status should be(BadRequest)
            failure.description should startWith("Password not resetable anymore")
          }
        }
      }
    }
  }

}
