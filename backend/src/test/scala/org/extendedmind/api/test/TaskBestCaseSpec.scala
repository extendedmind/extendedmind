/**
 * Copyright (c) 2013-2016 Extended Mind Technologies Oy
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
      + "and get it back with GET to /[userUUID]/task/[taskUUID] "
      + "and delete it with DELETE to /[userUUID]/task/[itemUUID] "
      + "and undelete it with POST to /[userUUID]/task/[itemUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newTask = Task("learn Spanish", None, None, None, None, None, None).copy(ui = Some("testUI"))
      Put("/" + authenticateResponse.userUUID + "/task",
        marshal(newTask).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val putTaskResponse = responseAs[SetResult]
          writeJsonOutput("putTaskResponse", responseAs[String])
          putTaskResponse.modified should not be None
          putTaskResponse.uuid should not be None
          val updatedTask = newTask.copy(due = Some("2014-03-01"))
          Put("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get,
            marshal(updatedTask).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
              val putExistingTaskResponse = responseAs[String]
              writeJsonOutput("putExistingTaskResponse", putExistingTaskResponse)
              putExistingTaskResponse should include("modified")
              putExistingTaskResponse should not include ("uuid")
              Get("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                val taskResponse = responseAs[Task]
                writeJsonOutput("taskResponse", responseAs[String])
                taskResponse.due.get should be("2014-03-01")
                taskResponse.ui.get should be("testUI")
                Delete("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                  val deleteTaskResponse = responseAs[DeleteItemResult]
                  writeJsonOutput("deleteTaskResponse", responseAs[String])
                  Get("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val failure = responseAs[ErrorResult]
                    status should be (BadRequest)
                    failure.description should startWith("Item " + putTaskResponse.uuid.get + " is deleted")
                  }

                  // Deleting again should return the same deleted and modified values
                  Delete("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val redeleteTaskResponse = responseAs[DeleteItemResult]
                    redeleteTaskResponse.deleted should be (deleteTaskResponse.deleted)
                    redeleteTaskResponse.result.modified should be (deleteTaskResponse.result.modified)
                  }

                  Post("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get + "/undelete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val undeleteTaskResponse = responseAs[SetResult]
                    writeJsonOutput("undeleteTaskResponse", responseAs[String])
                    val undeletedTask = getTask(putTaskResponse.uuid.get, authenticateResponse)
                    undeletedTask.deleted should be(None)
                    undeletedTask.modified should not be (None)

                    // Re-undelete should also work
                    Post("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get + "/undelete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                      val reundeleteTaskResponse = responseAs[SetResult]
                      reundeleteTaskResponse.modified should be (undeleteTaskResponse.modified)
                    }
                  }
                }
              }
            }
        }
    }
    it("should successfully update item to task with PUT to /[userUUID]/task/[itemUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newItem = Item("learn how to fly", None, None)
      Put("/" + authenticateResponse.userUUID + "/item",
        marshal(newItem).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val putItemResponse = responseAs[SetResult]
          val updatedToTask = Task("learn how to fly", None, None, Some("2014-03-01"), None, None, None)
          Put("/" + authenticateResponse.userUUID + "/task/" + putItemResponse.uuid.get,
            marshal(updatedToTask).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
              Get("/" + authenticateResponse.userUUID + "/task/" + putItemResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                val taskResponse = responseAs[Task]
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
        writeJsonOutput("completeTaskResponse", responseAs[String])
        val taskResponse = getTask(putTaskResponse.uuid.get, authenticateResponse)
        taskResponse.completed should not be None
        Post("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get + "/uncomplete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          writeJsonOutput("uncompleteTaskResponse", responseAs[String])
          val untaskResponse = getTask(putTaskResponse.uuid.get, authenticateResponse)
          untaskResponse.completed should be(None)
        }
      }
    }
    it("should successfully create repeating task with PUT to /[userUUID]/task "
      + "and create a new task with first complete with POST to /[userUUID]/task/[itemUUID]/complete"
      + "and stop the repeating by deleting the created task with DELETE to /[userUUID]/task/[itemUUID]/complete") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newTask = Task("review inbox", None, None, Some("2013-12-31"), Some(RepeatingType.WEEKLY), None, None)
      val putTaskResponse = putNewTask(newTask, authenticateResponse)
      var taskCount = 0
      Get("/" + authenticateResponse.userUUID + "/items?completed=true") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = responseAs[Items]
        itemsResponse.tasks.get.find(task => task.uuid.get == putTaskResponse.uuid.get).get.completed should be(None)
        taskCount = itemsResponse.tasks.get.length
      }


      Post("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get + "/complete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        writeJsonOutput("completeRepeatingTaskResponse", responseAs[String])
        val completeTaskResponse = responseAs[CompleteTaskResult]
        completeTaskResponse.generated.get.due.get should be ("2014-01-07")
        val generatedTaskResponse = getTask(completeTaskResponse.generated.get.uuid.get, authenticateResponse)
        generatedTaskResponse.completed should be (None)
        generatedTaskResponse.repeating.get should be (RepeatingType.WEEKLY.toString())
        generatedTaskResponse.relationships.get.origin.get should be (putTaskResponse.uuid.get)

        Get("/" + authenticateResponse.userUUID + "/items?completed=true") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val itemsResponse = responseAs[Items]
          itemsResponse.tasks.get.find(task => task.uuid.get == putTaskResponse.uuid.get).get.completed should not be(None)
          itemsResponse.tasks.get.find(task => task.uuid.get == completeTaskResponse.generated.get.uuid.get).get.relationships.get.origin.get should be (putTaskResponse.uuid.get)
          itemsResponse.tasks.get.length should be (taskCount+1)
        }

        // Complete generated task to create a subtask
        Post("/" + authenticateResponse.userUUID + "/task/" + completeTaskResponse.generated.get.uuid.get + "/complete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val completeAgainTaskResponse = responseAs[CompleteTaskResult]
          completeAgainTaskResponse.generated.get.due.get should be ("2014-01-14")

          Get("/" + authenticateResponse.userUUID + "/items?completed=true") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
            val itemsResponse = responseAs[Items]
            itemsResponse.tasks.get.find(task => task.uuid.get == putTaskResponse.uuid.get).get.completed should not be(None)
            itemsResponse.tasks.get.find(task => task.uuid.get == completeTaskResponse.generated.get.uuid.get).get.relationships.get.origin.get should be (putTaskResponse.uuid.get)
            itemsResponse.tasks.get.find(task => task.uuid.get == completeTaskResponse.generated.get.uuid.get).get.completed should not be (None)
            itemsResponse.tasks.get.find(task => task.uuid.get == completeAgainTaskResponse.generated.get.uuid.get).get.relationships.get.origin.get should be (completeTaskResponse.generated.get.uuid.get)
            itemsResponse.tasks.get.find(task => task.uuid.get == completeAgainTaskResponse.generated.get.uuid.get).get.completed should be (None)
            itemsResponse.tasks.get.length should be (taskCount+2)
          }

          // Uncomplete and re-complete and make sure another new task isn't generated
          Post("/" + authenticateResponse.userUUID + "/task/" + completeTaskResponse.generated.get.uuid.get + "/uncomplete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
            val uncompletedTaskResponse = getTask(completeTaskResponse.generated.get.uuid.get, authenticateResponse)
            uncompletedTaskResponse.completed should be(None)
          }
          Post("/" + authenticateResponse.userUUID + "/task/" + completeTaskResponse.generated.get.uuid.get + "/complete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
            val recompleteTaskResponse = responseAs[CompleteTaskResult]
            recompleteTaskResponse.generated should be (None)
            val completedTaskResponse = getTask(completeTaskResponse.generated.get.uuid.get, authenticateResponse)
            completedTaskResponse.completed should not be None
          }
          Get("/" + authenticateResponse.userUUID + "/items?completed=true") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
            val itemsResponse = responseAs[Items]
            itemsResponse.tasks.get.length should be (taskCount+2)
          }

          // Complete subsubtask, and make sure another child is created
          Post("/" + authenticateResponse.userUUID + "/task/" + completeAgainTaskResponse.generated.get.uuid.get + "/complete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
            val completeSubTaskResponse = responseAs[CompleteTaskResult]
            completeSubTaskResponse.generated.get.due.get should be("2014-01-21")
            val generatedSubTaskResponse = getTask(completeAgainTaskResponse.generated.get.uuid.get, authenticateResponse)
            generatedSubTaskResponse.completed should not be (None)
            generatedSubTaskResponse.repeating.get should be(RepeatingType.WEEKLY.toString())

            Get("/" + authenticateResponse.userUUID + "/items?completed=true") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
              val itemsResponse = responseAs[Items]
              itemsResponse.tasks.get.length should be (taskCount+3)
            }

            // Deleting subsubtask ends repeating
            Delete("/" + authenticateResponse.userUUID + "/task/" + completeAgainTaskResponse.generated.get.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
              val deleteTaskResponse = responseAs[DeleteItemResult]
              deleteTaskResponse.deleted should not be None
              Get("/" + authenticateResponse.userUUID + "/items?completed=true") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                val itemsResponse = responseAs[Items]
                itemsResponse.tasks.get.length should be (taskCount+2)
              }
            }
          }
        }
      }
    }

    it("should successfully put new task with tags to /[userUUID]/task, "
      + "and update tags with PUT to /[userUUID]/task/[taskUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Get("/" + authenticateResponse.userUUID + "/items") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = responseAs[Items]
        val newTask = Task("review inbox", None, None, None, None, None, Some(
            ExtendedItemRelationships(None, None, None, None, Some(scala.List(itemsResponse.tags.get(0).uuid.get)), None)))
        val putTaskResponse = putNewTask(newTask, authenticateResponse)

        // Add new tag to tags and update task
        val taskWithAddedTag = newTask.copy(relationships = Some(
            ExtendedItemRelationships(None, None, None, None, Some(
                scala.List(itemsResponse.tags.get(0).uuid.get)),
                None)));
        putExistingTask(taskWithAddedTag, putTaskResponse.uuid.get, authenticateResponse)

        // Find a collective tag from one note
        val noteWithCollectiveTags = itemsResponse.notes.get.find(note => {
          note.relationships.isDefined && note.relationships.get.collectiveTags.isDefined
        }).get

        // Change one tag and update task
        val taskWithChangedTag = taskWithAddedTag.copy(relationships = Some(
            ExtendedItemRelationships(None, None, None, None, Some(
                scala.List(itemsResponse.tags.get(0).uuid.get)),
                noteWithCollectiveTags.relationships.get.collectiveTags)))
        putExistingTask(taskWithChangedTag, putTaskResponse.uuid.get, authenticateResponse)

        // Revert to one tag and update task
        putExistingTask(newTask, putTaskResponse.uuid.get, authenticateResponse)

        val endTask = getTask(putTaskResponse.uuid.get, authenticateResponse)
        endTask.relationships.get.tags.get.size should be (1)
        endTask.relationships.get.tags.get(0) should be (itemsResponse.tags.get(0).uuid.get)
        endTask.relationships.get.collectiveTags should be (None)
      }
    }
    it("should successfully convert task to note with POST to /[userUUID]/task/[itemUUID]/note "
      + "and transform it back with POST to /[userUUID]/note/[itemUUID]/task") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newTask = Task("learn Spanish", Some("would be useful"), None, None, None, None, None)
      val putTaskResponse = putNewTask(newTask, authenticateResponse)

      Post("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get + "/note",
          marshal(newTask.copy(title = "Spanish studies"))) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val noteFromTask = responseAs[Note]
        writeJsonOutput("taskToNoteResponse", responseAs[String])
        noteFromTask.uuid.get should be (putTaskResponse.uuid.get)
        noteFromTask.title should be ("Spanish studies")
        noteFromTask.description should be (None)
        noteFromTask.content.get should be ("would be useful")

        Post("/" + authenticateResponse.userUUID + "/note/" + putTaskResponse.uuid.get + "/task",
          marshal(noteFromTask.copy(title = "learn Spanish"))) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val taskFromNote = responseAs[Task]
          writeJsonOutput("noteToTaskResponse", responseAs[String])
          taskFromNote.uuid.get should be (putTaskResponse.uuid.get)
          taskFromNote.title should be ("learn Spanish")
          taskFromNote.description.get should be ("would be useful")
        }
      }
    }

    it("should successfully put new task with reminder on PUT to /[userUUID]/task, "
      + "add new reminders with PUT to /[userUUID]/task/[taskUUID], "
      + "remove one reminders with PUT to /[userUUID]/task/[taskUUID], "
      + "remove all reminders with PUT to /[userUUID]/task/[taskUUID]") {
      val reminderTime = System.currentTimeMillis + 60000
      val reminderId1 = "1"
      val reminder1 = Reminder(reminderId1, "ln", "ios-cordova", "iPhone6", reminderTime)
      val reminderId2 = "2"
      val reminder2 = Reminder(reminderId2, "ln", "ios-cordova", "iPhone6", reminderTime+1)
      val reminderId3 = "3"
      val reminder3 = Reminder(reminderId3, "ln", "ios-cordova", "iPhone6", reminderTime+2)
      val reminderId4 = "4"
      val reminder4 = Reminder(reminderId4, "ln", "ios-cordova", "iPhone6", reminderTime+3)
      val newTask = Task("learn Spanish", None, None, None, None,
                          Some(scala.List(reminder1)), None)
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val putTaskResponse = putNewTask(newTask, authenticateResponse)
      putTaskResponse.associated.get(0).id should be (reminderId1)
      getTask(putTaskResponse.uuid.get, authenticateResponse).reminders.get(0).id.get should be (reminderId1)

      // Remove and unremove reminder with complete/uncomplete
      val removed = System.currentTimeMillis
      Post("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get + "/complete",
        marshal(ReminderModification(reminderId1, Some(removed))).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val completeResult = responseAs[CompleteTaskResult]
        val taskResponse = getTask(putTaskResponse.uuid.get, authenticateResponse)
        taskResponse.reminders.get(0).id.get should be (reminderId1)
        taskResponse.reminders.get(0).removed.get should be (removed)

        Post("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get + "/uncomplete",
            marshal(ReminderModification(reminderId1, None)).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val uncompleteResult = responseAs[SetResult]
          val untaskResponse = getTask(putTaskResponse.uuid.get, authenticateResponse)
          untaskResponse.reminders.get(0).id.get should be (reminderId1)
          untaskResponse.reminders.get(0).removed should be (None)
        }
      }

      // Change removed value in reminder with delete/undelete
      Delete("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get,
        marshal(ReminderModification(reminderId1, Some(removed))).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val deleteTaskResponse = responseAs[DeleteItemResult]

        Post("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get + "/undelete",
          marshal(ReminderModification(reminderId1, Some(removed + 1))).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val undeleteTaskResponse = responseAs[SetResult]
          val untaskResponse = getTask(putTaskResponse.uuid.get, authenticateResponse)
          untaskResponse.reminders.get(0).id.get should be (reminderId1)
          untaskResponse.reminders.get(0).removed.get should be (removed + 1)
        }
      }

      // Add two reminders
      val updatedTask = newTask.copy(reminders = Some(newTask.reminders.get :+ reminder2 :+ reminder3))
      val putExistingTaskResponse = putExistingTask(updatedTask, putTaskResponse.uuid.get, authenticateResponse)
      val threeReminders = getTask(putTaskResponse.uuid.get, authenticateResponse).reminders.get
      threeReminders.length should be (3)
      putExistingTaskResponse.modified should not be (putTaskResponse.modified)

      // Add fourth and remove first and third
      val twoReminders = threeReminders.filter { reminder => reminder.id.get == reminderId2 } :+ reminder4
      val putAgainExistingTaskResponse = putExistingTask(updatedTask.copy(reminders = Some(twoReminders)), putTaskResponse.uuid.get, authenticateResponse)
      getTask(putTaskResponse.uuid.get, authenticateResponse).reminders.get.length should be (2)
      putAgainExistingTaskResponse.modified should not be (putExistingTaskResponse.modified)

      // Delete every reminder
      val putOnceMoreExistingTaskResponse = putExistingTask(updatedTask.copy(reminders = None), putTaskResponse.uuid.get, authenticateResponse)
      getTask(putTaskResponse.uuid.get, authenticateResponse).reminders should be (None)
      putOnceMoreExistingTaskResponse.modified should not be (putAgainExistingTaskResponse.modified)
    }
  }
}