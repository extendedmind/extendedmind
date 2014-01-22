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
 * Best case test for task routes. Also generates .json files.
 */
class TaskBestCaseSpec extends ServiceBestCaseSpecBase {

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

  describe("In the best case, TaskService") {
    it("should successfully put new task on PUT to /[userUUID]/task, "
      + "update it with PUT to /[userUUID]/task/[taskUUID] "
      + "and get it back with GET to /[userUUID]/task/[taskUUID]"
      + "and delete it with DELETE to /[userUUID]/task/[itemUUID] "
      + "and undelete it with POST to /[userUUID]/task/[itemUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newTask = Task("learn Spanish", None, None, None, None, None)
      Put("/" + authenticateResponse.userUUID + "/task",
        marshal(newTask).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val putTaskResponse = entityAs[SetResult]
          writeJsonOutput("putTaskResponse", entityAs[String])
          putTaskResponse.modified should not be None
          putTaskResponse.uuid should not be None
          val updatedTask = newTask.copy(due = Some("2014-03-01"))
          Put("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get,
            marshal(updatedTask).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
              val putExistingTaskResponse = entityAs[String]
              writeJsonOutput("putExistingTaskResponse", putExistingTaskResponse)
              putExistingTaskResponse should include("modified")
              putExistingTaskResponse should not include ("uuid")
              Get("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                val taskResponse = entityAs[Task]
                writeJsonOutput("taskResponse", entityAs[String])
                taskResponse.due.get should be("2014-03-01")
                Delete("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                  val deleteTaskResponse = entityAs[String]
                  writeJsonOutput("deleteTaskResponse", deleteTaskResponse)
                  deleteTaskResponse should include("deleted")
                  Get("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val failure = entityAs[String]
                    // TODO: Fix bug with Internal Server Error!
                    failure should include("error")
                  }
                  Post("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get + "/undelete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val undeleteTaskResponse = entityAs[String]
                    writeJsonOutput("undeleteTaskResponse", undeleteTaskResponse)
                    undeleteTaskResponse should include("modified")
                    val undeletedTask = getTask(putTaskResponse.uuid.get, authenticateResponse)
                    undeletedTask.deleted should be(None)
                    undeletedTask.modified should not be (None)
                  }
                }
              }
            }
        }
    }
    it("should successfully update item to task with PUT to /[userUUID]/task/[itemUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newItem = Item(None, None, None, "learn how to fly", None)
      Put("/" + authenticateResponse.userUUID + "/item",
        marshal(newItem).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val putItemResponse = entityAs[SetResult]
          val updatedToTask = Task("learn how to fly", None, Some("2014-03-01"), None, None, None)
          Put("/" + authenticateResponse.userUUID + "/task/" + putItemResponse.uuid.get,
            marshal(updatedToTask).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
              Get("/" + authenticateResponse.userUUID + "/task/" + putItemResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                val taskResponse = entityAs[Task]
                taskResponse.due.get should be("2014-03-01")
              }
            }
        }
    }
    it("should successfully complete task with POST to /[userUUID]/task/[itemUUID]/complete "
      + "and uncomplete it with POST to /[userUUID]/task/[itemUUID]/uncomplete") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newTask = Task("learn Spanish", None, None, None, None, None)
      val putTaskResponse = putNewTask(newTask, authenticateResponse)

      Post("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get + "/complete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        writeJsonOutput("completeTaskResponse", entityAs[String])
        val taskResponse = getTask(putTaskResponse.uuid.get, authenticateResponse)
        taskResponse.completed should not be None
        Post("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get + "/uncomplete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          writeJsonOutput("uncompleteTaskResponse", entityAs[String])
          val untaskResponse = getTask(putTaskResponse.uuid.get, authenticateResponse)
          untaskResponse.completed should be(None)
        }
      }
    }
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
  }
}