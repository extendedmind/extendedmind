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


/**
 * Best case test for notes. Also generates .json files.
 */
class NoteBestCaseSpec extends ServiceSpecBase {

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

  describe("In the best case, NoteService") {
    it("should successfully put new note on PUT to /[userUUID]/note, "
      + "update it with PUT to /[userUUID]/note/[noteUUID] "
      + "and get it back with GET to /[userUUID]/note/[noteUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newNote = Note("home measurements", None, None, Some("bedroom wall: 420cm*250cm"), None)
      Put("/" + authenticateResponse.userUUID + "/note",
        marshal(newNote).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val putNoteResponse = responseAs[SetResult]
          writeJsonOutput("putNoteResponse", responseAs[String])
          putNoteResponse.modified should not be None
          putNoteResponse.uuid should not be None

          val updatedNote = newNote.copy(description = Some("Helsinki home dimensions"))
          Put("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get,
            marshal(updatedNote).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
              val putExistingNoteResponse = responseAs[String]
              writeJsonOutput("putExistingNoteResponse", putExistingNoteResponse)
              putExistingNoteResponse should include("modified")
              putExistingNoteResponse should not include ("uuid")
              Get("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                val noteResponse = responseAs[Note]
                writeJsonOutput("noteResponse", responseAs[String])
                noteResponse.content should not be None
                noteResponse.description.get should be("Helsinki home dimensions")
                Delete("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                  val deleteNoteResponse = responseAs[String]
                  writeJsonOutput("deleteNoteResponse", deleteNoteResponse)
                  deleteNoteResponse should include("deleted")
                  Get("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                	val failure = responseAs[String]        
                	status should be (BadRequest)
                    failure should startWith("Item " + putNoteResponse.uuid.get + " is deleted")
                  }
                  Post("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get + "/undelete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val undeleteNoteResponse = responseAs[String]
                    writeJsonOutput("undeleteNoteResponse", undeleteNoteResponse)
                    undeleteNoteResponse should include("modified")
                    val undeletedTask = getNote(putNoteResponse.uuid.get, authenticateResponse)
                    undeletedTask.deleted should be(None)
                    undeletedTask.modified should not be (None)
                  }
                }
              }
            }
        }
    }
  }
}
