package org.extendedmind.test

import java.io.PrintWriter
import java.util.UUID
import org.extendedmind._
import org.extendedmind.bl._
import org.extendedmind.db._
import org.extendedmind.domain._
import org.extendedmind.security._
import org.extendedmind.test.TestGraphDatabase.TIMO_EMAIL
import org.extendedmind.test.TestGraphDatabase.TIMO_PASSWORD
import org.mockito.Mockito.reset
import org.mockito.Mockito.stub
import org.mockito.Mockito.verify
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
import org.extendedmind.api.test.ImpermanentGraphDatabaseSpecBase

/**
 * Best case test. Also generates .json files.
 */
class BestCaseSpec extends ImpermanentGraphDatabaseSpecBase {
    
  object TestDataGeneratorConfiguration extends Module{
    bind [GraphDatabase] to db
  }
  
  override def configurations = TestDataGeneratorConfiguration :: new Configuration(settings)

  before{
    db.insertTestData()
  }
  
  after {
    cleanDb(db.ds.gds)
  }
  
  describe("Extended Mind Backend"){
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
          ) ~> addHeader(Authorization(BasicHttpCredentials("token", authenticateResponse.token.get))
          ) ~> emRoute ~> check { 
        val tokenAuthenticateResponse = entityAs[SecurityContext]
        tokenAuthenticateResponse.token.get should not be (authenticateResponse.token.get)
      }
    }
    it("should generate item list response on /[userUUID]/items") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Get("/" + authenticateResponse.userUUID + "/items"
          ) ~> addHeader(Authorization(BasicHttpCredentials("token", authenticateResponse.token.get))
          ) ~> emRoute ~> check {
        val itemsResponse = entityAs[String]
        writeJsonOutput("itemsResponse", itemsResponse)
        itemsResponse should include("book flight")
      }
    }
    it("should successfully put new item on PUT to /[userUUID]/item "
         + "update it with PUT to /[userUUID]/item/[itemUUID] "
         + "and get it back with GET to /[userUUID]/item/[itemUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newItem = Item(None, None, "learn how to fly", None)
      Put("/" + authenticateResponse.userUUID + "/item",
            marshal(newItem).right.get
                ) ~> addHeader("Content-Type", "application/json"
                ) ~> addHeader(Authorization(BasicHttpCredentials("token", authenticateResponse.token.get))
                ) ~> emRoute ~> check {
        val putItemResponse = entityAs[SetResult]
        writeJsonOutput("putItemResponse", entityAs[String])
        putItemResponse.modified should not be None
        putItemResponse.uuid should not be None

        val updatedItem = Item(None, None, "learn how to fly", Some("not kidding"))
        Put("/" + authenticateResponse.userUUID + "/item/" + putItemResponse.uuid.get,
            marshal(updatedItem).right.get
                ) ~> addHeader("Content-Type", "application/json"
                ) ~> addHeader(Authorization(BasicHttpCredentials("token", authenticateResponse.token.get))
                ) ~> emRoute ~> check {
          val putExistingItemResponse = entityAs[String]
          writeJsonOutput("putExistingItemResponse", putExistingItemResponse)
          putExistingItemResponse should include("modified")
          putExistingItemResponse should not include("uuid")
          Get("/" + authenticateResponse.userUUID + "/item/" + putItemResponse.uuid.get
                ) ~> addHeader(Authorization(BasicHttpCredentials("token", authenticateResponse.token.get))
                ) ~> emRoute ~> check {
            val itemResponse = entityAs[Item]
            writeJsonOutput("itemResponse", entityAs[String])
            itemResponse.description.get should be("not kidding")
          }
        }
      }
    }
    it("should successfully put new task on PUT to /[userUUID]/task, " 
         + "update it with PUT to /[userUUID]/task/[taskUUID] " 
         + "and get it back with GET to /[userUUID]/task/[taskUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newTask = TaskWrapper("learn Spanish", None, None, None, None, None, None)
      Put("/" + authenticateResponse.userUUID + "/task",
            marshal(newTask).right.get
                ) ~> addHeader("Content-Type", "application/json"
                ) ~> addHeader(Authorization(BasicHttpCredentials("token", authenticateResponse.token.get))
                ) ~> emRoute ~> check {
        val putTaskResponse = entityAs[SetResult]
        writeJsonOutput("putTaskResponse", entityAs[String])
        putTaskResponse.modified should not be None
        putTaskResponse.uuid should not be None  
        val updatedTask = TaskWrapper("learn Spanish", None, Some("2014-03-01"), None, None, None, None)
        Put("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get,
            marshal(updatedTask).right.get
                ) ~> addHeader("Content-Type", "application/json"
                ) ~> addHeader(Authorization(BasicHttpCredentials("token", authenticateResponse.token.get))
                ) ~> emRoute ~> check {
          val putExistingTaskResponse = entityAs[String]
          writeJsonOutput("putExistingItemResponse", putExistingTaskResponse)
          putExistingTaskResponse should include("modified")
          putExistingTaskResponse should not include("uuid")
          Get("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get
              ) ~> addHeader(Authorization(BasicHttpCredentials("token", authenticateResponse.token.get))
              ) ~> emRoute ~> check {
            val taskResponse = entityAs[Task]
            writeJsonOutput("taskResponse", entityAs[String])
            taskResponse.due.get should be("2014-03-01")
          }
        }
      }
    }
    it("should successfully put new note on PUT to /[userUUID]/note, " 
         + "update it with PUT to /[userUUID]/note/[noteUUID] " 
         + "and get it back with GET to /[userUUID]/note/[noteUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newNote = NoteWrapper("home measurements", None, Some("bedroom wall: 420cm*250cm"), None, None, None)
      Put("/" + authenticateResponse.userUUID + "/note",
            marshal(newNote).right.get
                ) ~> addHeader("Content-Type", "application/json"
                ) ~> addHeader(Authorization(BasicHttpCredentials("token", authenticateResponse.token.get))
                ) ~> emRoute ~> check {
        val putNoteResponse = entityAs[SetResult]
        writeJsonOutput("putNoteResponse", entityAs[String])
        putNoteResponse.modified should not be None
        putNoteResponse.uuid should not be None

        val updatedNote = NoteWrapper("home measurements", Some("Helsinki home dimensions"), Some("bedroom wall: 420cm*250cm"), None, None, None)
        Put("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get,
            marshal(updatedNote).right.get
                ) ~> addHeader("Content-Type", "application/json"
                ) ~> addHeader(Authorization(BasicHttpCredentials("token", authenticateResponse.token.get))
                ) ~> emRoute ~> check {
          val putExistingNoteResponse = entityAs[String]
          writeJsonOutput("putExistingNoteResponse", putExistingNoteResponse)
          putExistingNoteResponse should include("modified")
          putExistingNoteResponse should not include("uuid")
          Get("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get
                ) ~> addHeader(Authorization(BasicHttpCredentials("token", authenticateResponse.token.get))
                ) ~> emRoute ~> check {
            val noteResponse = entityAs[Note]
            writeJsonOutput("noteResponse", entityAs[String])
            noteResponse.content should not be None
            noteResponse.description.get should be("Helsinki home dimensions")
          }
        }
      }
    }
    it("should successfully update item to task with PUT to /[userUUID]/task/[itemUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newItem = Item(None, None, "learn how to fly", None)
      Put("/" + authenticateResponse.userUUID + "/item",
          marshal(newItem).right.get
              ) ~> addHeader("Content-Type", "application/json"
              ) ~> addHeader(Authorization(BasicHttpCredentials("token", authenticateResponse.token.get))
              ) ~> emRoute ~> check {
        val putItemResponse = entityAs[SetResult]          
        val updatedToTask = TaskWrapper("learn how to fly", None, Some("2014-03-01"), None, None, None, None)
        Put("/" + authenticateResponse.userUUID + "/task/" + putItemResponse.uuid.get,
          marshal(updatedToTask).right.get
              ) ~> addHeader("Content-Type", "application/json"
              ) ~> addHeader(Authorization(BasicHttpCredentials("token", authenticateResponse.token.get))
              ) ~> emRoute ~> check {
          Get("/" + authenticateResponse.userUUID + "/task/" + putItemResponse.uuid.get
                ) ~> addHeader(Authorization(BasicHttpCredentials("token", authenticateResponse.token.get))
                ) ~> emRoute ~> check {
            val taskResponse = entityAs[Task]
            taskResponse.due.get should be("2014-03-01")
          }
        }
      }
    }

    it("should successfully complete task with POST to /[userUUID]/task/[itemUUID]/complete") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newTask = TaskWrapper("learn Spanish", None, None, None, None, None, None)
      Put("/" + authenticateResponse.userUUID + "/task",
            marshal(newTask).right.get
                ) ~> addHeader("Content-Type", "application/json"
                ) ~> addHeader(Authorization(BasicHttpCredentials("token", authenticateResponse.token.get))
                ) ~> emRoute ~> check {
        val putTaskResponse = entityAs[SetResult]
        Post("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get + "/complete"
              ) ~> addHeader("Content-Type", "application/json"
              ) ~> addHeader(Authorization(BasicHttpCredentials("token", authenticateResponse.token.get))
              ) ~> emRoute ~> check {
          Get("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get
                ) ~> addHeader(Authorization(BasicHttpCredentials("token", authenticateResponse.token.get))
                ) ~> emRoute ~> check {
            val taskResponse = entityAs[Task]
            taskResponse.completed.get should not be None
          }
        }
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
  
  // Helper file writer
  def writeJsonOutput(filename: String, contents: String): Unit = {
    Some(new PrintWriter(db.TEST_DATA_DESTINATION + "/" + filename + ".json")).foreach { p => p.write(contents); p.close }
  }
}
