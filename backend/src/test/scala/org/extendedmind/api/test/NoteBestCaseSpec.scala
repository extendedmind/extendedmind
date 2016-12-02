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
 * Best case test for notes. Also generates .json files.
 */
class NoteBestCaseSpec extends ServiceSpecBase {

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

  describe("In the best case, NoteService") {
    it("should successfully put new note on PUT to /v2/owners/[userUUID]/data/notes, "
      + "update it with PUT to /v2/owners/[userUUID]/data/notes/[noteUUID] "
      + "and get it back with GET to /v2/owners/[userUUID]/data/notes/[noteUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newNote = Note("home measurements", None, None, Some("bedroom wall: 420cm*250cm"), None, None, None).copy(ui = Some("testUI"))
      Put("/v2/owners/" + authenticateResponse.userUUID + "/data/notes",
        marshal(newNote).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val putNoteResponse = responseAs[SetResult]
          writeJsonOutput("putNoteResponse", responseAs[String])
          putNoteResponse.modified should not be None
          putNoteResponse.uuid should not be None

          val updatedNote = newNote.copy(description = Some("Helsinki home dimensions"))
          Put("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get,
            marshal(updatedNote).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
              val putExistingNoteResponse = responseAs[String]
              writeJsonOutput("putExistingNoteResponse", putExistingNoteResponse)
              putExistingNoteResponse should include("modified")
              putExistingNoteResponse should not include ("uuid")
              Get("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                val noteResponse = responseAs[Note]
                writeJsonOutput("noteResponse", responseAs[String])
                noteResponse.content should not be None
                noteResponse.description.get should be("Helsinki home dimensions")
                noteResponse.ui.get should be("testUI")
                Delete("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                  val deleteNoteResponse = responseAs[DeleteItemResult]
                  writeJsonOutput("deleteNoteResponse", responseAs[String])
                  Get("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                  val failure = responseAs[ErrorResult]
                  status should be (BadRequest)
                    failure.description should startWith("Item " + putNoteResponse.uuid.get + " is deleted")
                  }

                  // Deleting again should return the same deleted and modified values
                  Delete("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val redeleteNoteResponse = responseAs[DeleteItemResult]
                    redeleteNoteResponse.deleted should be (deleteNoteResponse.deleted)
                    redeleteNoteResponse.result.modified should be (deleteNoteResponse.result.modified)
                  }

                  Post("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get + "/undelete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val undeleteNoteResponse = responseAs[SetResult]
                    writeJsonOutput("undeleteNoteResponse", responseAs[String])
                    val undeletedTask = getNote(putNoteResponse.uuid.get, authenticateResponse)
                    undeletedTask.deleted should be(None)
                    undeletedTask.modified should not be (None)

                    // Re-undelete should also work
                    Post("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get + "/undelete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                      val reundeleteNoteResponse = responseAs[SetResult]
                      reundeleteNoteResponse.modified should be (undeleteNoteResponse.modified)
                    }
                  }
                }
              }
            }
        }
    }
    it("should successfully convert note to list with POST to /v2/owners/[userUUID]/data/notes/[itemUUID]/convert_to_list "
      + "and transform it back with POST to /v2/owners/[userUUID]/data/lists/[itemUUID]/convert_to_note") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newNote = Note("Spanish 101", None, None, Some("lecture notes for Spanish 101 class"), None, None, None)
      val putNoteResponse = putNewNote(newNote, authenticateResponse)

      Post("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get + "/convert_to_list",
          marshal(newNote.copy(title = "Spanish studies"))) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val listFromNote = responseAs[List]
        writeJsonOutput("noteToListResponse", responseAs[String])
        listFromNote.uuid.get should be (putNoteResponse.uuid.get)
        listFromNote.title should be ("Spanish studies")
        listFromNote.description.get should be ("lecture notes for Spanish 101 class")
        listFromNote.revision.get should be (1l)

        Post("/v2/owners/" + authenticateResponse.userUUID + "/data/lists/" + putNoteResponse.uuid.get + "/convert_to_note",
          marshal(listFromNote.copy(title = "Spanish 101"))) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val noteFromList = responseAs[Note]
          writeJsonOutput("listToNoteResponse", responseAs[String])
          noteFromList.uuid.get should be (putNoteResponse.uuid.get)
          noteFromList.title should be ("Spanish 101")
          noteFromList.content.get should be ("lecture notes for Spanish 101 class")
          noteFromList.description should be (None)
        }
      }
    }
    it("should successfully favorite note with POST to /v2/owners/[userUUID]/data/notes/[itemUUID]/favorite "
      + "and unfavorite it with POST to /v2/owners/[userUUID]/data/notes/[itemUUID]/unfavorite") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newNote = Note("Spanish 101", None, None, Some("lecture notes for Spanish 101 class"), None, Some(100L), None)
      val putNoteResponse = putNewNote(newNote, authenticateResponse)
      val originalNoteResponse = getNote(putNoteResponse.uuid.get, authenticateResponse)
      originalNoteResponse.favorited should be (None)

      Post("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get + "/favorite") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        writeJsonOutput("favoriteNoteResponse", responseAs[String])
        val favoriteNoteResponse = responseAs[FavoriteNoteResult]
        favoriteNoteResponse.favorited should not be None
        val noteResponse = getNote(putNoteResponse.uuid.get, authenticateResponse)
        noteResponse.favorited should not be None

        Post("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get + "/unfavorite") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          writeJsonOutput("unfavoriteNoteResponse", responseAs[String])
          val unfavoritedNoteResponse = getNote(putNoteResponse.uuid.get, authenticateResponse)
          unfavoritedNoteResponse.favorited should be(None)
        }
      }
    }
    it("should successfully get public note with GET to /v2/public/[handle]/[path]") {
      Get("/v2/public/timo/productivity") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
        val publicItem = responseAs[PublicItem]
        writeJsonOutput("publicItemResponse", responseAs[String])
        publicItem.note.relationships.get.parent should be(None)
        publicItem.note.relationships.get.tags.get.length should be(1)
        publicItem.note.relationships.get.collectiveTags.get.length should be(1)
        publicItem.note.visibility.get.path should not be(None)
        publicItem.note.visibility.get.published should not be(None)
        publicItem.tags.get.length should be(1)
        publicItem.collectiveTags.get.length should be(1)
        publicItem.collectiveTags.get(0)._2.length should be(2)

        Get("/v2/short/" + publicItem.note.visibility.get.shortId.get) ~> route ~> check {
          val publicItemHeaderResponse = responseAs[PublicItemHeader]
          writeJsonOutput("publicItemHeaderResponse", responseAs[String])
          publicItemHeaderResponse.handle should be ("timo")
          publicItemHeaderResponse.path.get should be ("productivity")
        }

        // Blacklist and unblacklist user and check response
        val lauriAuthenticateResponse = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
        val timoUUID = getUserUUID(TIMO_EMAIL, lauriAuthenticateResponse)
        Post("/v2/admin/owners/" + timoUUID + "/blacklist") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
          Get("/v2/public/timo/productivity") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
            val blacklistedPublicItem = responseAs[PublicItem]
            blacklistedPublicItem.blacklisted should not be(None)
          }
        }
        Post("/v2/admin/owners/" + timoUUID + "/unblacklist") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
          Get("/v2/public/timo/productivity") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
            val unblacklistedPublicItem = responseAs[PublicItem]
            unblacklistedPublicItem.blacklisted should be(None)
          }
        }
      }
    }
    it("should successfully publish note with POST to /v2/owners/[userUUID]/data/notes/[itemUUID]/publish "
      + "and unpublish it with POST to /v2/owners/[userUUID]/data/notes/[itemUUID]/unpublish") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newNote = Note("Public note", None, None, Some("this is public"), None, None, None)
      val putNoteResponse = putNewNote(newNote, authenticateResponse)

      // First preview note
      Post("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get + "/create_preview",
          marshal(PreviewPayload("md"))) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val previewNoteResult = responseAs[PreviewNoteResult]
        writeJsonOutput("previewNoteResponse", responseAs[String])
        Get("/v2/owners/" + authenticateResponse.userUUID + "/data/" + putNoteResponse.uuid.get + "/preview/" + previewNoteResult.preview) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
          val publicDraftItem = responseAs[PublicItem]
          writeJsonOutput("itemPreviewResponse", responseAs[String])
          publicDraftItem.note.visibility.get.preview.get should be (previewNoteResult.preview)
          publicDraftItem.note.visibility.get.previewExpires.get should be (previewNoteResult.previewExpires)
          // Next publish with path
          Post("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get + "/publish",
              marshal(PublishPayload("md", "test", Some(LicenceType.CC_BY_SA_4_0.toString), Some(true), Some("test ui"), None))) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
            val publishNoteResult = responseAs[PublishNoteResult]
            writeJsonOutput("publishNoteResponse", responseAs[String])
            val shortId = publishNoteResult.shortId
            val indexed = publishNoteResult.indexed.get
            Get("/v2/public/timo/test") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
              val publicItem = responseAs[PublicItem]
              publicItem.note.relationships should be(None)
              publicItem.note.visibility should not be(None)
              publicItem.note.visibility.get.preview should be (None)
              publicItem.note.visibility.get.previewExpires should be (None)
              publicItem.note.visibility.get.published.get should be (publicItem.note.modified.get)
              publicItem.note.visibility.get.licence.get should be (LicenceType.CC_BY_SA_4_0.toString)
              publicItem.note.visibility.get.indexed.get should be (indexed)
              publicItem.note.visibility.get.shortId.get should be (shortId)
              publicItem.note.visibility.get.publicUi.get should be ("test ui")
              Get("/v2/public/timo?modified=" + (publishNoteResult.published-1)) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                val publicItems = responseAs[PublicItems]
                publicItems.notes.get.length should be(1)
                publicItem.note.visibility.get.publishedRevision.get should be(1l)
              }
              shortId should be (publicItem.note.visibility.get.shortId.get)
              Get("/v2/short/" + shortId) ~> route ~> check {
                val publicItemHeaderResponse = responseAs[PublicItemHeader]
                publicItemHeaderResponse.handle should be ("timo")
                publicItemHeaderResponse.path.get should be ("test")
              }
            }

            // Save note, should not change title of published note and create a new revision
            val updatedNote = newNote.copy(title = "Public note modified")
            putExistingNote(updatedNote, putNoteResponse.uuid.get, authenticateResponse)
            Get("/v2/public/timo/test") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
              val publicItem = responseAs[PublicItem]
              publicItem.note.title should be(newNote.title)
              publicItem.note.visibility.get.publishedRevision.get should be(1l)
            }

            // Publish with same path and index, make sure that title is changed
            Post("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get + "/publish",
                marshal(PublishPayload("md", "test", Some(LicenceType.CC_BY_SA_4_0.toString), Some(true), None, None))) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
              val republishNoteResult = responseAs[PublishNoteResult]
              // Published the same note with edits should not change
              republishNoteResult.published should be(publishNoteResult.published)
              Get("/v2/public/timo/test") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                val publicItem = responseAs[PublicItem]
                publicItem.note.title should be(updatedNote.title)
                publicItem.note.visibility.get.publishedRevision.get should be(3l)
                publicItem.note.visibility.get.publicUi should be(None)
                publicItem.note.visibility.get.shortId.get should be(shortId)
                publicItem.note.visibility.get.indexed should not be(None)
                publicItem.note.visibility.get.published.get should be(publishNoteResult.published)
              }
              Get("/v2/short/" + shortId) ~> route ~> check {
                val publicItemHeaderResponse = responseAs[PublicItemHeader]
                publicItemHeaderResponse.handle should be ("timo")
                publicItemHeaderResponse.path.get should be ("test")
              }
            }

            // Publish with new path and see that there are four revisions
            Post("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get + "/publish",
              marshal(PublishPayload("md", "test2", None, None, None, None))) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
              Get("/v2/owners/" + authenticateResponse.userUUID + "/data/" + putNoteResponse.uuid.get + "/revisions") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                val revisionsResult = responseAs[ItemRevisions]
                revisionsResult.revisions.get.length should be (4)
                val firstRevision = revisionsResult.revisions.get.find(revision => revision.number == 1l).get
                val secondRevision = revisionsResult.revisions.get.find(revision => revision.number == 2l).get
                val thirdRevision = revisionsResult.revisions.get.find(revision => revision.number == 3l).get
                val fourthRevision = revisionsResult.revisions.get.find(revision => revision.number == 4l).get
                firstRevision.unpublished should not be (None)
                firstRevision.published should be (None)
                secondRevision.unpublished should be (None)
                secondRevision.published should be (None)
                thirdRevision.unpublished should not be (None)
                thirdRevision.published should be (None)
                fourthRevision.unpublished should be (None)
                fourthRevision.published should not be (None)

              }
              Get("/v2/short/" + shortId) ~> route ~> check {
                val publicItemHeaderResponse = responseAs[PublicItemHeader]
                publicItemHeaderResponse.handle should be ("timo")
                publicItemHeaderResponse.path.get should be ("test2")
              }
            }

            // Unpublish the latest
            Post("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get + "/unpublish") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
              writeJsonOutput("unpublishNoteResponse", responseAs[String])
              val unpublishedNoteResponse = getNote(putNoteResponse.uuid.get, authenticateResponse)
              unpublishedNoteResponse.visibility.get.published should be(None)
              unpublishedNoteResponse.visibility.get.path.get should be("test2")
              Get("/v2/public/timo/test") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                val failure = responseAs[ErrorResult]
                failure.code should be (3027)
              }
              Get("/v2/owners/" + authenticateResponse.userUUID + "/data/" + putNoteResponse.uuid.get + "/revisions") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                val revisionsResult = responseAs[ItemRevisions]
                revisionsResult.revisions.get.length should be (4)
                val firstRevision = revisionsResult.revisions.get.find(revision => revision.number == 1l).get
                val secondRevision = revisionsResult.revisions.get.find(revision => revision.number == 2l).get
                val thirdRevision = revisionsResult.revisions.get.find(revision => revision.number == 3l).get
                val fourthRevision = revisionsResult.revisions.get.find(revision => revision.number == 4l).get
                firstRevision.unpublished should not be (None)
                firstRevision.published should be (None)
                secondRevision.unpublished should be (None)
                secondRevision.published should be (None)
                thirdRevision.unpublished should not be (None)
                thirdRevision.published should be (None)
                fourthRevision.unpublished should not be (None)
                fourthRevision.published should be (None)
              }

              // Try to get with previous modified value that returned the note, make sure it has moved to "unpublished"
              Get("/v2/public/timo?modified=" + (publishNoteResult.published-1)) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                val publicItems = responseAs[PublicItems]
                publicItems.notes should be(None)
                publicItems.unpublished.get.length should be (1)
                publicItems.unpublished.get(0) should be (putNoteResponse.uuid.get)
              }
              // Now add an daily tick, which should prune the unpublished revision node from the index
              Post("/v2/tick",
                  marshal(Tick(3)).right.get) ~> route ~> check {
                val statusResponse = responseAs[String]
                statusResponse should be ("{\"status\":true}")
              }
              // Now the unpublished should have been pruned
              Get("/v2/public/timo?modified=" + (publishNoteResult.published-1)) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                val publicItems = responseAs[PublicItems]
                publicItems.notes should be(None)
                publicItems.unpublished should be (None)
              }
              Get("/v2/short/" + shortId) ~> route ~> check {
                val failure = responseAs[ErrorResult]
                status should be (BadRequest)
                failure.code should be(ERR_ITEM_INVALID_PUBLIC_PATH.number)
              }
            }
          }
        }
      }
    }
    it("should successfully get all public notes with GET to /v2/public/[handle]") {
      Get("/v2/public/timo/productivity") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
        val publicItem = responseAs[PublicItem]
        val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
        // Put the same tags to the new public note as in the note before that
        val newNote = Note("Public note", None, None, Some("this is public"), None, None,
            Some(ExtendedItemRelationships(None, None, None, None, None, publicItem.note.relationships.get.collectiveTags)))
        val putNoteResponse = putNewNote(newNote, authenticateResponse)
        Post("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get + "/publish",
            marshal(PublishPayload("md", "test", Some(LicenceType.CC_BY_SA_4_0.toString), None, None, None))) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val publishNoteResult = responseAs[PublishNoteResult]
          Get("/v2/public/timo") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
            val publicItems = responseAs[PublicItems]
            writeJsonOutput("publicItemsResponse", responseAs[String])
            publicItems.publicUi should not be(None)
            publicItems.content should not be(None)
            publicItems.format should not be(None)
            publicItems.notes.get.size should be(2)
            publicItems.collectiveTags.get.size should be(1)
            publicItems.collectiveTags.get(0)._2.size should be(2)

            // Getting modified should return only the latter
            Get("/v2/public/timo?modified=" + putNoteResponse.modified) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
              val modifiedPublicItems = responseAs[PublicItems]
              modifiedPublicItems.displayName should be(None)
              modifiedPublicItems.ownerType should be(None)
              modifiedPublicItems.notes.get.size should be(1)
              modifiedPublicItems.tags should be(None)
              modifiedPublicItems.collectiveTags.get.size should be(1)
              modifiedPublicItems.collectiveTags.get(0)._2.size should be(2)

              val latestModified = modifiedPublicItems.notes.get(0).modified.get
              // Change account values, expect modified to return different values
              Get("/v2/users/" + authenticateResponse.userUUID) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                val account = responseAs[User]
                // Should be able to update public modified value of owner
                Patch("/v2/users/" + authenticateResponse.userUUID,
                  marshal(account.copy(preferences=Some(OwnerPreferences(None, None, None)))).right.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                  // This should not change the response as public items have not changed
                  Get("/v2/public/timo?modified=" + latestModified) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                    val nonPublicModifiedItems = responseAs[PublicItems]
                    nonPublicModifiedItems.displayName should be(None)
                    nonPublicModifiedItems.ownerType should be(None)
                    nonPublicModifiedItems.modified should be (None)
                    nonPublicModifiedItems.notes should be(None)
                    nonPublicModifiedItems.tags should be(None)
                    nonPublicModifiedItems.collectiveTags should be(None)
                    Patch("/v2/users/" + authenticateResponse.userUUID,
                      marshal(account.copy(displayName=Some("testing"))).right.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                      Get("/v2/public/timo?modified=" + putNoteResponse.modified) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                        val ownerModifiedPublicItems = responseAs[PublicItems]
                        ownerModifiedPublicItems.displayName.get should be("testing")
                        ownerModifiedPublicItems.ownerType.get should be("user")
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
    it("should successfully get basic info of all public notes with GET to /v2/public") {
      Get("/v2/public/timo/productivity") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
        val publicItem = responseAs[PublicItem]
        val timoAuthenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
        // Put the same tags to a new public note
        val newTimoNote = Note("Public note by Timo", None, None, Some("this is public"), None, None,
            Some(ExtendedItemRelationships(None, None, None, None,
                 publicItem.note.relationships.get.tags, publicItem.note.relationships.get.collectiveTags)))
        val putTimoNoteResponse = putNewNote(newTimoNote, timoAuthenticateResponse)
        val publishTimoResult = publishNoteCC(putTimoNoteResponse.uuid.get, "timo-test-note", true, timoAuthenticateResponse)

        // Put another note that, but don't index it, should not be returned
        val newNonStatsTimoNote = Note("Published but not indexed from stats note by Timo", None, None, Some("this is public but not returned"), None, None,
            Some(ExtendedItemRelationships(None, None, None, None,
                 publicItem.note.relationships.get.tags, publicItem.note.relationships.get.collectiveTags)))
        val putTimoNonStatsNoteResponse = putNewNote(newNonStatsTimoNote, timoAuthenticateResponse)
        val publishNonStatsTimoResult = publishNoteCC(putTimoNonStatsNoteResponse.uuid.get, "timo-non-stats-test-note", false, timoAuthenticateResponse)

        // Also publish notes in Lauri's account, to get better results from stats
        val lauriAuthenticateResponse = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
        // Set handle to lauri to be able to publish
        Get("/v2/users/" + lauriAuthenticateResponse.userUUID) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
          val lauriAccount = responseAs[User]
          Patch("/v2/users/" + lauriAuthenticateResponse.userUUID,
            marshal(lauriAccount.copy(handle=Some("lauri"))).right.get) ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
            responseAs[PatchUserResponse]
          }
        }
        val newLauriNote = Note("Public note by Lauri", None, None, Some("this is a public note by Lauri"), None, None,
            Some(ExtendedItemRelationships(None, None, None, None,
                 None, publicItem.note.relationships.get.collectiveTags)))
        val putLauriNoteResponse = putNewNote(newLauriNote, lauriAuthenticateResponse)
        val publishLauriResult = publishNoteCC(putLauriNoteResponse.uuid.get, "lauri-test-note", true, lauriAuthenticateResponse)

        // Get stats
        Get("/v2/public") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
          val publicStats = responseAs[PublicStats]
          writeJsonOutput("publicResponse", responseAs[String])
          publicStats.users.get.size should be (2)
          val timoStats = publicStats.users.get.find(userStats => userStats.displayName == "Timo").get
          timoStats.notes.get.size should be (2)
          val lauriStats = publicStats.users.get.find(userStats => userStats.displayName == "lauri@extendedmind.org").get
          lauriStats.notes.get.size should be (1)
          publicStats.collectives.get.size should be (1)
          publicStats.collectives.get(0).notes.get.size should be (1)
          publicStats.commonTags.get.size should be (3)
          publicStats.commonTags.get.find(tag => tag.title == "productivity" && tag.parent.isDefined) should not be(None)
        }
        // Get stats using modified, should return only one result
        Get("/v2/public?modified=" + putLauriNoteResponse.modified) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
          val publicStats = responseAs[PublicStats]
          publicStats.users.get.size should be (1)
          publicStats.users.get(0).displayName should be ("lauri@extendedmind.org")
          publicStats.users.get(0).notes.get.size should be (1)
          publicStats.collectives should be (None)
          publicStats.commonTags.get.size should be (2)

          val latestNoteModified = publicStats.users.get(0).notes.get(0).modified
          Get("/v2/public?modified=" + latestNoteModified) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
            val nothingPublicStats = responseAs[PublicStats]
            nothingPublicStats.collectives should be(None)
            nothingPublicStats.users should be(None)
            nothingPublicStats.commonTags should be(None)

            // Blacklist Lauri and unblacklist user and check response
            val timoAuthenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
            val lauriUUID = lauriAuthenticateResponse.userUUID
            Post("/v2/admin/owners/" + lauriUUID + "/blacklist") ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
              Get("/v2/public?modified=" + latestNoteModified) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                val allBlackistedPublicStats = responseAs[PublicStats]
                allBlackistedPublicStats.users.get.size should be (2)
                val lauriReStats = allBlackistedPublicStats.users.get.find(userStats => userStats.displayName == "lauri@extendedmind.org").get
                val lauriBlacklisted: Long = lauriReStats.blacklisted.get

                Post("/v2/admin/owners/" + lauriUUID + "/unblacklist") ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
                  Get("/v2/public") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                    val unblacklistedPublicStats = responseAs[PublicStats]
                    val lauriUnStats = unblacklistedPublicStats.users.get.find(userStats => userStats.displayName == "lauri@extendedmind.org").get
                    lauriUnStats.blacklisted should be(None)
                    Get("/v2/public?modified=" + lauriBlacklisted) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                      responseAs[PublicStats].users should be(None)
                    }
                  }
                }
              }
            }
          }
        }
        // Unpublish and get stats
        Post("/v2/owners/" + timoAuthenticateResponse.userUUID + "/data/notes/" + putTimoNoteResponse.uuid.get + "/unpublish") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
          // Now get stats, should include unpublished
          Get("/v2/public") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
            val publicStats = responseAs[PublicStats]
            val timoStats = publicStats.users.get.find(userStats => userStats.displayName == "Timo").get
            timoStats.notes.get.size should be (1)
            timoStats.unpublished.get.size should be (1)
            timoStats.unpublished.get(0) should be (putTimoNoteResponse.uuid.get)
          }
        }
      }
    }

    it("should successfully get unpublished UUIDs from unpublished or deleted notes with GET to /v2/public/[handle]?modified") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Get("/v2/public/timo") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
        val publicItems = responseAs[PublicItems]
        publicItems.notes.get.size should be (1)
        val newNote = Note("Public note", None, None, Some("this is public"), None, None, None)
        val putNoteResponse = putNewNote(newNote, authenticateResponse)

        // Publish a second note
        Post("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get + "/publish",
            marshal(PublishPayload("md", "test", Some(LicenceType.CC_BY_SA_4_0.toString), None, None, None))) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val publishNoteResult = responseAs[PublishNoteResult]
          Get("/v2/public/timo") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
             responseAs[PublicItems].notes.get.size should be (2)
             // Delete the first note
             Delete("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" +  publicItems.notes.get(0).uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
               // Getting notes
               Get("/v2/public/timo") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                 responseAs[PublicItems].notes.get.size should be (1)
               }
               Get("/v2/public/timo?modified=" + publicItems.notes.get(0).modified.get) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
                 val oneDeletedPublicItem = responseAs[PublicItems]
                 oneDeletedPublicItem.notes.get.size should be (1)
                 oneDeletedPublicItem.unpublished.get.size should be (1)
                 oneDeletedPublicItem.unpublished.get(0) should be(publicItems.notes.get(0).uuid.get)
               }
               // Unpublish the second note and check that unpublished contains two uuids
               Post("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get + "/unpublish") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                 Get("/v2/public/timo?modified=" + publicItems.notes.get(0).modified.get) ~> addHeader("Content-Type", "application/json") ~> route ~> check {
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
    it("should successfully get revisions with GET to /v2/owners/[userUUID]/data/[itemUUID]/revisions") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newNote = Note("Spanish 101", None, None, Some("lecture notes for Spanish 101 class"), None, None, None)
      val putNoteResponse = putNewNote(newNote, authenticateResponse)
      getItemRevisionList(putNoteResponse.uuid.get, authenticateResponse).revisions should be (None)

      // Force creation of first revision right away
      val noteRevision1 = newNote.copy(title = "Spanish 101 and then some", revision = Some(1l))
      putExistingNote(noteRevision1, putNoteResponse.uuid.get, authenticateResponse)
      // Also output response to json
      getItemRevisionList(putNoteResponse.uuid.get, authenticateResponse, Some("itemRevisionsResponse")).revisions.get.length should be (1)
      getItemRevision(putNoteResponse.uuid.get, 1l, authenticateResponse, Some("itemRevisionResponse")).note.get.title should be (noteRevision1.title)

      // Also force creation of second revision right away
      val noteRevision2 = newNote.copy(title = "Spanish 101 and then some 2", revision = Some(2l))
      putExistingNote(noteRevision2, putNoteResponse.uuid.get, authenticateResponse)
      getItemRevisionList(putNoteResponse.uuid.get, authenticateResponse).revisions.get.length should be (2)
      getItemRevision(putNoteResponse.uuid.get, 2l, authenticateResponse).note.get.title should be (noteRevision2.title)
      getItemRevision(putNoteResponse.uuid.get, 1l, authenticateResponse).note.get.title should be (noteRevision1.title)

      // Note revision 3 is created when note converting to list
      val noteRevision3 = newNote.copy(title = "Spanish 101 list")
      Post("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get + "/convert_to_list",
          marshal(noteRevision3)) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val listFromNote = responseAs[List]
        getItemRevisionList(putNoteResponse.uuid.get, authenticateResponse).revisions.get.length should be (3)
        getItemRevision(putNoteResponse.uuid.get, 3l, authenticateResponse).list.get.title should be (noteRevision3.title)
        getItemRevision(putNoteResponse.uuid.get, 2l, authenticateResponse).note.get.title should be (noteRevision2.title)
        getItemRevision(putNoteResponse.uuid.get, 1l, authenticateResponse).note.get.title should be (noteRevision1.title)

        // Note revision 4 is created when list is converted to task
        val noteRevision4 = newNote.copy(title = "Spanish 101 task")
        Post("/v2/owners/" + authenticateResponse.userUUID + "/data/lists/" + putNoteResponse.uuid.get + "/convert_to_task",
          marshal(noteRevision4)) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val taskFromList = responseAs[Task]
          getItemRevisionList(putNoteResponse.uuid.get, authenticateResponse).revisions.get.length should be (4)
          getItemRevision(putNoteResponse.uuid.get, 4l, authenticateResponse).task.get.title should be (noteRevision4.title)
          getItemRevision(putNoteResponse.uuid.get, 3l, authenticateResponse).list.get.title should be (noteRevision3.title)
          getItemRevision(putNoteResponse.uuid.get, 2l, authenticateResponse).note.get.title should be (noteRevision2.title)
          getItemRevision(putNoteResponse.uuid.get, 1l, authenticateResponse).note.get.title should be (noteRevision1.title)

          // Note revision 5 is created when task is converted back to note
          val noteRevision5 = newNote.copy(title = "Spanish 101 back to note")
          Post("/v2/owners/" + authenticateResponse.userUUID + "/data/tasks/" + putNoteResponse.uuid.get + "/convert_to_note",
            marshal(noteRevision5)) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
            getItemRevisionList(putNoteResponse.uuid.get, authenticateResponse).revisions.get.length should be (5)
            getItemRevision(putNoteResponse.uuid.get, 5l, authenticateResponse).note.get.title should be (noteRevision5.title)
            getItemRevision(putNoteResponse.uuid.get, 4l, authenticateResponse).task.get.title should be (noteRevision4.title)
            getItemRevision(putNoteResponse.uuid.get, 3l, authenticateResponse).list.get.title should be (noteRevision3.title)
            getItemRevision(putNoteResponse.uuid.get, 2l, authenticateResponse).note.get.title should be (noteRevision2.title)
            getItemRevision(putNoteResponse.uuid.get, 1l, authenticateResponse).note.get.title should be (noteRevision1.title)

            // Publish the note thus creating a 6. revision
            Post("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + putNoteResponse.uuid.get + "/publish",
                marshal(PublishPayload("md", "spanish", Some(LicenceType.CC_BY_SA_4_0.toString), None, None, None))) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
              getItemRevisionList(putNoteResponse.uuid.get, authenticateResponse).revisions.get.length should be (6)
              getItemRevision(putNoteResponse.uuid.get, 6l, authenticateResponse).note.get.title should be (noteRevision5.title)
              getItemRevision(putNoteResponse.uuid.get, 5l, authenticateResponse).note.get.title should be (noteRevision5.title)
              getItemRevision(putNoteResponse.uuid.get, 4l, authenticateResponse).task.get.title should be (noteRevision4.title)
              getItemRevision(putNoteResponse.uuid.get, 3l, authenticateResponse).list.get.title should be (noteRevision3.title)
              getItemRevision(putNoteResponse.uuid.get, 2l, authenticateResponse).note.get.title should be (noteRevision2.title)
              getItemRevision(putNoteResponse.uuid.get, 1l, authenticateResponse).note.get.title should be (noteRevision1.title)

              // Note revision is created when editing after publish, even without forcing
              val noteRevision7 = newNote.copy(title = "Spanish 101 modifications after publish")
              val putNoteResponse7 = putExistingNote(noteRevision7, putNoteResponse.uuid.get, authenticateResponse)
              putNoteResponse7.revision.get should be (7)
              getItemRevisionList(putNoteResponse.uuid.get, authenticateResponse).revisions.get.length should be (7)

              // Saving when previous is not published does not create a new revision
              val noteWithoutRevision = newNote.copy(title = "Spanish 101 modifications after publish not forced")
              val putNoteResponseNoRevision = putExistingNote(noteWithoutRevision, putNoteResponse.uuid.get, authenticateResponse)
              getItemRevisionList(putNoteResponse.uuid.get, authenticateResponse).revisions.get.length should be (7)

              // Note revision 8 is again forced
              val noteRevision8 = newNote.copy(title = "Spanish 101 modifications after publish forced", revision = Some(8l))
              val putNoteResponse8Revision = putExistingNote(noteRevision8, putNoteResponse.uuid.get, authenticateResponse)
              putNoteResponse8Revision.revision.get should be(8)

              getItemRevisionList(putNoteResponse.uuid.get, authenticateResponse).revisions.get.length should be (8)
              getItemRevision(putNoteResponse.uuid.get, 8l, authenticateResponse).note.get.title should be (noteRevision8.title)
              getItemRevision(putNoteResponse.uuid.get, 7l, authenticateResponse).note.get.title should be (noteRevision7.title)
              getItemRevision(putNoteResponse.uuid.get, 6l, authenticateResponse).note.get.title should be (noteRevision5.title)
              getItemRevision(putNoteResponse.uuid.get, 5l, authenticateResponse).note.get.title should be (noteRevision5.title)
              getItemRevision(putNoteResponse.uuid.get, 4l, authenticateResponse).task.get.title should be (noteRevision4.title)
              getItemRevision(putNoteResponse.uuid.get, 3l, authenticateResponse).list.get.title should be (noteRevision3.title)
              getItemRevision(putNoteResponse.uuid.get, 2l, authenticateResponse).note.get.title should be (noteRevision2.title)
              getItemRevision(putNoteResponse.uuid.get, 1l, authenticateResponse).note.get.title should be (noteRevision1.title)
            }
          }
        }
      }
    }
  }
}
