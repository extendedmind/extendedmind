/**
 * Copyright (c) 2013-2014 Extended Mind Technologies Oy
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
import org.mockito._
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

  describe("In the best case, ListService") {
    it("should successfully put new list on PUT to /[userUUID]/list, "
      + "update it with PUT to /[userUUID]/list/[listUUID] "
      + "and get it back with GET to /[userUUID]/list/[listUUID]"
      + "and delete it with DELETE to /[userUUID]/list/[listUUID] "
      + "and undelete it with POST to /[userUUID]/list/[listUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newList = List("learn Spanish", None, None, None, None)
      val newList2 = List("learn English", None, None, None, None)
      Put("/" + authenticateResponse.userUUID + "/list",
        marshal(newList).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val putListResponse = responseAs[SetResult]
          writeJsonOutput("putListResponse", responseAs[String])
          putListResponse.modified should not be None
          putListResponse.uuid should not be None
	      Put("/" + authenticateResponse.userUUID + "/list",
	        marshal(newList2).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
	          val putList2Response = responseAs[SetResult]
	          val updatedList = newList.copy(due = Some("2014-03-01"))
	          Put("/" + authenticateResponse.userUUID + "/list/" + putListResponse.uuid.get,
	            marshal(updatedList).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
	              val putExistingListResponse = responseAs[String]
	              writeJsonOutput("putExistingListResponse", putExistingListResponse)
	              putExistingListResponse should include("modified")
	              putExistingListResponse should not include ("uuid")
	              Get("/" + authenticateResponse.userUUID + "/list/" + putListResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
	                val listResponse = responseAs[List]
	                writeJsonOutput("listResponse", responseAs[String])
	                listResponse.due.get should be("2014-03-01")
	                
	                // Add the list to a note
                  val newNote = Note("bike details", None, Some("model: 12345"), None, None,
                    Some(ExtendedItemRelationships(Some(putListResponse.uuid.get), None, None)))
                  val putNoteResponse = putNewNote(newNote, authenticateResponse)
                  val noteWithList = getNote(putNoteResponse.uuid.get, authenticateResponse)
                  noteWithList.relationships.get.parent.get should be(putListResponse.uuid.get)
	                
	                Delete("/" + authenticateResponse.userUUID + "/list/" + putListResponse.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
	                  val deleteListResponse = responseAs[DeleteItemResult]
	                  writeJsonOutput("deleteListResponse", responseAs[String])
	                  Get("/" + authenticateResponse.userUUID + "/list/" + putListResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
	                	val failure = responseAs[ErrorResult]        
	                	status should be (BadRequest)
	                    failure.description should startWith("Item " + putListResponse.uuid.get + " is deleted")
	                  }

                    // Re-deleting should be possible
                    Delete("/" + authenticateResponse.userUUID + "/list/" + putListResponse.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                      val redeleteListResponse = responseAs[DeleteItemResult]
                      redeleteListResponse.deleted should be (deleteListResponse.deleted)
                      redeleteListResponse.result.modified should be (deleteListResponse.result.modified)
                    }
                    
	                  // Change note list to new value and verify that change works
                    Put("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get,
                      marshal(newNote.copy(relationships = Some(ExtendedItemRelationships(Some(putList2Response.uuid.get), None, None)))).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                        val reputExistingNoteResponse = responseAs[SetResult]
                        reputExistingNoteResponse.modified should not be None
                    }
	                  
	                  Post("/" + authenticateResponse.userUUID + "/list/" + putListResponse.uuid.get + "/undelete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
	                    val undeleteListResponse = responseAs[SetResult]
	                    writeJsonOutput("undeleteListResponse", responseAs[String])
	                    val undeletedList = getList(putListResponse.uuid.get, authenticateResponse)
	                    undeletedList.deleted should be(None)
	                    undeletedList.modified should not be (None)
                      
                      // Re-undeleting should be possible
                      Post("/" + authenticateResponse.userUUID + "/list/" + putListResponse.uuid.get + "/undelete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                        val reundeleteListResponse = responseAs[SetResult]
                        reundeleteListResponse.modified should be (undeleteListResponse.modified)
                      }
	                  }
	                }
	              }
	            }
	        }
        }
    }
    it("should successfully update item to list with PUT to /[userUUID]/list/[listUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newItem = Item("learn how to fly", None, None)
      Put("/" + authenticateResponse.userUUID + "/item",
        marshal(newItem).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val putItemResponse = responseAs[SetResult]
          val updatedToList = List("learn how to fly", None, None, Some("2014-03-01"), None)
          Put("/" + authenticateResponse.userUUID + "/list/" + putItemResponse.uuid.get,
            marshal(updatedToList).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
              val list = getList(putItemResponse.uuid.get, authenticateResponse)
              list.due.get should be("2014-03-01")
            }
        }
    }
    
    it("should successfully add tasks and notes to lists with PUT to /[userUUID]/[task or note]/[itemUUID] "
       + "and add sublist to existing list with PUT to /[userUUID]/list/[itemUUID] "
       + "and turn task into list with POST to /[userUUID]/task/[taskUUID]/list") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)

      // Create task and list
      val newTask = Task("learn Spanish", None, None, None, None, None, None)
      val putTaskResponse = putNewTask(newTask, authenticateResponse)
      val newList = List("studies", None, None, None, None)
      val putListResponse = putNewList(newList, authenticateResponse)
      
      // Put existing task and new note into list 
      val existingTaskInList = newTask.copy(relationships = Some(ExtendedItemRelationships(Some(putListResponse.uuid.get), None, None)))
      val putTaskInListResponse = putExistingTask(existingTaskInList, putTaskResponse.uuid.get, authenticateResponse)
      val newNote = Note("Spanish 101", None, None, Some("lecture notes for Spanish 101 class"), None,
    		  				Some(ExtendedItemRelationships(Some(putListResponse.uuid.get), None, None)))
      val putNoteResponse = putNewNote(newNote, authenticateResponse)

      // Get note and task and check that they are in the list
      getTask(putTaskResponse.uuid.get, authenticateResponse)
      			.relationships.get.parent.get should be (putListResponse.uuid.get)
      getNote(putNoteResponse.uuid.get, authenticateResponse)
      			.relationships.get.parent.get should be (putListResponse.uuid.get)
      
      // Create sublist and move note below it
      val newSubList = List("Spanish studies", None, None, None, 
    		  				Some(ExtendedItemRelationships(Some(putListResponse.uuid.get), None, None)))
      val putSubListResponse = putNewList(newSubList, authenticateResponse)
      getList(putSubListResponse.uuid.get, authenticateResponse)
      		    .relationships.get.parent.get should be (putListResponse.uuid.get)
      val existingNoteInSubList = newNote.copy(relationships = 
    		  				Some(ExtendedItemRelationships(Some(putSubListResponse.uuid.get), None, None)))
      val putExistingNoteResponse = putExistingNote(existingNoteInSubList, putNoteResponse.uuid.get, authenticateResponse)
      getNote(putNoteResponse.uuid.get, authenticateResponse)
      			.relationships.get.parent.get should be (putSubListResponse.uuid.get)
      
      // Turn task into list
      Post("/" + authenticateResponse.userUUID + "/task/" + putTaskResponse.uuid.get + "/list",
          marshal(existingTaskInList.copy(title = "Spanish studies")).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val taskToListResponse = responseAs[List]
        writeJsonOutput("taskToListResponse", responseAs[String])
        val listFromTask = getList(putTaskResponse.uuid.get, authenticateResponse)
        listFromTask.uuid.get should be (putTaskResponse.uuid.get)
        listFromTask.title should be ("Spanish studies")
        // ..and turn it back to a task
        Post("/" + authenticateResponse.userUUID + "/list/" + putTaskResponse.uuid.get + "/task",
            marshal(listFromTask.copy(title = "learn Spanish")).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val taskFromList = responseAs[Task]
          writeJsonOutput("listToTaskResponse", responseAs[String])
          taskFromList.uuid.get should be (putTaskResponse.uuid.get)
          taskFromList.title should be ("learn Spanish")
        } 
      }

      // Delete list and expect child task and list to have a new modified timestamp
      Delete("/" + authenticateResponse.userUUID + "/list/" + putListResponse.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val deleteListResult = responseAs[DeleteItemResult]
        Get("/" + authenticateResponse.userUUID + "/items?modified=" + (deleteListResult.result.modified - 1) + "&deleted=true") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val itemsResponse = responseAs[Items]
          itemsResponse.tasks.get.size should be (1)
          itemsResponse.tasks.get(0).modified.get should be (deleteListResult.result.modified)
          itemsResponse.lists.get.size should be (2)
          itemsResponse.lists.get(0).modified.get should be (deleteListResult.result.modified)
          itemsResponse.lists.get(1).modified.get should be (deleteListResult.result.modified)
        }
      }
      
      // Undelete list and expect child task and list to have a new modified timestamp
      Post("/" + authenticateResponse.userUUID + "/list/" + putListResponse.uuid.get + "/undelete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val undeleteListResult = responseAs[SetResult]
        Get("/" + authenticateResponse.userUUID + "/items?modified=" + (undeleteListResult.modified - 1)) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val itemsResponse = responseAs[Items]
          itemsResponse.tasks.get.size should be (1)
          itemsResponse.tasks.get(0).modified.get should be (undeleteListResult.modified)
          itemsResponse.lists.get.size should be (2)
          itemsResponse.lists.get(0).modified.get should be (undeleteListResult.modified)
          itemsResponse.lists.get(1).modified.get should be (undeleteListResult.modified)
        }
      }
      
      // Try to create a sublist that has as parent the same list
      val itemItsOwnList = newSubList.copy(
          relationships = Some(ExtendedItemRelationships(Some(putSubListResponse.uuid.get), None, None)))
      
      Put("/" + authenticateResponse.userUUID + "/list/" + putSubListResponse.uuid.get,
          marshal(itemItsOwnList).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val errorResult = responseAs[ErrorResult]
        errorResult.code should be (3018)
      }
          
      // Create an infinite loop between newList <-> subList
      val infiniteLoopParent = newList.copy(
          relationships = Some(ExtendedItemRelationships(Some(putSubListResponse.uuid.get), None, None)))
      
      Put("/" + authenticateResponse.userUUID + "/list/" + putListResponse.uuid.get,
          marshal(infiniteLoopParent).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val errorResult = responseAs[ErrorResult]
        errorResult.code should be (3019)
      }
    }
    it("should successfully archive list with POST to /[userUUID]/list/[listUUID]/archive "
        + "and turn it back active with POST to /[userUUID]/list/[listUUID]/unarchive") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      
      // Create archive parent
      val newArchiveParentList = List("completed courses", None, None, None, None)
      val putArchiveParentListResponse = putNewList(newArchiveParentList, authenticateResponse)

      // Archive empty parent list
      Post("/" + authenticateResponse.userUUID + "/list/" + putArchiveParentListResponse.uuid.get + "/archive"
        ) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val emptyParentArchiveListResponse = responseAs[ArchiveListResult]
        emptyParentArchiveListResponse.children should be (None)
        emptyParentArchiveListResponse.history.tagType.get should be (HISTORY)

        // Create active parent list and put task and note on it
        val newParentList = List("studies", None, None, None, None)
        val putParentListResponse = putNewList(newParentList, authenticateResponse)
        val newList = List("Spanish", None, None, None,
              Some(ExtendedItemRelationships(Some(putParentListResponse.uuid.get), None, None)))
        val putListResponse = putNewList(newList, authenticateResponse)
        val newTask = Task("learn Spanish", None, None, None, None, None, 
            Some(ExtendedItemRelationships(Some(putListResponse.uuid.get), None, None)))
        val putTaskResponse = putNewTask(newTask, authenticateResponse)
        val newNote = Note("Spanish 101", None, None, Some("lecture notes for Spanish 101 class"), None,
      		  				Some(ExtendedItemRelationships(Some(putListResponse.uuid.get), None, None)))
        val putNoteResponse = putNewNote(newNote, authenticateResponse)
        
        // Archive list under completed courses
        Post("/" + authenticateResponse.userUUID + "/list/" + putListResponse.uuid.get + "/archive",
          marshal(ArchivePayload(putArchiveParentListResponse.uuid.get)).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val archiveListResponse = responseAs[ArchiveListResult]
          writeJsonOutput("archiveListResponse", responseAs[String])
          archiveListResponse.children.get.size should be (2)
          archiveListResponse.history.tagType.get should be (HISTORY)
  
          // Check that getting archived items returns the right tasks
          Get("/" + authenticateResponse.userUUID + "/items" + "?archived=true&active=false") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
            val itemsResponse = responseAs[Items]
            itemsResponse.tasks.get.length should be (1)
            itemsResponse.tasks.get(0).archived.get should be (archiveListResponse.archived)
            itemsResponse.tasks.get(0).relationships.get.tags.get(0) should be (archiveListResponse.history.uuid.get)          
            itemsResponse.lists.get.length should be (2)
            
            val archivedSpanish = itemsResponse.lists.get.find(list => {list.uuid.get == putListResponse.uuid.get}).get
            archivedSpanish.archived.get should be (archiveListResponse.archived)
            archivedSpanish.relationships.get.tags.size should be(1)
            archivedSpanish.relationships.get.tags.get(0) should be (archiveListResponse.history.uuid.get)
            archivedSpanish.relationships.get.parent.get should be (putArchiveParentListResponse.uuid.get)
            itemsResponse.notes.get.length should be (1)
            itemsResponse.notes.get(0).archived.get should be (archiveListResponse.archived)
            itemsResponse.notes.get(0).relationships.get.tags.get(0) should be (archiveListResponse.history.uuid.get)
  
            // Remove note from list and make sure it is no longer archived but still has the history tag
            putExistingNote(itemsResponse.notes.get(0).copy(
              relationships = Some(ExtendedItemRelationships(None, None, itemsResponse.notes.get(0).relationships.get.tags))), putNoteResponse.uuid.get, authenticateResponse)
            val note = getNote(putNoteResponse.uuid.get, authenticateResponse)
            note.archived should be(None)
            note.relationships.get.tags.get(0) should be(archiveListResponse.history.uuid.get)
            
            // Add note back to list and make sure it is again archived with history tag
            val putNoteToArchivedList = putExistingNote(note.copy(
              relationships = Some(ExtendedItemRelationships(Some(putListResponse.uuid.get), None, itemsResponse.notes.get(0).relationships.get.tags))), putNoteResponse.uuid.get, authenticateResponse)
            putNoteToArchivedList.archived should not be (None)
              val noteAgain = getNote(putNoteResponse.uuid.get, authenticateResponse)
            noteAgain.archived should not be(None)
            note.relationships.get.tags.get(0) should be(archiveListResponse.history.uuid.get)
            
            // Unarchive list under active parent and make sure everything is unarchived
            Post("/" + authenticateResponse.userUUID + "/list/" + putListResponse.uuid.get + "/unarchive",
            marshal(ArchivePayload(putParentListResponse.uuid.get)).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
              val unarchiveListResponse = responseAs[UnarchiveListResult]
              writeJsonOutput("unarchiveListResponse", responseAs[String])
              unarchiveListResponse.children.get.size should be (2)
              unarchiveListResponse.history.deleted should not be (None)
              
              val unarchivedNote = getNote(putNoteResponse.uuid.get, authenticateResponse)
              unarchivedNote.archived should be(None)
              val unarchivedTask = getTask(putTaskResponse.uuid.get, authenticateResponse)
              unarchivedTask.archived should be(None)
              val unarchivedList = getList(putListResponse.uuid.get, authenticateResponse)
              unarchivedList.archived should be(None)
              unarchivedList.relationships.get.parent.get should be (putParentListResponse.uuid.get)
              // The deleted history tag should still be there
              unarchivedList.relationships.get.tags.get.size should be (1)
              Get("/" + authenticateResponse.userUUID + "/items" + "?archived=false&active=false&deleted=true") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                val deletedItemsResponse = responseAs[Items]
                deletedItemsResponse.tags.get(0).uuid.get should be (unarchivedList.relationships.get.tags.get(0))
                
                val newNote2 = Note("Spanish 102", None, None, Some("lecture notes for Spanish 102 class"), None,
                Some(ExtendedItemRelationships(Some(putListResponse.uuid.get), None, None)))
                putNewNote(newNote2, authenticateResponse)
  
                // Archive list
                Post("/" + authenticateResponse.userUUID + "/list/" + putListResponse.uuid.get + "/archive"
                  ) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                  val archive2ListResponse = responseAs[ArchiveListResult]  
                  val archived2List = getList(putListResponse.uuid.get, authenticateResponse)
                  archived2List.relationships.get.parent should be (None)
                  val newNote3 = Note("Spanish 103", None, None, Some("lecture notes for Spanish 103 class"), None,
                  Some(ExtendedItemRelationships(Some(putListResponse.uuid.get), None, None)))
                  putNewNote(newNote3, authenticateResponse)
  
                  // Unarchive list and make sure everything is unarchived
                  Post("/" + authenticateResponse.userUUID + "/list/" + putListResponse.uuid.get + "/unarchive"
                  ) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val unarchive2ListResponse = responseAs[UnarchiveListResult]
                    val unarchived2List = getList(putListResponse.uuid.get, authenticateResponse)
                    unarchived2List.relationships.get.parent should be (None)
                  }
                }
              }
            }
          }
        }
      }
    }
    it("should successfully put new and existing tasks and notes to shared lists") {
      val timoAuthenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val lauriAuthenticateResponse = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
      
      val timoUUID = lauriAuthenticateResponse.sharedLists.get.last._1
      Get("/" + timoUUID + "/items") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
        val sharedItemsResponse = responseAs[Items]
        sharedItemsResponse.tasks.get.length should equal(3)
        sharedItemsResponse.notes should be(None)
        sharedItemsResponse.lists.get.length should equal(1)
        val essayListUUID = sharedItemsResponse.lists.get(0).uuid.get
        essayListUUID should be (lauriAuthenticateResponse.sharedLists.get.last._2._2.last._1)

        val newTask = Task("help with writing essay", None, None, Some("2015-10-10"), None, None, 
        Some(ExtendedItemRelationships(Some(essayListUUID), None, None)))
        val putTaskResponse = putNewTask(newTask, lauriAuthenticateResponse, Some(timoUUID))
        val newNote = Note("tips for writing", None, None, Some("first just write, then edit"), None,
                    Some(ExtendedItemRelationships(Some(essayListUUID), None, None)))
        val putNoteResponse = putNewNote(newNote, lauriAuthenticateResponse, Some(timoUUID))
        
        Get("/" + timoUUID + "/items") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
          val updatedSharedItemsResponse = responseAs[Items]
          updatedSharedItemsResponse.tasks.get.length should equal(4)
          updatedSharedItemsResponse.notes.get.length should equal(1)
          // NOTE: due date should not stick
          updatedSharedItemsResponse.tasks.get.find(task => task.due.isDefined) should be(None)
          
          putExistingNote(updatedSharedItemsResponse.notes.get(0).copy(
            title = "updated note"), updatedSharedItemsResponse.notes.get(0).uuid.get, lauriAuthenticateResponse, Some(timoUUID))
          
          putExistingTask(updatedSharedItemsResponse.tasks.get(0).copy(
            title = "updated task"), updatedSharedItemsResponse.tasks.get(0).uuid.get, lauriAuthenticateResponse, Some(timoUUID))
          
          Get("/" + timoUUID + "/items") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
            val updatedSharedItemsResponse = responseAs[Items]
            updatedSharedItemsResponse.tasks.get.length should equal(4)
            updatedSharedItemsResponse.notes.get.length should equal(1)
            val updatedTask = updatedSharedItemsResponse.tasks.get.find(task => task.title == "updated task").get
            val updatedNote = updatedSharedItemsResponse.notes.get.find(note => note.title == "updated note").get
            
            // Delete shared notes and tasks
            deleteTask(updatedTask.uuid.get, lauriAuthenticateResponse, Some(timoUUID))
            deleteNote(updatedNote.uuid.get, lauriAuthenticateResponse, Some(timoUUID))
            
            Get("/" + timoUUID + "/items") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
              val deletedSharedItemsResponse = responseAs[Items]
              deletedSharedItemsResponse.tasks.get.length should equal(3)
              deletedSharedItemsResponse.notes should be(None)
              // Undelete shared notes and tasks
              undeleteTask(updatedTask.uuid.get, lauriAuthenticateResponse, Some(timoUUID))
              undeleteNote(updatedNote.uuid.get, lauriAuthenticateResponse, Some(timoUUID))
              Get("/" + timoUUID + "/items") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
                val undeletedSharedItemsResponse = responseAs[Items]
                undeletedSharedItemsResponse.tasks.get.length should equal(4)
                undeletedSharedItemsResponse.notes.get.length should equal(1)
              }
            }
          }
        }
      }
    }
    it("should successfully share new list") {
      val lauriAuthenticateResponse = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
      val newList = List("studies", None, None, None, None)
      val putListResponse = putNewList(newList, lauriAuthenticateResponse)
      
      val sharingAgreement = Agreement(AgreementType.LIST_AGREEMENT, SecurityContext.READ, 
                    AgreementTarget(putListResponse.uuid.get, None), None,
                    AgreementUser(None, Some(TIMO_EMAIL)))
      stub(mockMailgunClient.sendShareListAgreement(anyObject(), anyObject(), anyObject())).toReturn(Future { SendEmailResponse("OK", "1234") })
      val agreementCodeCaptor: ArgumentCaptor[Long] = ArgumentCaptor.forClass(classOf[Long])      
      Put("/agreement",
          marshal(sharingAgreement).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
        val agreementSetResult = responseAs[SetResult]
        writeJsonOutput("putNewAgreementResponse", responseAs[String])
        verify(mockMailgunClient).sendShareListAgreement(anyObject(), agreementCodeCaptor.capture(), anyObject())
        val agreementCode = agreementCodeCaptor.getValue

        // Verify that list has the same modified as agreement
        Get("/" + lauriAuthenticateResponse.userUUID + "/items?modified=" + putListResponse.modified) ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
          val itemsResponse = responseAs[Items]
          itemsResponse.lists.size should be (1)
          itemsResponse.lists.get(0).modified.get should be (agreementSetResult.modified)
        }
        
        // Accept agreement
        Post("/agreement/" + agreementCode.toHexString + "/accept",
          marshal(UserEmail(TIMO_EMAIL)).right.get) ~> addHeader("Content-Type", "application/json") ~> route ~> check {            
          val agreementAcceptSetResult = responseAs[SetResult]
          writeJsonOutput("acceptAgreementResponse", responseAs[String])
          agreementAcceptSetResult.modified should be > agreementSetResult.modified
          
          // Verify that authentication has shared list
          val timoAuthenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
          timoAuthenticateResponse.sharedLists.get.size should be (1)
          
	      // Verify that list has the same modified as accepted agreement
	      Get("/" + lauriAuthenticateResponse.userUUID + "/items?modified=" + agreementSetResult.modified) ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
	        val itemsResponse = responseAs[Items]
	        itemsResponse.lists.size should be (1)
	        itemsResponse.lists.get(0).modified.get should be (agreementAcceptSetResult.modified)
	      }
          
          Get("/account") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
            val accountResponse = responseAs[User]
            val lauriUUID = accountResponse.sharedLists.get.last._1
            Get("/" + lauriUUID + "/items") ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
              val sharedItemsResponse = responseAs[Items]
              sharedItemsResponse.tasks should be(None)
              sharedItemsResponse.notes should be(None)
              sharedItemsResponse.lists.get.length should equal(1)
              val studiesListUUID = sharedItemsResponse.lists.get(0).uuid.get
              val newTask = Task("help with writing essay", None, None, Some("2015-10-10"), None, None, 
                                 Some(ExtendedItemRelationships(Some(studiesListUUID), None, None)))
              Put("/" + lauriUUID + "/task",
                marshal(newTask).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
                val errorResult = responseAs[ErrorResult]
                Post("/agreement/" + agreementSetResult.uuid.get + "/access/2") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
                  val accessResult = responseAs[SetResult]
                  writeJsonOutput("changeAgreementAccessResponse", responseAs[String])
	              accessResult.modified should be > agreementAcceptSetResult.modified

                  // Verify that list has the same modified as accept changed agreement
			      Get("/" + lauriAuthenticateResponse.userUUID + "/items?modified=" + agreementAcceptSetResult.modified) ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
			        val itemsResponse = responseAs[Items]
			        itemsResponse.lists.size should be (1)
			        itemsResponse.lists.get(0).modified.get should be (accessResult.modified)
			      }
                  
                  Put("/" + lauriUUID + "/task",
                    marshal(newTask).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
                    val putTaskResponse = responseAs[SetResult]
                    
                    // Last, proposedTo destroys agreement
	                Delete("/agreement/" + agreementSetResult.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
	                  val deleteAgreementResult = responseAs[SetResult]
	                  writeJsonOutput("deleteAgreementResponse", responseAs[String])
	                  deleteAgreementResult.modified should be > accessResult.modified
	                  // Verify that list has the same modified as what destroy result claims
				      Get("/" + lauriAuthenticateResponse.userUUID + "/items?modified=" + accessResult.modified) ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
				        val itemsResponse = responseAs[Items]
				        itemsResponse.lists.size should be (1)
				        itemsResponse.lists.get(0).modified.get should be (deleteAgreementResult.modified)
				      }
				      // Verify that there is no more shared list access
				      Get("/account") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
				        val accountResponse = responseAs[User]
				        accountResponse.sharedLists should be(None)
				      }
	                }
                  }
                }
              }
            }
          }
        }   
      }
    }
  }  
}