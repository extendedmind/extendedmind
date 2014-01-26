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
    
    it("should successfully add tasks and notes to lists with PUT to /[userUUID]/[task or note]/[itemUUID] "
       + "and add sublist to existing list with PUT to /[userUUID]/list/[itemUUID] "
       + "and turn task into list with PUT to /[userUUID]/list/[itemUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)

      // Create task and list
      val newTask = Task("learn Spanish", None, None, None, None, None, None)
      val putTaskResponse = putNewTask(newTask, authenticateResponse)
      val newList = List("studies", None, None, None, None, None, None)
      val putListResponse = putNewList(newList, authenticateResponse)
      
      // Put existing task and new note into list 
      val existingTaskInList = newTask.copy(relationships = Some(ExtendedItemRelationships(Some(putListResponse.uuid.get), None)))
      val putTaskInListResponse = putExistingTask(existingTaskInList, putTaskResponse.uuid.get, authenticateResponse)
      val newNote = Note("Spanish 101", None, None, Some("lecture notes for Spanish 101 class"), 
    		  				Some(ExtendedItemRelationships(Some(putListResponse.uuid.get), None)))
      val putNoteResponse = putNewNote(newNote, authenticateResponse)

      // Get note and task and check that they are in the list
      getTask(putTaskResponse.uuid.get, authenticateResponse)
      			.relationships.get.parent.get should be (putListResponse.uuid.get)
      getNote(putNoteResponse.uuid.get, authenticateResponse)
      			.relationships.get.parent.get should be (putListResponse.uuid.get)
      
      // Create sublist and move note below it
      val newSubList = List("Spanish studies", None, None, None, None, None, 
    		  				Some(ExtendedItemRelationships(Some(putListResponse.uuid.get), None)))
      val putSubListResponse = putNewList(newSubList, authenticateResponse)
      getList(putSubListResponse.uuid.get, authenticateResponse)
      		    .relationships.get.parent.get should be (putListResponse.uuid.get)
      val existingNoteInSubList = newNote.copy(relationships = 
    		  				Some(ExtendedItemRelationships(Some(putSubListResponse.uuid.get), None)))
      val putExistingNoteResponse = putExistingNote(existingNoteInSubList, putNoteResponse.uuid.get, authenticateResponse)
      getNote(putNoteResponse.uuid.get, authenticateResponse)
      			.relationships.get.parent.get should be (putSubListResponse.uuid.get)
      
      // Turn task into list
      val putTaskToListResponse = putExistingList(List(Some(putTaskResponse.uuid.get), Some(putTaskResponse.modified), None, 
    		  newTask.title, None, None, None, None, None, None,None, None, None),
          putTaskResponse.uuid.get, authenticateResponse)
      val listFromTask = getList(putTaskResponse.uuid.get, authenticateResponse)
      listFromTask.completable.get should be (true)
      listFromTask.uuid.get should be (putTaskResponse.uuid.get)
      listFromTask.title should be (newTask.title)
    }
  }  
}