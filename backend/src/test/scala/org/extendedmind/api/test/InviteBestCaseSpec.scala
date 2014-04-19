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

/**
 * Best case test for invites. Also generates .json files.
 */
class InviteBestCaseSpec extends ImpermanentGraphDatabaseSpecBase {

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

  describe("In the best case, InviteService") {

    it("should successfully create invite requests with POST to /invite/request "
      + "and get them back with GET to /admin/invite/requests "
      + "and get the right order number with GET to /invite/request/[UUID] "
      + "and delete it with DELETE to /admin/invite/request/[UUID] "
      + "and accept the request with POST to /admin/invite/request/[UUID]/accept "
      + "and accept the invite with POST to /invite/[code]/accept ") {
      val testEmail = "example@example.com"
      val testInviteRequest = InviteRequest(None, testEmail, None, None, None)
      val testEmail2 = "example2@example.com"
      val testInviteRequest2 = InviteRequest(None, testEmail2, None, None, None)
      val testEmail3 = "example3@example.com"
      val testInviteRequest3 = InviteRequest(None, testEmail3, None, None, None)

      stub(mockMailgunClient.sendRequestInviteConfirmation(mockEq(testEmail), anyObject())).toReturn(
        Future { SendEmailResponse("OK", "1234") })
      stub(mockMailgunClient.sendRequestInviteConfirmation(mockEq(testEmail2), anyObject())).toReturn(
        Future { SendEmailResponse("OK", "12345") })
      stub(mockMailgunClient.sendRequestInviteConfirmation(mockEq(testEmail3), anyObject())).toReturn(
        Future { SendEmailResponse("OK", "123456") })
      stub(mockMailgunClient.sendInvite(anyObject())).toReturn(
        Future { SendEmailResponse("OK", "1234567") })
      Post("/invite/request",
        marshal(testInviteRequest).right.get) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
          writeJsonOutput("inviteRequestResponse", entityAs[String])
          val inviteRequestResponse = entityAs[InviteRequestResult]
          inviteRequestResponse.resultType should be (NEW_INVITE_REQUEST_RESULT)
          inviteRequestResponse.result.get.uuid should not be None
          inviteRequestResponse.result.get.modified should not be None
          inviteRequestResponse.queueNumber.get should be (1)

          Post("/invite/request",
            marshal(testInviteRequest2).right.get) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
              val inviteRequestResponse2 = entityAs[InviteRequestResult]
              inviteRequestResponse2.queueNumber.get should be (2)
              Post("/invite/request",
                marshal(testInviteRequest3).right.get) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                  val inviteRequestResponse3 = entityAs[InviteRequestResult]
                  inviteRequestResponse3.queueNumber.get should be (3)

                  verify(mockMailgunClient).sendRequestInviteConfirmation(testEmail, inviteRequestResponse.result.get.uuid.get)
                  verify(mockMailgunClient).sendRequestInviteConfirmation(testEmail2, inviteRequestResponse2.result.get.uuid.get)
                  verify(mockMailgunClient).sendRequestInviteConfirmation(testEmail3, inviteRequestResponse3.result.get.uuid.get)
                  // Get the request back
                  val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
                  Get("/admin/invite/requests") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val inviteRequests = entityAs[InviteRequests]
                    writeJsonOutput("inviteRequestsResponse", entityAs[String])
                    inviteRequests.inviteRequests(0).email should be(testEmail)
                    inviteRequests.inviteRequests(1).email should be(testEmail2)
                    inviteRequests.inviteRequests(2).email should be(testEmail3)
                    // Get order number for invites
                    Get("/invite/request/" + inviteRequestResponse.result.get.uuid.get) ~> route ~> check {
                      entityAs[InviteRequestQueueNumber].queueNumber should be(1)
                    }
                    Get("/invite/request/" + inviteRequestResponse2.result.get.uuid.get) ~> route ~> check {
                      entityAs[InviteRequestQueueNumber].queueNumber should be(2)
                    }
                    Get("/invite/request/" + inviteRequestResponse3.result.get.uuid.get) ~> route ~> check {
                      entityAs[InviteRequestQueueNumber].queueNumber should be(3)
                    }

                    // Delete the middle invite request
                    Delete("/admin/invite/request/" + inviteRequestResponse2.result.get.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                      val deleteInviteRequestResponse = entityAs[DestroyResult]
                      writeJsonOutput("deleteInviteRequestResponse", entityAs[String])
                      deleteInviteRequestResponse.destroyed.size should be(1)
                    }
                    // Verify that the last one is now number 2 
                    Get("/invite/request/" + inviteRequestResponse3.result.get.uuid.get) ~> route ~> check {
                      entityAs[InviteRequestQueueNumber].queueNumber should be(2)
                    }
                    
                    // Accept invite request  
                    Post("/admin/invite/request/" + inviteRequestResponse.result.get.uuid.get + "/accept") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                      val acceptInviteRequestResponse = entityAs[SetResult]
                      writeJsonOutput("acceptInviteRequestResponse", entityAs[String])
                      acceptInviteRequestResponse.uuid should not be None

                      // Should be able to resend invite
                      Post("/invite/" + acceptInviteRequestResponse.uuid.get + "/resend",
                        marshal(UserEmail(testInviteRequest.email)).right.get) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                          val resendInviteResponse = entityAs[CountResult]
                          writeJsonOutput("resendInviteResponse", entityAs[String])
                          resendInviteResponse.count should be(1)
                      }
                    }
                    verify(mockMailgunClient, times(2)).sendInvite(anyObject())
                    
                    // Verify that the last one is now number 1 
                    Get("/invite/request/" + inviteRequestResponse3.result.get.uuid.get) ~> route ~> check {
                      entityAs[InviteRequestQueueNumber].queueNumber should be(1)
                    }

                    // Get the invites
                    Get("/admin/invites") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                      val invites = entityAs[Invites]
                      writeJsonOutput("invitesResponse", entityAs[String])
                      assert(invites.invites.size === 1)
                      // Get invite
                      Get("/invite/" + invites.invites(0).code.toHexString + "?email=" + invites.invites(0).email) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                        val inviteResponse = entityAs[InviteResult]
                        writeJsonOutput("inviteResponse", entityAs[String])
                        inviteResponse.email should be(invites.invites(0).email)
                        inviteResponse.accepted should be(None)
                      }
                      // Accept invite
                      val testPassword = "testPassword"
                      Post("/invite/" + invites.invites(0).code.toHexString + "/accept",
                        marshal(SignUp(invites.invites(0).email, testPassword, Some(1), None)).right.get) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                          val acceptInviteResponse = entityAs[SetResult]
                          writeJsonOutput("acceptInviteResponse", entityAs[String])
                          acceptInviteResponse.uuid should not be None
                          // Should be possible to authenticate with the new email/password
                          val newUserAuthenticateResponse =
                            emailPasswordAuthenticate(invites.invites(0).email, testPassword)

                          // Should create admin because of signUpMode="ALFA" setting in application.conf
                          newUserAuthenticateResponse.userType should equal(Token.ADMIN)

                          // When getting account, emailConfirmed should not be none
                          Get("/account") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", newUserAuthenticateResponse.token.get)) ~> route ~> check {
                            writeJsonOutput("emailVerifiedAccountResponse", entityAs[String])
                            val accountResponse = entityAs[User]
                            accountResponse.emailVerified should not be None
                          }

                          // Should return accepted when getting invite again
                          Get("/invite/" + invites.invites(0).code.toHexString + "?email=" + invites.invites(0).email) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                            val acceptedInviteResponse = entityAs[InviteResult]
                            writeJsonOutput("acceptedInviteResponse", entityAs[String])
                            acceptedInviteResponse.email should be(invites.invites(0).email)
                            acceptedInviteResponse.accepted should not be None
                          }
                        }
				    }
                    // Try post accepted invite request again, and verify that user
	                Post("/invite/request",
				      marshal(testInviteRequest).right.get) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
				        val repostedInviteRequestResult = entityAs[InviteRequestResult]
				        repostedInviteRequestResult.resultType should be (USER_RESULT)
				        repostedInviteRequestResult.queueNumber should be (None)
				        repostedInviteRequestResult.result should be (None)
				    }
				    // Try post existing invite request again, and verify that right queue number is received
	                Post("/invite/request",
				      marshal(testInviteRequest3).right.get) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
				        val repostedInviteRequestResult3 = entityAs[InviteRequestResult]
				        repostedInviteRequestResult3.resultType should be (INVITE_REQUEST_RESULT)
				        repostedInviteRequestResult3.queueNumber.get should be (1)
				        repostedInviteRequestResult3.result.get.uuid should not be (None)
				        repostedInviteRequestResult3.result.get.modified should not be (None)
				    }
                  }
                }
            }
        }
    }
  }

  def emailPasswordAuthenticate(email: String, password: String): SecurityContext = {
    Post("/authenticate") ~> addHeader(Authorization(BasicHttpCredentials(email, password))) ~> route ~> check {
      entityAs[SecurityContext]
    }
  }

  def emailPasswordAuthenticateRememberMe(email: String, password: String): SecurityContext = {
    Post("/authenticate", marshal(AuthenticatePayload(true, None)).right.get) ~> addHeader(Authorization(BasicHttpCredentials(email, password))) ~> route ~> check {
      entityAs[SecurityContext]
    }
  }

  def putNewNote(newNote: Note, authenticateResponse: SecurityContext): SetResult = {
    Put("/" + authenticateResponse.userUUID + "/note",
      marshal(newNote).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        entityAs[SetResult]
      }
  }

  def putExistingNote(existingNote: Note, noteUUID: UUID, authenticateResponse: SecurityContext): SetResult = {
    Put("/" + authenticateResponse.userUUID + "/note/" + noteUUID.toString(),
      marshal(existingNote).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        entityAs[SetResult]
      }
  }

  def putNewTask(newTask: Task, authenticateResponse: SecurityContext, collectiveUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (collectiveUUID.isDefined) collectiveUUID.get else authenticateResponse.userUUID
    Put("/" + ownerUUID + "/task",
      marshal(newTask).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        entityAs[SetResult]
      }
  }

  def putExistingTask(existingTask: Task, taskUUID: UUID, authenticateResponse: SecurityContext,
    collectiveUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (collectiveUUID.isDefined) collectiveUUID.get else authenticateResponse.userUUID
    Put("/" + ownerUUID + "/task/" + taskUUID.toString(),
      marshal(existingTask).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        entityAs[SetResult]
      }
  }

  def getItem(itemUUID: UUID, authenticateResponse: SecurityContext): Item = {
    Get("/" + authenticateResponse.userUUID + "/item/" + itemUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      entityAs[Item]
    }
  }

  def getTask(taskUUID: UUID, authenticateResponse: SecurityContext, collectiveUUID: Option[UUID] = None): Task = {
    val ownerUUID = if (collectiveUUID.isDefined) collectiveUUID.get else authenticateResponse.userUUID
    Get("/" + ownerUUID + "/task/" + taskUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      entityAs[Task]
    }
  }

  def getNote(noteUUID: UUID, authenticateResponse: SecurityContext): Note = {
    Get("/" + authenticateResponse.userUUID + "/note/" + noteUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      entityAs[Note]
    }
  }

  def getUserUUID(email: String, authenticateResponse: SecurityContext): UUID = {
    Get("/user?email=" + email) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      entityAs[PublicUser].uuid
    }
  }

  // Helper file writer
  def writeJsonOutput(filename: String, contents: String): Unit = {
    Some(new PrintWriter(db.TEST_DATA_DESTINATION + "/" + filename + ".json")).foreach { p => p.write(contents); p.close }
  }
}
