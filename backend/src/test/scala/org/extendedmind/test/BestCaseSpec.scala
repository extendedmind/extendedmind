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
import org.mockito.Matchers.{eq => mockEq}
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
 * Best case test. Also generates .json files.
 */
class BestCaseSpec extends ImpermanentGraphDatabaseSpecBase {
   
  val mockMailgunClient = mock[MailgunClient]

  object TestDataGeneratorConfiguration extends Module{
    bind [GraphDatabase] to db
    bind [MailgunClient] to mockMailgunClient
  }

  override def configurations = TestDataGeneratorConfiguration :: new Configuration(settings, actorRefFactory)

  before{
    db.insertTestData()
  }
  
  after {
    cleanDb(db.ds.gds)
    reset(mockMailgunClient)
  }
  
  describe("Extended Mind Backend"){
    it("should create an administrator with POST to /signup because adminSignUp is set to true"){
      val signUp = SignUp("test@ext.md", "infopwd")
      Post("/signup",
          marshal(signUp).right.get
          ) ~> emRoute ~> check {
        val signUpResponse = entityAs[String]
        writeJsonOutput("signUpResponse", signUpResponse)
        signUpResponse should include("uuid")
        signUpResponse should include("modified")
        val authenticationResponse = emailPasswordAuthenticate(signUp.email, signUp.password)
        authenticationResponse.userType should be(0)
      }
    }
    it("should return token on authenticate"){
      Post("/authenticate"
          ) ~> addHeader(Authorization(BasicHttpCredentials(TIMO_EMAIL, TIMO_PASSWORD))
          ) ~> emRoute ~> check { 
        val authenticateResponse = entityAs[String]
        writeJsonOutput("authenticateResponse", authenticateResponse)
        authenticateResponse should include("token")
      }
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      authenticateResponse.token should not be (None)
    }
    it("should swap token on token authentication"){
      val authenticateResponse = emailPasswordAuthenticateRememberMe(TIMO_EMAIL, TIMO_PASSWORD)
      val payload = AuthenticatePayload(true)
      Post("/authenticate", marshal(payload).right.get
          ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
          ) ~> emRoute ~> check { 
        val tokenAuthenticateResponse = entityAs[SecurityContext]
        tokenAuthenticateResponse.token.get should not be (authenticateResponse.token.get)
      }
    }
    it("should generate item list response on /[userUUID]/items") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Get("/" + authenticateResponse.userUUID + "/items"
          ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
          ) ~> emRoute ~> check {
        val itemsResponse = entityAs[Items]
        writeJsonOutput("itemsResponse", entityAs[String])
        itemsResponse.items should not be None
        itemsResponse.tasks should not be None
        itemsResponse.tasks.get.length should equal(4)
        itemsResponse.notes should not be None
      }
    }
    it("should successfully put new item on PUT to /[userUUID]/item "
         + "update it with PUT to /[userUUID]/item/[itemUUID] "
         + "and get it back with GET to /[userUUID]/item/[itemUUID] "
         + "and delete it with DELETE to /[userUUID]/item/[itemUUID] "
         + "and undelete it with POST to /[userUUID]/item/[itemUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newItem = Item(None, None, None, "learn how to fly", None)
      Put("/" + authenticateResponse.userUUID + "/item",
            marshal(newItem).right.get
                ) ~> addHeader("Content-Type", "application/json"
                ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                ) ~> emRoute ~> check {
        val putItemResponse = entityAs[SetResult]
        writeJsonOutput("putItemResponse", entityAs[String])
        putItemResponse.modified should not be None
        putItemResponse.uuid should not be None

        val updatedItem = Item(None, None, None, "learn how to fly", Some("not kidding"))
        Put("/" + authenticateResponse.userUUID + "/item/" + putItemResponse.uuid.get,
            marshal(updatedItem).right.get
                ) ~> addHeader("Content-Type", "application/json"
                ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                ) ~> emRoute ~> check {
          val putExistingItemResponse = entityAs[String]
          writeJsonOutput("putExistingItemResponse", putExistingItemResponse)
          putExistingItemResponse should include("modified")
          putExistingItemResponse should not include("uuid")
          Get("/" + authenticateResponse.userUUID + "/item/" + putItemResponse.uuid.get
                ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                ) ~> emRoute ~> check {
            val itemResponse = entityAs[Item]
            writeJsonOutput("itemResponse", entityAs[String])
            itemResponse.description.get should be("not kidding")
  	        Delete("/" + authenticateResponse.userUUID + "/item/" + putItemResponse.uuid.get
  	                ) ~> addHeader("Content-Type", "application/json"
  	                ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
  	                ) ~> emRoute ~> check {
  	          val deleteItemResponse = entityAs[String]
  	          writeJsonOutput("deleteItemResponse", deleteItemResponse)
  	          deleteItemResponse should include("deleted")
  	          Get("/" + authenticateResponse.userUUID + "/item/" + putItemResponse.uuid.get
                ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                ) ~> emRoute ~> check {
                val failure = entityAs[String]
                // TODO: Fix bug with Internal Server Error!
                failure should include("error")
              }
              Post("/" + authenticateResponse.userUUID + "/item/" + putItemResponse.uuid.get + "/undelete"
                      ) ~> addHeader("Content-Type", "application/json"
                      ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                      ) ~> emRoute ~> check {
                val undeleteItemResponse = entityAs[String]
                writeJsonOutput("undeleteItemResponse", undeleteItemResponse)
                undeleteItemResponse should include("modified")
                val undeletedItem = getItem(putItemResponse.uuid.get, authenticateResponse)
                undeletedItem.deleted should be (None)
                undeletedItem.modified should not be(None)
              }            
  	        }
          }
        }
      }
    }
    it("should successfully put new task on PUT to /[userUUID]/task, " 
         + "update it with PUT to /[userUUID]/task/[taskUUID] " 
         + "and get it back with GET to /[userUUID]/task/[taskUUID]"
         + "and delete it with DELETE to /[userUUID]/task/[itemUUID] "
         + "and undelete it with POST to /[userUUID]/task/[itemUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newTask = Task("learn Spanish", None, None, None, None, None)
      Put("/" + authenticateResponse.userUUID + "/task",
            marshal(newTask).right.get
                ) ~> addHeader("Content-Type", "application/json"
                ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                ) ~> emRoute ~> check {
        val putTaskResponse = entityAs[SetResult]
        writeJsonOutput("putTaskResponse", entityAs[String])
        putTaskResponse.modified should not be None
        putTaskResponse.uuid should not be None  
        val updatedTask = newTask.copy(due = Some("2014-03-01"))
        Put("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get,
            marshal(updatedTask).right.get
                ) ~> addHeader("Content-Type", "application/json"
                ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                ) ~> emRoute ~> check {
          val putExistingTaskResponse = entityAs[String]
          writeJsonOutput("putExistingTaskResponse", putExistingTaskResponse)
          putExistingTaskResponse should include("modified")
          putExistingTaskResponse should not include("uuid")
          Get("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get
              ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
              ) ~> emRoute ~> check {
            val taskResponse = entityAs[Task]
            writeJsonOutput("taskResponse", entityAs[String])
            taskResponse.due.get should be("2014-03-01")
            Delete("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get
                    ) ~> addHeader("Content-Type", "application/json"
                    ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                    ) ~> emRoute ~> check {
              val deleteTaskResponse = entityAs[String]
              writeJsonOutput("deleteTaskResponse", deleteTaskResponse)
              deleteTaskResponse should include("deleted")
              Get("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get
                ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                ) ~> emRoute ~> check {
                val failure = entityAs[String]
                // TODO: Fix bug with Internal Server Error!
                failure should include("error")
              }
              Post("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get + "/undelete"
                      ) ~> addHeader("Content-Type", "application/json"
                      ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                      ) ~> emRoute ~> check {
                val undeleteTaskResponse = entityAs[String]
                writeJsonOutput("undeleteTaskResponse", undeleteTaskResponse)
                undeleteTaskResponse should include("modified")
                val undeletedTask = getTask(putTaskResponse.uuid.get, authenticateResponse)
                undeletedTask.deleted should be (None)
                undeletedTask.modified should not be(None)
              }            
            }
          }
        }
      }
    }
    it("should successfully put new note on PUT to /[userUUID]/note, " 
         + "update it with PUT to /[userUUID]/note/[noteUUID] " 
         + "and get it back with GET to /[userUUID]/note/[noteUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newNote = Note("home measurements", None, Some("bedroom wall: 420cm*250cm"), None, None)
      Put("/" + authenticateResponse.userUUID + "/note",
            marshal(newNote).right.get
                ) ~> addHeader("Content-Type", "application/json"
                ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                ) ~> emRoute ~> check {
        val putNoteResponse = entityAs[SetResult]
        writeJsonOutput("putNoteResponse", entityAs[String])
        putNoteResponse.modified should not be None
        putNoteResponse.uuid should not be None

        val updatedNote = newNote.copy(description = Some("Helsinki home dimensions"))
        Put("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get,
            marshal(updatedNote).right.get
                ) ~> addHeader("Content-Type", "application/json"
                ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                ) ~> emRoute ~> check {
          val putExistingNoteResponse = entityAs[String]
          writeJsonOutput("putExistingNoteResponse", putExistingNoteResponse)
          putExistingNoteResponse should include("modified")
          putExistingNoteResponse should not include("uuid")
          Get("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get
                ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                ) ~> emRoute ~> check {
            val noteResponse = entityAs[Note]
            writeJsonOutput("noteResponse", entityAs[String])
            noteResponse.content should not be None
            noteResponse.description.get should be("Helsinki home dimensions")
            Delete("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get
                    ) ~> addHeader("Content-Type", "application/json"
                    ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                    ) ~> emRoute ~> check {
              val deleteNoteResponse = entityAs[String]
              writeJsonOutput("deleteNoteResponse", deleteNoteResponse)
              deleteNoteResponse should include("deleted")
              Get("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get
                ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                ) ~> emRoute ~> check {
                val failure = entityAs[String]
                // TODO: Fix bug with Internal Server Error!
                failure should include("error")
              }
              Post("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get + "/undelete"
                      ) ~> addHeader("Content-Type", "application/json"
                      ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                      ) ~> emRoute ~> check {
                val undeleteNoteResponse = entityAs[String]
                writeJsonOutput("undeleteNoteResponse", undeleteNoteResponse)
                undeleteNoteResponse should include("modified")
                val undeletedTask = getNote(putNoteResponse.uuid.get, authenticateResponse)
                undeletedTask.deleted should be (None)
                undeletedTask.modified should not be(None)
              }
            }            
          }
        }
      }
    }
    it("should successfully put new tag on PUT to /[userUUID]/tag, " 
         + "update it with PUT to /[userUUID]/tag/[tagUUID] " 
         + "and get it back with GET to /[userUUID]/tag/[tagUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newTag = Tag("home", None, CONTEXT, None, None)
      Put("/" + authenticateResponse.userUUID + "/tag",
            marshal(newTag).right.get
                ) ~> addHeader("Content-Type", "application/json"
                ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                ) ~> emRoute ~> check {
        val putTagResponse = entityAs[SetResult]
        writeJsonOutput("putTagResponse", entityAs[String])
        putTagResponse.modified should not be None
        putTagResponse.uuid should not be None  
        val updatedTag = newTag.copy(description = Some("my home"))
        Put("/" + authenticateResponse.userUUID + "/tag/" + putTagResponse.uuid.get,
            marshal(updatedTag).right.get
                ) ~> addHeader("Content-Type", "application/json"
                ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                ) ~> emRoute ~> check {
          val putExistingTagResponse = entityAs[String]
          writeJsonOutput("putExistingTagResponse", putExistingTagResponse)
          putExistingTagResponse should include("modified")
          putExistingTagResponse should not include("uuid")
          Get("/" + authenticateResponse.userUUID + "/tag/" + putTagResponse.uuid.get
              ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
              ) ~> emRoute ~> check {
            val tagResponse = entityAs[Tag]
            writeJsonOutput("tagResponse", entityAs[String])
            tagResponse.description.get should be("my home")
            // Add the tag to a Note
            val newNote = Note("bike details", None, Some("model: 12345"), None, 
                Some(ExtendedItemRelationships(None, None, Some(List(putTagResponse.uuid.get)))))    
            val putNoteResponse = putNewNote(newNote, authenticateResponse)  
            val noteWithTag = getNote(putNoteResponse.uuid.get, authenticateResponse)
            noteWithTag.relationships.get.tags.get should be (List(putTagResponse.uuid.get))
          }
        }
      }
    }
    it("should successfully update item to task with PUT to /[userUUID]/task/[itemUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newItem = Item(None, None, None, "learn how to fly", None)
      Put("/" + authenticateResponse.userUUID + "/item",
          marshal(newItem).right.get
              ) ~> addHeader("Content-Type", "application/json"
              ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
              ) ~> emRoute ~> check {
        val putItemResponse = entityAs[SetResult]          
        val updatedToTask = Task("learn how to fly", None, Some("2014-03-01"), None, None, None)
        Put("/" + authenticateResponse.userUUID + "/task/" + putItemResponse.uuid.get,
          marshal(updatedToTask).right.get
              ) ~> addHeader("Content-Type", "application/json"
              ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
              ) ~> emRoute ~> check {
          Get("/" + authenticateResponse.userUUID + "/task/" + putItemResponse.uuid.get
                ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                ) ~> emRoute ~> check {
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
      
      Post("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get + "/complete"
            ) ~> addHeader("Content-Type", "application/json"
            ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
            ) ~> emRoute ~> check {
        writeJsonOutput("completeTaskResponse", entityAs[String])
        val taskResponse = getTask(putTaskResponse.uuid.get, authenticateResponse)
        taskResponse.completed should not be None
        Post("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get + "/uncomplete"
              ) ~> addHeader("Content-Type", "application/json"
              ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
              ) ~> emRoute ~> check {
          writeJsonOutput("uncompleteTaskResponse", entityAs[String])
          val untaskResponse = getTask(putTaskResponse.uuid.get, authenticateResponse)
          untaskResponse.completed should be (None)
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
      taskResponse2.parentNote should be (None)
      taskResponse2.parentTask should be (None)
      val parentTaskResponse2 = getTask(putTaskResponse.uuid.get, authenticateResponse)
      parentTaskResponse2.project.get should equal(true)
      val parentNoteResponse2 = getNote(putNoteResponse.uuid.get, authenticateResponse)
      parentNoteResponse2.area should be (None)
    }
    it("should delete items, notes and tasks and generate shorter item list response on /[userUUID]/items ") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      
      
      Get("/" + authenticateResponse.userUUID + "/items"
          ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
          ) ~> emRoute ~> check {
        val itemsResponse = entityAs[Items]
        writeJsonOutput("itemsResponse", entityAs[String])
        itemsResponse.items should not be None
        itemsResponse.tasks should not be None
        itemsResponse.tasks.get.length should equal(4)
        itemsResponse.notes should not be None
        
        val numberOfItems = itemsResponse.items.get.length
        val numberOfTasks = itemsResponse.tasks.get.length
        val numberOfNotes = itemsResponse.notes.get.length
        val deletedItem = itemsResponse.items.get(0)
        val deletedTask = itemsResponse.tasks.get(0)
        val deletedNote = itemsResponse.notes.get(1)
        Delete("/" + authenticateResponse.userUUID + "/item/" + deletedItem.uuid.get
                    ) ~> addHeader("Content-Type", "application/json"
                    ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                    ) ~> emRoute ~> check {
           entityAs[String] should include("deleted")
        }
        Delete("/" + authenticateResponse.userUUID + "/task/" + deletedTask.uuid.get
                    ) ~> addHeader("Content-Type", "application/json"
                    ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                    ) ~> emRoute ~> check {
           entityAs[String] should include("deleted")
        }
        Delete("/" + authenticateResponse.userUUID + "/note/" + deletedNote.uuid.get
                    ) ~> addHeader("Content-Type", "application/json"
                    ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                    ) ~> emRoute ~> check {
           entityAs[String] should include("deleted")
        }
        Get("/" + authenticateResponse.userUUID + "/items"
            ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
            ) ~> emRoute ~> check {
          val shorterItemsResponse = entityAs[Items]
          shorterItemsResponse.items.get.length should be (numberOfItems - 1)
          shorterItemsResponse.tasks.get.length should be (numberOfTasks - 1)
          shorterItemsResponse.notes.get.length should be (numberOfNotes - 1)

        }
      }
    }
    
    it("should successfully create invite requests with POST to /invite/request "
       + "and get them back with GET to /invite/requests "
       + "and get the right order number with GET to /invite/request/[UUID] "
       + "and delete it with DELETE to /invite/request/[UUID]") {
      val testEmail = "example@example.com"
      val testInviteRequest = InviteRequest(testEmail, None)
      val testEmail2 = "example2@example.com"
      val testInviteRequest2 = InviteRequest(testEmail2, None)
      val testEmail3 = "example3@example.com"
      val testInviteRequest3 = InviteRequest(testEmail3, None)

      stub(mockMailgunClient.sendRequestInviteConfirmation(mockEq(testEmail), anyObject())).toReturn(
          Future{SendEmailResponse("OK", "1234")})
      stub(mockMailgunClient.sendRequestInviteConfirmation(mockEq(testEmail2), anyObject())).toReturn(
          Future{SendEmailResponse("OK", "12345")})
      stub(mockMailgunClient.sendRequestInviteConfirmation(mockEq(testEmail3), anyObject())).toReturn(
          Future{SendEmailResponse("OK", "123456")})
      stub(mockMailgunClient.sendInvite(anyObject())).toReturn(
          Future{SendEmailResponse("OK", "1234567")})
      Post("/invite/request",
         marshal(testInviteRequest).right.get
            ) ~> addHeader("Content-Type", "application/json"
            ) ~> emRoute ~> check {
        writeJsonOutput("inviteRequestResponse", entityAs[String])
        val inviteRequestResponse = entityAs[SetResult]
        inviteRequestResponse.uuid should not be None
        inviteRequestResponse.modified should not be None
        
        Post("/invite/request",
         marshal(testInviteRequest2).right.get
            ) ~> addHeader("Content-Type", "application/json"
            ) ~> emRoute ~> check {
          val inviteRequestResponse2 = entityAs[SetResult]

          Post("/invite/request",
           marshal(testInviteRequest3).right.get
              ) ~> addHeader("Content-Type", "application/json"
              ) ~> emRoute ~> check {
              val inviteRequestResponse3 = entityAs[SetResult]

              verify(mockMailgunClient).sendRequestInviteConfirmation(testEmail, inviteRequestResponse.uuid.get)
              verify(mockMailgunClient).sendRequestInviteConfirmation(testEmail2, inviteRequestResponse2.uuid.get)
              verify(mockMailgunClient).sendRequestInviteConfirmation(testEmail3, inviteRequestResponse3.uuid.get)
              // Get the request back
              val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
              Get("/invite/requests"
                    ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                    ) ~> emRoute ~> check {
                  val inviteRequests = entityAs[InviteRequests]
                  writeJsonOutput("inviteRequests", entityAs[String])
                  inviteRequests.inviteRequests(0).email should be(testEmail)
                  inviteRequests.inviteRequests(1).email should be(testEmail2)
                  inviteRequests.inviteRequests(2).email should be (testEmail3)
                  // Get order number for invites
                  Get("/invite/request/" + inviteRequestResponse.uuid.get
                    ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                    ) ~> emRoute ~> check {
                    entityAs[InviteRequestQueueNumber].queueNumber should be(1)
                  }
                  Get("/invite/request/" + inviteRequestResponse2.uuid.get
                    ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                    ) ~> emRoute ~> check {
                    entityAs[InviteRequestQueueNumber].queueNumber should be(2)
                  }
                  Get("/invite/request/" + inviteRequestResponse3.uuid.get
                    ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                    ) ~> emRoute ~> check {
                    entityAs[InviteRequestQueueNumber].queueNumber should be(3)
                  }
                  
                  // Delete the middle invite request
                  Delete("/invite/request/" + inviteRequestResponse2.uuid.get
                    ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                    ) ~> emRoute ~> check {
                    val deleteInviteRequestResponse = entityAs[DestroyResult]
                    writeJsonOutput("deleteInviteRequestResponse", entityAs[String])
                    deleteInviteRequestResponse.destroyed.size should be (1)
                  }
                  // Verify that the last one is now number 2 
                  Get("/invite/request/" + inviteRequestResponse3.uuid.get
                    ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                    ) ~> emRoute ~> check {
                    entityAs[InviteRequestQueueNumber].queueNumber should be(2)
                  }
                  // Accept invite request  
                  Post("/invite/request/" + inviteRequestResponse.uuid.get + "/accept",
                   marshal(InviteRequestAcceptDetails(None)).right.get
                      ) ~> addHeader("Content-Type", "application/json"
                      ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                      ) ~> emRoute ~> check {
                    val acceptInviteRequestResponse = entityAs[SetResult]
                    writeJsonOutput("acceptInviteRequestResponse", entityAs[String])
                    acceptInviteRequestResponse.uuid should not be None
                  }
                  verify(mockMailgunClient).sendInvite(anyObject())
                  
                  // Verify that the last one is now number 1 
                  Get("/invite/request/" + inviteRequestResponse3.uuid.get
                    ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                    ) ~> emRoute ~> check {
                    entityAs[InviteRequestQueueNumber].queueNumber should be(1)
                  }
                    
                  // Get the invites
                  Get("/invites"
                    ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                    ) ~> emRoute ~> check {
                    val invites = entityAs[Invites]
                    writeJsonOutput("invites", entityAs[String])
                    assert(invites.invites.size === 1)
                    // Accept invite
                    val testPassword = "testPassword"
                    Post("/invite/" + invites.invites(0).code.toHexString + "/accept",
                     marshal(SignUp(invites.invites(0).email, testPassword)).right.get
                        ) ~> addHeader("Content-Type", "application/json"
                        ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
                        ) ~> emRoute ~> check {
                      val acceptInviteResponse = entityAs[SetResult]
                      writeJsonOutput("acceptInviteResponse", entityAs[String])
                      acceptInviteResponse.uuid should not be None
                      // Should be possible to authenticate with the new email/password
                      val newUserAuthenticateResponse = 
                        emailPasswordAuthenticate(invites.invites(0).email, testPassword)
                    }
                  }
               }
            }
        }
      }
    }
    it("should successfully create new collective with PUT to /collective"
         + "update it with PUT to /collective/[collectiveUUID] " 
         + "and get it back with GET to /collective/[collectiveUUID]") {    
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val testCollective = Collective("Test", None)
      Put("/collective",
         marshal(testCollective).right.get
            ) ~> addHeader("Content-Type", "application/json"
            ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
            ) ~> emRoute ~> check {
        writeJsonOutput("putCollectiveResponse", entityAs[String])
        val putCollectiveResponse = entityAs[SetResult]
        putCollectiveResponse.uuid should not be None
        putCollectiveResponse.modified should not be None
        
        // Authenticating again should have the new collective
        val reauthenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
        reauthenticateResponse.collectives should not be None
        reauthenticateResponse.collectives.get.get(putCollectiveResponse.uuid.get).get._1 should equal(testCollective.title)
        reauthenticateResponse.collectives.get.get(putCollectiveResponse.uuid.get).get._2 should equal(0)
        
        // Update collective
        Put("/collective/" + putCollectiveResponse.uuid.get,
           marshal(testCollective.copy(description = Some("test description"))).right.get
              ) ~> addHeader("Content-Type", "application/json"
              ) ~> addCredentials(BasicHttpCredentials("token", reauthenticateResponse.token.get)
              ) ~> emRoute ~> check {
          writeJsonOutput("putExistingCollectiveResponse", entityAs[String])
          val putExistingCollectiveResponse = entityAs[SetResult]
          putExistingCollectiveResponse.uuid should be (None)
          assert(putExistingCollectiveResponse.modified > putCollectiveResponse.modified)
          // Get it back
          Get("/collective/" + putCollectiveResponse.uuid.get
              ) ~> addCredentials(BasicHttpCredentials("token", reauthenticateResponse.token.get)
              ) ~> emRoute ~> check {
            val collectiveResponse = entityAs[Collective]
            writeJsonOutput("collectiveResponse", entityAs[String])
            collectiveResponse.description.get should be("test description")

            // Should be possible to assign read/write access to new collective
            val lauriAuthenticateResponse = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
            lauriAuthenticateResponse.collectives.get.get(putCollectiveResponse.uuid.get).get._2 should equal(1)

            Post("/collective/" + putCollectiveResponse.uuid.get + "/user/" + getUserUUID(LAURI_EMAIL, reauthenticateResponse),
                marshal(UserAccessRight(Some(2))).right.get
                ) ~> addCredentials(BasicHttpCredentials("token", reauthenticateResponse.token.get)
                ) ~> emRoute ~> check {
               val postCollectiveUserPermission = entityAs[SetResult]
               writeJsonOutput("postCollectiveUserPermission", entityAs[String])
               assert(postCollectiveUserPermission.modified > putExistingCollectiveResponse.modified)
               val lauriReauthenticateResponse = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
               lauriReauthenticateResponse.collectives.get.get(putCollectiveResponse.uuid.get).get._2 should equal(2)
            }
          }
        }
      }
    }
    it("should successfully get user with GET /user?email=[email]") {    
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Get("/user?email=" + LAURI_EMAIL
         ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
         ) ~> emRoute ~> check {
        writeJsonOutput("getUserResponse", entityAs[String])
        val publicUser = entityAs[PublicUser]
        publicUser.uuid should not be None
      }
    }
    it("should successfully get collective items with GET to /[collectiveUUID]/items "
         + "put new task on PUT to /[collectiveUUID]/task "
         + "update it with PUT to /[collectiveUUID]/task/[itemUUID] "
         + "and get it back with GET to /[collectiveUUID]/task/[itemUUID]") {    
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val collectiveUuidMap = getCollectiveUUIDMap(authenticateResponse)
      val emtUUID = collectiveUuidMap.get("extended mind technologies").get
      Get("/" + emtUUID + "/items"
          ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
          ) ~> emRoute ~> check {
        val itemsResponse = entityAs[Items]
        writeJsonOutput("collectiveItemsResponse", entityAs[String])
        itemsResponse.items should not be None
        itemsResponse.tasks should not be None
        itemsResponse.tasks.get.length should equal(1)
        itemsResponse.notes should not be None
      }
      val newTask = Task("change border colour to lighter gray", None, None, None, None, None)
      val putTaskResponse = putNewTask(newTask, authenticateResponse, Some(emtUUID))
      val putExistingTaskResponse = putExistingTask(newTask.copy(description = Some("e.g. #EDEDED")), 
                                                    putTaskResponse.uuid.get, authenticateResponse, Some(emtUUID))
      assert(putExistingTaskResponse.modified > putTaskResponse.modified)
      
      val updatedTask = getTask(putTaskResponse.uuid.get, authenticateResponse, Some(emtUUID))
      updatedTask.description should not be None
    }
    
    it("should successfully lögout with POST to /logout") {    
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Post("/logout"
            ) ~> addHeader("Content-Type", "application/json"
            ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
            ) ~> emRoute ~> check {
        writeJsonOutput("logoutResponse", entityAs[String])
        val logoutResponse = entityAs[DeleteCountResult]
        logoutResponse.deleteCount should equal (1)
      }
      val authenticateResponse1 = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
      val authenticateResponse2 = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
      Post("/logout",
          marshal(LogoutPayload(true)).right.get
            ) ~> addHeader("Content-Type", "application/json"
            ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse1.token.get)
            ) ~> emRoute ~> check {
        val logoutResponse = entityAs[DeleteCountResult]
        logoutResponse.deleteCount should equal (2)
      }
    }
  }
  
  def emailPasswordAuthenticate(email: String, password: String): SecurityContext = {
    Post("/authenticate"
        ) ~> addHeader(Authorization(BasicHttpCredentials(email, password))
        ) ~> emRoute ~> check { 
      entityAs[SecurityContext]
    }
  }
  
  def emailPasswordAuthenticateRememberMe(email: String, password: String): SecurityContext = {
    Post("/authenticate", marshal(AuthenticatePayload(true)).right.get
        ) ~> addHeader(Authorization(BasicHttpCredentials(email, password))
        ) ~> emRoute ~> check { 
      entityAs[SecurityContext]
    }
  }
  
  def putNewNote(newNote: Note, authenticateResponse: SecurityContext): SetResult = {
     Put("/" + authenticateResponse.userUUID + "/note",
        marshal(newNote).right.get
            ) ~> addHeader("Content-Type", "application/json"
            ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
            ) ~> emRoute ~> check {
       entityAs[SetResult]
     }
  }
  
  def putExistingNote(existingNote: Note, noteUUID: UUID, authenticateResponse: SecurityContext): SetResult = {
     Put("/" + authenticateResponse.userUUID + "/note/" + noteUUID.toString(),
        marshal(existingNote).right.get
            ) ~> addHeader("Content-Type", "application/json"
            ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
            ) ~> emRoute ~> check {
       entityAs[SetResult]
     }
  }
  
  def putNewTask(newTask: Task, authenticateResponse: SecurityContext, collectiveUUID: Option[UUID] = None): SetResult = {
     val ownerUUID = if (collectiveUUID.isDefined) collectiveUUID.get else authenticateResponse.userUUID
     Put("/" + ownerUUID + "/task",
        marshal(newTask).right.get
            ) ~> addHeader("Content-Type", "application/json"
            ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
            ) ~> emRoute ~> check {
       entityAs[SetResult]
     }
  }
  
  def putExistingTask(existingTask: Task, taskUUID: UUID, authenticateResponse: SecurityContext, 
                      collectiveUUID: Option[UUID] = None): SetResult = {
     val ownerUUID = if (collectiveUUID.isDefined) collectiveUUID.get else authenticateResponse.userUUID
     Put("/" + ownerUUID + "/task/" + taskUUID.toString(),
        marshal(existingTask).right.get
            ) ~> addHeader("Content-Type", "application/json"
            ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
            ) ~> emRoute ~> check {
       entityAs[SetResult]
     }
  }

    
  def getItem(itemUUID: UUID, authenticateResponse: SecurityContext): Item = {
    Get("/" + authenticateResponse.userUUID + "/item/" + itemUUID
        ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
        ) ~> emRoute ~> check {
      entityAs[Item]
    }
  }
  
  def getTask(taskUUID: UUID, authenticateResponse: SecurityContext, collectiveUUID: Option[UUID] = None): Task = {
    val ownerUUID = if (collectiveUUID.isDefined) collectiveUUID.get else authenticateResponse.userUUID    
    Get("/" + ownerUUID + "/task/" + taskUUID
        ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
        ) ~> emRoute ~> check {
      entityAs[Task]
    }
  }
  
  def getNote(noteUUID: UUID, authenticateResponse: SecurityContext): Note = {
    Get("/" + authenticateResponse.userUUID + "/note/" + noteUUID
        ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
        ) ~> emRoute ~> check {
      entityAs[Note]
    }
  }
  
  def getUserUUID(email: String, authenticateResponse: SecurityContext): UUID = {
    Get("/user?email=" + email
        ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)
        ) ~> emRoute ~> check {
      entityAs[PublicUser].uuid
    }
  }
  
  // Helper file writer
  def writeJsonOutput(filename: String, contents: String): Unit = {
    Some(new PrintWriter(db.TEST_DATA_DESTINATION + "/" + filename + ".json")).foreach { p => p.write(contents); p.close }
  }
}
