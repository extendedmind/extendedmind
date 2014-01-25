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
 * Best case test for list routes. Also generates .json files.
 */
class ListBestCaseSpec extends ServiceSpecBase {

  object TestDataGeneratorConfiguration extends Module {
    bind[GraphDatabase] to db
  }

  override def configurations = TestDataGeneratorConfiguration :: new Configuration(settings, actorRefFactory)
 
  before {
    db.insertTestData()
  }

  after {
    cleanDb(db.ds.gds)
  }

  describe("In the best case, ListService") {
    it("should successfully put new list on PUT to /[userUUID]/list, "
      + "update it with PUT to /[userUUID]/list/[listUUID] "
      + "and get it back with GET to /[userUUID]/list/[listUUID]"
      + "and delete it with DELETE to /[userUUID]/list/[listUUID] "
      + "and undelete it with POST to /[userUUID]/list/[listUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newList = List("learn Spanish", None, None, None, None, None, None)
      Put("/" + authenticateResponse.userUUID + "/list",
        marshal(newList).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val putListResponse = entityAs[SetResult]
          writeJsonOutput("putListResponse", entityAs[String])
          putListResponse.modified should not be None
          putListResponse.uuid should not be None
          val updatedList = newList.copy(due = Some("2014-03-01"))
          Put("/" + authenticateResponse.userUUID + "/list/" + putListResponse.uuid.get,
            marshal(updatedList).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
              val putExistingListResponse = entityAs[String]
              writeJsonOutput("putExistingListResponse", putExistingListResponse)
              putExistingListResponse should include("modified")
              putExistingListResponse should not include ("uuid")
              Get("/" + authenticateResponse.userUUID + "/list/" + putListResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                val listResponse = entityAs[List]
                writeJsonOutput("listResponse", entityAs[String])
                listResponse.due.get should be("2014-03-01")
                Delete("/" + authenticateResponse.userUUID + "/list/" + putListResponse.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                  val deleteListResponse = entityAs[String]
                  writeJsonOutput("deleteListResponse", deleteListResponse)
                  deleteListResponse should include("deleted")
                  Get("/" + authenticateResponse.userUUID + "/list/" + putListResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                	val failure = responseAs[String]        
                	status should be (BadRequest)
                    failure should startWith("Item " + putListResponse.uuid.get + " is deleted")
                  }
                  Post("/" + authenticateResponse.userUUID + "/list/" + putListResponse.uuid.get + "/undelete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val undeleteListResponse = entityAs[String]
                    writeJsonOutput("undeleteListResponse", undeleteListResponse)
                    undeleteListResponse should include("modified")
                    val undeletedList = getList(putListResponse.uuid.get, authenticateResponse)
                    undeletedList.deleted should be(None)
                    undeletedList.modified should not be (None)
                  }
                }
              }
            }
        }
    }
    it("should successfully update item to list with PUT to /[userUUID]/list/[listUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newItem = Item(None, None, None, "learn how to fly", None, None)
      Put("/" + authenticateResponse.userUUID + "/item",
        marshal(newItem).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val putItemResponse = entityAs[SetResult]
          val updatedToList = List("learn how to fly", None, None, None, Some("2014-03-01"), None, None)
          Put("/" + authenticateResponse.userUUID + "/list/" + putItemResponse.uuid.get,
            marshal(updatedToList).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
              val list = getList(putItemResponse.uuid.get, authenticateResponse)
              list.due.get should be("2014-03-01")
            }
        }
    }
    /*
    it("should successfully update task parent task and note with PUT to /[userUUID]/task/[itemUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)

      // Create task and note
      val newTask = Task("learn Spanish", None, None, None, None, None)
      val putTaskResponse = putNewTask(newTask, authenticateResponse)
      val newNote = Note("studies", None, Some("area for studies"), None, None)
      val putNoteResponse = putNewNote(newNote, authenticateResponse)

      // Create subtask for both new task and for new note and one for task
      val newSubTask = Task("google for a good Spanish textbook", None, Some("2014-03-01"), None, None,
        Some(ExtendedItemRelationships(Some(putTaskResponse.uuid.get),
          Some(putNoteResponse.uuid.get), None)))
      val putSubTaskResponse = putNewTask(newSubTask, authenticateResponse)
      val newSecondSubTask = Task("loan textbook from library", None, Some("2014-03-02"), None, None,
        Some(ExtendedItemRelationships(Some(putTaskResponse.uuid.get), None, None)))
      val putSecondSubTaskResponse = putNewTask(newSecondSubTask, authenticateResponse)

      // Get subtask, task and note and verify right values
      val taskResponse = getTask(putSubTaskResponse.uuid.get, authenticateResponse)
      taskResponse.parentNote.get should equal(putNoteResponse.uuid.get)
      taskResponse.parentTask.get should equal(putTaskResponse.uuid.get)
      val parentTaskResponse = getTask(putTaskResponse.uuid.get, authenticateResponse)
      parentTaskResponse.project.get should equal(true)
      val parentNoteResponse = getNote(putNoteResponse.uuid.get, authenticateResponse)
      parentNoteResponse.area.get should equal(true)

      // Remove parents, verify that they are removed from subtask, and that project is still a project
      // but note is no longer an area
      putExistingTask(taskResponse.copy(relationships = None), putSubTaskResponse.uuid.get,
        authenticateResponse)
      val taskResponse2 = getTask(putSubTaskResponse.uuid.get, authenticateResponse)
      taskResponse2.parentNote should be(None)
      taskResponse2.parentTask should be(None)
      val parentTaskResponse2 = getTask(putTaskResponse.uuid.get, authenticateResponse)
      parentTaskResponse2.project.get should equal(true)
      val parentNoteResponse2 = getNote(putNoteResponse.uuid.get, authenticateResponse)
      parentNoteResponse2.area should be(None)
    }
    */
  }
  
}