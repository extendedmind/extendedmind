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
 * Best case test for tags. Also generates .json files.
 */
class TagBestCaseSpec extends ServiceSpecBase {

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

  describe("In the best case, TagService") {
    it("should successfully put new tag on PUT to /v2/owners/[userUUID]/data/tags, "
      + "update it with PUT to /v2/owners/[userUUID]/data/tags/[tagUUID] "
      + "and get it back with GET to /v2/owners/[userUUID]/data/tags/[tagUUID] "
      + "and delete it with DELETE to /v2/owners/[userUUID]/data/tags/[itemUUID] "
      + "and undelete it with POST to /v2/owners/[userUUID]/data/tags/[itemUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newTag = Tag("home", None, None, CONTEXT, None).copy(ui = Some("testUI"))
      val newTag2 = Tag("office", None, None, CONTEXT, None)
      Put("/v2/owners/" + authenticateResponse.userUUID + "/data/tags",
        marshal(newTag).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val putTagResponse = responseAs[SetResult]
          writeJsonOutput("putTagResponse", responseAs[String])
          putTagResponse.modified should not be None
          putTagResponse.uuid should not be None

          Put("/v2/owners/" + authenticateResponse.userUUID + "/data/tags",
            marshal(newTag2).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
              val putTag2Response = responseAs[SetResult]
              val updatedTag = newTag.copy(description = Some("my home"))
              Put("/v2/owners/" + authenticateResponse.userUUID + "/data/tags/" + putTagResponse.uuid.get,
                marshal(updatedTag).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                  val putExistingTagResponse = responseAs[String]
                  writeJsonOutput("putExistingTagResponse", putExistingTagResponse)
                  putExistingTagResponse should include("modified")
                  putExistingTagResponse should not include ("uuid")
                  Get("/v2/owners/" + authenticateResponse.userUUID + "/data/tags/" + putTagResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val tagResponse = responseAs[Tag]
                    writeJsonOutput("tagResponse", responseAs[String])
                    tagResponse.description.get should be("my home")
                    tagResponse.ui.get should be("testUI")
                    // Add the tag to a Note
                    val newNote = Note("bike details", None, Some("model: 12345"), None, None, None,
                      Some(ExtendedItemRelationships(None, None, None, None, Some(scala.List(putTagResponse.uuid.get)), None)))
                    val putNoteResponse = putNewNote(newNote, authenticateResponse)
                    val noteWithTag = getNote(putNoteResponse.uuid.get, authenticateResponse)
                    noteWithTag.relationships.get.tags.get should be(scala.List(putTagResponse.uuid.get))
                    Delete("/v2/owners/" + authenticateResponse.userUUID + "/data/tags/" + putTagResponse.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                      val deleteTagResponse = responseAs[DeleteItemResult]
                      writeJsonOutput("deleteTagResponse", responseAs[String])
                      Get("/v2/owners/" + authenticateResponse.userUUID + "/data/tags/" + putTagResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                        val failure = responseAs[ErrorResult]
                        status should be(BadRequest)
                        failure.description should startWith("Item " + putTagResponse.uuid.get + " is deleted")
                      }

                      // Deleting again should return the same deleted and modified values
                      Delete("/v2/owners/" + authenticateResponse.userUUID + "/data/tags/" + putTagResponse.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                        val redeleteTagResponse = responseAs[DeleteItemResult]
                        redeleteTagResponse.deleted should be (deleteTagResponse.deleted)
                        redeleteTagResponse.result.modified should be (deleteTagResponse.result.modified)
                      }

                      // Change note context to new value and verify that change works
                      Put("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get,
                        marshal(newNote.copy(relationships = Some(ExtendedItemRelationships(None, None, None, None, Some(scala.List(putTag2Response.uuid.get)), None)))).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                          val reputExistingNoteResponse = responseAs[SetResult]
                          reputExistingNoteResponse.modified should not be None
                      }

                      Post("/v2/owners/" + authenticateResponse.userUUID + "/data/tags/" + putTagResponse.uuid.get + "/undelete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                        val undeleteTagResponse = responseAs[SetResult]
                        writeJsonOutput("undeleteTagResponse", responseAs[String])
                        val undeletedTag = getTag(putTagResponse.uuid.get, authenticateResponse)
                        undeletedTag.deleted should be(None)
                        undeletedTag.modified should not be (None)

                        // Re-undelete should also work
                        Post("/v2/owners/" + authenticateResponse.userUUID + "/data/tags/" + putTagResponse.uuid.get + "/undelete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                          val reundeleteTagResponse = responseAs[SetResult]
                          reundeleteTagResponse.modified should be (undeleteTagResponse.modified)
                        }
                      }
                    }
                  }
                }
            }
        }
    }

    it("should successfully add tag with PUT to /v2/owners/[userUUID]/data/[tasks or notes]/[itemUUID] "
       + "and update modified values when deleting and undeleting tag") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)

      // Create new tag and new note
      val newTag = Tag("studies", None, None, KEYWORD, None)
      val putTagResponse = putNewTag(newTag, authenticateResponse)
      val newChildTag = Tag("spanish studies", None, None, KEYWORD, Some(putTagResponse.uuid.get))
      val putChildTagResponse = putNewTag(newChildTag, authenticateResponse)

      val newNote = Note("Spanish 101", None, None, Some("lecture notes for Spanish 101 class"), None, None,
                  Some(ExtendedItemRelationships(None, None, None, None, Some(scala.List(putTagResponse.uuid.get)), None)))
      val putNoteResponse = putNewNote(newNote, authenticateResponse)

      // Delete tag and expect child tag and note to have a new modified timestamp
      Delete("/v2/owners/" + authenticateResponse.userUUID + "/data/tags/" + putTagResponse.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val deleteTagResult = responseAs[DeleteItemResult]
        Get("/v2/owners/" + authenticateResponse.userUUID + "/data?modified=" + (deleteTagResult.result.modified - 1) + "&deleted=true") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val itemsResponse = responseAs[Items]
          itemsResponse.tags.get.size should be (2)
          itemsResponse.tags.get(0).modified.get should be (deleteTagResult.result.modified)
          itemsResponse.tags.get(1).modified.get should be (deleteTagResult.result.modified)
          itemsResponse.notes.get.size should be (1)
          itemsResponse.notes.get(0).modified.get should be (deleteTagResult.result.modified)
        }
      }

      // Undelete tag and expect child tag and note to have a new modified timestamp
      Post("/v2/owners/" + authenticateResponse.userUUID + "/data/tags/" + putTagResponse.uuid.get + "/undelete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val undeleteTagResult = responseAs[SetResult]
        Get("/v2/owners/" + authenticateResponse.userUUID + "/data?modified=" + (undeleteTagResult.modified - 1)) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val itemsResponse = responseAs[Items]
          itemsResponse.tags.get.size should be (2)
          itemsResponse.tags.get(0).modified.get should be (undeleteTagResult.modified)
          itemsResponse.tags.get(1).modified.get should be (undeleteTagResult.modified)
          itemsResponse.notes.get.size should be (1)
          itemsResponse.notes.get(0).modified.get should be (undeleteTagResult.modified)
        }
      }
    }
  }

}
