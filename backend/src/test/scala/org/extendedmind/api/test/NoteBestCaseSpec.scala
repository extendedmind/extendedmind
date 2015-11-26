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
      val newNote = Note("home measurements", None, None, Some("bedroom wall: 420cm*250cm"), None, None, None)
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
      val newNote = Note("Spanish 101", None, None, Some("lecture notes for Spanish 101 class"), None, None, None)
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
      val newNote = Note("Spanish 101", None, None, Some("lecture notes for Spanish 101 class"), None, Some(100L), None)
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
    it("should successfully get public note with GET to /public/[handle]/[path]") {
      Get("/public/timo/productivity") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
        val publicItem = responseAs[PublicItem]
        writeJsonOutput("publicItemResponse", responseAs[String])
        publicItem.note.relationships.get.parent should be(None)
      }
    }
    it("should successfully publish note with POST to [userUUID]/note/[itemUUID]/publish "
      + "and unpublish it with POST to /[userUUID]/note/[itemUUID]/unpublish") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newNote = Note("Public note", None, None, Some("this is public"), None, None, None)
      val putNoteResponse = putNewNote(newNote, authenticateResponse)

      // First publish as draft by leaving out the path attribute
      Post("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get + "/publish",
          marshal(PublishPayload("md", None))) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val publishNoteDraftResult = responseAs[PublishNoteResult]
        writeJsonOutput("publishNoteDraftResponse", responseAs[String])
        Get("/public/timo/" + putNoteResponse.uuid.get) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
          val publicDraftItem = responseAs[PublicItem]
          publicDraftItem.note.visibility.get.draft should not be (None)
          // Next republish with path
          Post("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get + "/publish",
              marshal(PublishPayload("md", Some("test")))) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
            val publishNoteResult = responseAs[PublishNoteResult]
            writeJsonOutput("publishNoteResponse", responseAs[String])
            publishNoteResult.draft should be (None)
            Get("/public/timo/test") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
              val publicItem = responseAs[PublicItem]
              publicItem.note.relationships should be(None)
              publicItem.note.visibility should not be(None)
              publicItem.note.visibility.get.draft should be (None)
              Post("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get + "/unpublish") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                writeJsonOutput("unpublishNoteResponse", responseAs[String])
                val unpublishedNoteResponse = getNote(putNoteResponse.uuid.get, authenticateResponse)
                unpublishedNoteResponse.visibility should be(None)
                Get("/public/timo/test") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                  val failure = responseAs[ErrorResult]
                  failure.code should be (3007)
                }
              }
            }
          }
        }
      }
    }
    it("should successfully get all public notes with GET to /public/[handle]") {
      Get("/public/timo/productivity") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
        val publicItem = responseAs[PublicItem]
        val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
        // Put the same tags to the new public note as in the note before that
        val newNote = Note("Public note", None, None, Some("this is public"), None, None,
            Some(ExtendedItemRelationships(None, None, None, None, None, publicItem.note.relationships.get.collectiveTags)))
        val putNoteResponse = putNewNote(newNote, authenticateResponse)
        Post("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get + "/publish",
            marshal(PublishPayload("md", Some("test")))) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val publishNoteResult = responseAs[PublishNoteResult]
          Get("/public/timo") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
            val publicItems = responseAs[PublicItems]
            writeJsonOutput("publicItemsResponse", responseAs[String])
            publicItems.notes.get.size should be(2)
            publicItems.collectiveTags.get.size should be(1)
            publicItems.collectiveTags.get(0)._2.size should be(2)
            // Getting modified should return only the latter
            Get("/public/timo?modified=" + putNoteResponse.modified) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
              val modifiedPublicItems = responseAs[PublicItems]
              modifiedPublicItems.owner should be(None)
              modifiedPublicItems.notes.get.size should be(1)
              modifiedPublicItems.tags should be(None)
              modifiedPublicItems.collectiveTags.get.size should be(1)
              modifiedPublicItems.collectiveTags.get(0)._2.size should be(2)

              val latestModified = modifiedPublicItems.notes.get(0).modified.get
              // Change account values, expect modified to return different values
              Get("/account") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                val account = responseAs[User]
                // Should be able to update public modified value of owner
                Put("/account",
                  marshal(account.copy(preferences=Some(UserPreferences(None, None)))).right.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                  // This should not change the response as public items have not changed
                  Get("/public/timo?modified=" + latestModified) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                    val nonPublicModifiedItems = responseAs[PublicItems]
                    nonPublicModifiedItems.owner should be(None)
                    nonPublicModifiedItems.modified should be (None)
                    nonPublicModifiedItems.notes should be(None)
                    nonPublicModifiedItems.tags should be(None)
                    nonPublicModifiedItems.collectiveTags should be(None)
                    Put("/account",
                      marshal(account.copy(displayName=Some("testing"))).right.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                      Get("/public/timo?modified=" + putNoteResponse.modified) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                        val ownerModifiedPublicItems = responseAs[PublicItems]
                        ownerModifiedPublicItems.owner.get should be("testing")
                        assert(ownerModifiedPublicItems.modified.get > publicItems.modified.get)
                        nonPublicModifiedItems.notes should be(None)
                        nonPublicModifiedItems.tags should be(None)
                        nonPublicModifiedItems.collectiveTags should be(None)
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
    it("should successfully get unpublished UUIDs from unpublished or deleted notes with GET to /public/[handle]?modified") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Get("/public/timo") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
        val publicItems = responseAs[PublicItems]
        publicItems.notes.get.size should be (1)
        val newNote = Note("Public note", None, None, Some("this is public"), None, None, None)
        val putNoteResponse = putNewNote(newNote, authenticateResponse)

        // Publish a second note
        Post("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get + "/publish",
            marshal(PublishPayload("md", Some("test")))) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val publishNoteResult = responseAs[PublishNoteResult]
          Get("/public/timo") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
             responseAs[PublicItems].notes.get.size should be (2)
             // Delete the first note
             Delete("/" + authenticateResponse.userUUID + "/note/" +  publicItems.notes.get(0).uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
               // Getting notes
               Get("/public/timo") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                 responseAs[PublicItems].notes.get.size should be (1)
               }
               Get("/public/timo?modified=" + publicItems.notes.get(0).modified.get) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                 val oneDeletedPublicItem = responseAs[PublicItems]
                 oneDeletedPublicItem.notes.get.size should be (1)
                 oneDeletedPublicItem.unpublished.get(0) should be(publicItems.notes.get(0).uuid.get)
               }
               // Unpublish the second note and check that unpublished contains two uuids
               Post("/" + authenticateResponse.userUUID + "/note/" + putNoteResponse.uuid.get + "/unpublish") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                 Get("/public/timo?modified=" + publicItems.notes.get(0).modified.get) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                   val oneDeletedOneUnpublishedPublicItem = responseAs[PublicItems]
                   oneDeletedOneUnpublishedPublicItem.notes should be (None)
                   oneDeletedOneUnpublishedPublicItem.tags should be (None)
                   oneDeletedOneUnpublishedPublicItem.unpublished.get.size should be (2)
                   oneDeletedOneUnpublishedPublicItem.unpublished.get.contains(publicItems.notes.get(0).uuid.get) should be (true)
                   oneDeletedOneUnpublishedPublicItem.unpublished.get.contains(putNoteResponse.uuid.get) should be (true)
                 }
               }
             }
          }
        }
      }
    }
  }
}
