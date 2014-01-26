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
 * Best case test for task routes. Also generates .json files.
 */
class TaskBestCaseSpec extends ServiceSpecBase {

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
      val newTask = Task("learn Spanish", None, None, None, None, None, None)
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
                	val failure = responseAs[String]        
                	status should be (BadRequest)
                    failure should startWith("Item " + putTaskResponse.uuid.get + " is deleted")
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
      val newItem = Item(None, None, None, "learn how to fly", None, None)
      Put("/" + authenticateResponse.userUUID + "/item",
        marshal(newItem).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val putItemResponse = entityAs[SetResult]
          val updatedToTask = Task("learn how to fly", None, None, Some("2014-03-01"), None, None, None)
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
      val newTask = Task("learn Spanish", None, None, None, None, None, None)
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
    it("should successfully create repeating task with PUT to /[userUUID]/task "
      + "and create a new task with complete with POST to /[userUUID]/task/[itemUUID]/complete"
      + "and stop the repeating by deleting the created task with DELETE to /[userUUID]/task/[itemUUID]/complete") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newTask = Task("review inbox", None, None, Some("2013-12-31"), None, Some(RepeatingType.WEEKLY), None)
      val putTaskResponse = putNewTask(newTask, authenticateResponse)

      Post("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get + "/complete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        writeJsonOutput("completeRepeatingTaskResponse", entityAs[String])
        val completeTaskResponse = entityAs[CompleteTaskResult]
        completeTaskResponse.created.get.due.get should be ("2014-01-07")
        val taskResponse = getTask(completeTaskResponse.created.get.uuid.get, authenticateResponse)
        Delete("/" + authenticateResponse.userUUID + "/task/" + taskResponse.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val deleteTaskResponse = entityAs[DeleteItemResult]
          deleteTaskResponse.deleted should not be None
        }
      }
    }
  }
}