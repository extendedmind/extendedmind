/**
 * Copyright (c) 2013-2015 Extended Mind Technologies Oy
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
      val newNote = Note("home measurements", None, None, Some("bedroom wall: 420cm*250cm"), None, None)
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
                  val deleteNoteResponse = responseAs[DeleteItemResult]
                  writeJsonOutput("deleteNoteResponse", responseAs[String])
                  Get("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                	val failure = responseAs[ErrorResult]        
                	status should be (BadRequest)
                    failure.description should startWith("Item " + putNoteResponse.uuid.get + " is deleted")
                  }
                  
                  // Deleting again should return the same deleted and modified values
                  Delete("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val redeleteNoteResponse = responseAs[DeleteItemResult]
                    redeleteNoteResponse.deleted should be (deleteNoteResponse.deleted)
                    redeleteNoteResponse.result.modified should be (deleteNoteResponse.result.modified)
                  }
                  
                  Post("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get + "/undelete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val undeleteNoteResponse = responseAs[SetResult]
                    writeJsonOutput("undeleteNoteResponse", responseAs[String])
                    val undeletedTask = getNote(putNoteResponse.uuid.get, authenticateResponse)
                    undeletedTask.deleted should be(None)
                    undeletedTask.modified should not be (None)
                    
                    // Re-undelete should also work
                    Post("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get + "/undelete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                      val reundeleteNoteResponse = responseAs[SetResult]
                      reundeleteNoteResponse.modified should be (undeleteNoteResponse.modified)
                    }
                  }
                }
              }
            }
        }
    }
    it("should successfully convert note to list with POST to /[userUUID]/note/[itemUUID]/list "
      + "and transform it back with POST to /[userUUID]/list/[itemUUID]/note") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newNote = Note("Spanish 101", None, None, Some("lecture notes for Spanish 101 class"), None, None)
      val putNoteResponse = putNewNote(newNote, authenticateResponse)

      Post("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get + "/list",
          marshal(newNote.copy(title = "Spanish studies"))) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val listFromTask = responseAs[List]
        writeJsonOutput("noteToListResponse", responseAs[String])
        listFromTask.uuid.get should be (putNoteResponse.uuid.get)
        listFromTask.title should be ("Spanish studies")
        listFromTask.description.get should be ("lecture notes for Spanish 101 class")

        Post("/" + authenticateResponse.userUUID + "/list/" + putNoteResponse.uuid.get + "/note",
          marshal(listFromTask.copy(title = "Spanish 101"))) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val noteFromList = responseAs[Note]
          writeJsonOutput("listToNoteResponse", responseAs[String])
          noteFromList.uuid.get should be (putNoteResponse.uuid.get)
          noteFromList.title should be ("Spanish 101")
          noteFromList.content.get should be ("lecture notes for Spanish 101 class")
          noteFromList.description should be (None)
        }
      }
    }
    it("should successfully favorite note with POST to /[userUUID]/note/[itemUUID]/favorite "
      + "and unfavorite it with POST to /[userUUID]/note/[itemUUID]/unfavorite") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newNote = Note("Spanish 101", None, None, Some("lecture notes for Spanish 101 class"), Some(100L), None)
      val putNoteResponse = putNewNote(newNote, authenticateResponse)
      val originalNoteResponse = getNote(putNoteResponse.uuid.get, authenticateResponse)
      originalNoteResponse.favorited should be (None)
      
      Post("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get + "/favorite") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        writeJsonOutput("favoriteNoteResponse", responseAs[String])
        val favoriteNoteResponse = responseAs[FavoriteNoteResult]
        favoriteNoteResponse.favorited should not be None
        val noteResponse = getNote(putNoteResponse.uuid.get, authenticateResponse)
        noteResponse.favorited should not be None
        
        Post("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get + "/unfavorite") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          writeJsonOutput("unfavoriteNoteResponse", responseAs[String])
          val unfavoritedNoteResponse = getNote(putNoteResponse.uuid.get, authenticateResponse)
          unfavoritedNoteResponse.favorited should be(None)
        }
      }
    }
  }
}
