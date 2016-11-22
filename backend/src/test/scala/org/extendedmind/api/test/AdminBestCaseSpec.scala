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
 * Best case test for admin routes. Also generates .json files.
 */
class AdminBestCaseSpec extends ServiceSpecBase {

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

  describe("In the best case, AdminService") {
    it("should successfully create new collective with POST to /v2/collectives/create_collective "
      + "update it with PATCH to /v2/collectives/[collectiveUUID] "
      + "and get it back with GET to /v2/collectives/[collectiveUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val testCollective = Collective("Test", None, None, None, None, None, Some(OwnerPreferences(None, Some("{\"useCC\":true}"))))
      Post("/v2/collectives/create_collective",
        marshal(testCollective).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          writeJsonOutput("putCollectiveResponse", responseAs[String])
          val putCollectiveResponse = responseAs[SetResult]
          val collectiveUUID = putCollectiveResponse.uuid.get
          putCollectiveResponse.modified should not be None

          // Authenticating again should have the new collective
          val reauthenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
          reauthenticateResponse.collectives should not be None
          reauthenticateResponse.collectives.get.get(collectiveUUID).get._1 should equal(testCollective.title.get)
          reauthenticateResponse.collectives.get.get(collectiveUUID).get._2 should equal(0)
          reauthenticateResponse.collectives.get.get(collectiveUUID).get._3 should equal(false)

          // Update collective
          Patch("/v2/collectives/" + collectiveUUID,
            marshal(testCollective.copy(description = Some("test description"), common = Some(true), handle=Some("test"))).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", reauthenticateResponse.token.get)) ~> route ~> check {
              writeJsonOutput("putExistingCollectiveResponse", responseAs[String])
              val putExistingCollectiveResponse = responseAs[SetResult]
              putExistingCollectiveResponse.uuid should be(None)
              assert(putExistingCollectiveResponse.modified > putCollectiveResponse.modified)
              // Get it back
              Get("/v2/collectives/" + collectiveUUID) ~> addCredentials(BasicHttpCredentials("token", reauthenticateResponse.token.get)) ~> route ~> check {
                val collectiveResponse = responseAs[Collective]
                writeJsonOutput("collectiveResponse", responseAs[String])
                collectiveResponse.description.get should be("test description")
                collectiveResponse.inboxId should not be None
                collectiveResponse.common should be(None)
                collectiveResponse.handle.get should be("test")
                collectiveResponse.preferences.get.ui.get should be("{\"useCC\":true}")
                collectiveResponse.access.get.length should be (1)
                collectiveResponse.access.get(0)._2 should be ("Timo")
                collectiveResponse.access.get(0)._3 should be (0)
                // Should be possible to assign read/write access to new collective
                val lauriAuthenticateResponse = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
                lauriAuthenticateResponse.collectives.get.get(collectiveUUID) should equal(None)
                val lauriUUID = getUserUUID(LAURI_EMAIL, reauthenticateResponse)

                Post("/v2/collectives/" + collectiveUUID + "/change_permission/" + lauriUUID,
                  marshal(UserAccessRight(Some(2))).right.get) ~> addCredentials(BasicHttpCredentials("token", reauthenticateResponse.token.get)) ~> route ~> check {
                    val postCollectiveUserPermissionResponse = responseAs[SetResult]
                    writeJsonOutput("postCollectiveUserPermissionResponse", responseAs[String])
                    assert(postCollectiveUserPermissionResponse.modified > putExistingCollectiveResponse.modified)
                    val lauriReauthenticateResponse = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
                    lauriReauthenticateResponse.collectives.get.get(collectiveUUID).get._2 should equal(2)
                  }
                Get("/v2/collectives/" + collectiveUUID) ~> addCredentials(BasicHttpCredentials("token", reauthenticateResponse.token.get)) ~> route ~> check {
                  val modifiedCollectiveResponse = responseAs[Collective]
                  modifiedCollectiveResponse.access.get.length should be (2)
                  modifiedCollectiveResponse.access.get.find(access => {
                    access._2 =="Timo" &&
                    access._3 == 0
                  }) should not be(None)
                  modifiedCollectiveResponse.access.get.find(access => {
                    access._2 =="lauri@extendedmind.org" &&
                    access._3 == 2
                  }) should not be(None)
                }
                // Put a task to the collective and assign it to Lauri
                val newTask = Task("learn Spanish", None, None, None, None, None,
                    Some(ExtendedItemRelationships(None, None, Some(lauriUUID), None, None, None)))
                val putTaskResponse = putNewTask(newTask, authenticateResponse, foreignOwnerUUID=putCollectiveResponse.uuid)

                // Get collective tasks, check that assign is correct
                Get("/v2/owners/" + collectiveUUID + "/data") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                  val itemsResponse = responseAs[Items]
                  itemsResponse.items should be(None)
                  itemsResponse.tasks.get.length should equal(1)
                  itemsResponse.tasks.get(0).relationships.get.assignee.get should be (lauriUUID)
                  itemsResponse.tasks.get(0).relationships.get.assigner.get should be (authenticateResponse.userUUID)
                  itemsResponse.notes should be(None)
                }

                // Get Lauri's tasks, check that the assigned task is in there
                Get("/v2/owners/" + lauriUUID + "/data") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
                  val lauriItemsResponse = responseAs[Items]
                  lauriItemsResponse.tasks should be(None)
                  lauriItemsResponse.assigned.get(0).collective should be (collectiveUUID)
                  lauriItemsResponse.assigned.get(0).tasks.get(0).uuid.get should be (putTaskResponse.uuid.get)
                  lauriItemsResponse.assigned.get(0).tasks.get(0).relationships.get.assignee should be (None)
                  lauriItemsResponse.assigned.get(0).tasks.get(0).relationships.get.assigner.get should be (authenticateResponse.userUUID)
                }
                // Get Lauri's tasks using a modified 0, should get same result
                Get("/v2/owners/" + lauriUUID + "/data?modified=0") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
                  val lauriItemsResponse = responseAs[Items]
                  lauriItemsResponse.tasks should be(None)
                  lauriItemsResponse.assigned.get(0).collective should be (collectiveUUID)
                  lauriItemsResponse.assigned.get(0).tasks.get(0).uuid.get should be (putTaskResponse.uuid.get)
                  lauriItemsResponse.assigned.get(0).tasks.get(0).relationships.get.assignee should be (None)
                  lauriItemsResponse.assigned.get(0).tasks.get(0).relationships.get.assigner.get should be (authenticateResponse.userUUID)
                }
                // Get Lauri's tasks using a modified now, should get empty result
                Get("/v2/owners/" + lauriUUID + "/data?modified=" + System.currentTimeMillis) ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
                  val lauriItemsResponse = responseAs[Items]
                  isEmptyItems(lauriItemsResponse) should be (true)
                }

                // Remove assign, make sure task has been removed
                val putExistingTaskResponse = putExistingTask(newTask.copy(relationships=None), putTaskResponse.uuid.get, authenticateResponse, foreignOwnerUUID=putCollectiveResponse.uuid)
                Get("/v2/owners/" + collectiveUUID + "/data") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                  val itemsResponse = responseAs[Items]
                  itemsResponse.tasks.get.length should equal(1)
                  itemsResponse.tasks.get(0).relationships should be (None)
                }

                // Get Lauri's tasks, check that the assigned task has been removed
                Get("/v2/owners/" + lauriUUID + "/data") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
                  val lauriItemsResponse = responseAs[Items]
                  lauriItemsResponse.assigned should be (None)
                }

                // Put a new note, put it again and assign
                val newNote = Note("Public note", None, None, Some("this is public"), None, None, None)
                val putNoteResponse = putNewNote(newNote, authenticateResponse, foreignOwnerUUID=Some(collectiveUUID))
                Get("/v2/owners/" + lauriUUID + "/data") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
                  val lauriItemsResponse = responseAs[Items]
                  lauriItemsResponse.assigned should be (None)
                }
                val assignedNote = newNote.copy(relationships=Some(ExtendedItemRelationships(None, None, Some(lauriUUID), None, None, None)))
                putExistingNote(assignedNote, putNoteResponse.uuid.get, authenticateResponse, foreignOwnerUUID=Some(collectiveUUID))
                Get("/v2/owners/" + lauriUUID + "/data") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
                  val lauriItemsResponse = responseAs[Items]
                  lauriItemsResponse.assigned.get(0).notes.get(0).uuid.get should be (putNoteResponse.uuid.get)
                }

                // Publish note, verify that public result has the right assignee
                var shortId:String = null
                Post("/v2/owners/" + collectiveUUID + "/data/notes/" + putNoteResponse.uuid.get + "/publish",
                      marshal(PublishPayload("md", "public-note", Some(LicenceType.CC_BY_SA_4_0.toString), None, Some("test ui"), None))) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                  val publishNoteResult = responseAs[PublishNoteResult]
                  shortId = publishNoteResult.shortId
                  Get("/v2/short/" + shortId) ~> route ~> check {
                    val publicItemHeaderResponse = responseAs[PublicItemHeader]
                    publicItemHeaderResponse.handle should be ("test")
                    publicItemHeaderResponse.path.get should be ("public-note")
                  }
                }
                Get("/v2/public/test") ~> route ~> check {
                  val publicItemsResponse = responseAs[PublicItems]
                  publicItemsResponse.notes.get.length should be (1)
                  publicItemsResponse.notes.get(0).relationships.get.assignee.get should be (lauriUUID)
                  publicItemsResponse.notes.get(0).visibility.get.shortId should not be (None)
                  publicItemsResponse.notes.get(0).visibility.get.publicUi.get should be ("test ui")
                  publicItemsResponse.assignees.get.length should be (1)
                  publicItemsResponse.assignees.get(0).uuid should be (lauriUUID)
                  publicItemsResponse.assignees.get(0).displayName should be ("lauri@extendedmind.org")
                }

                // Convert note to list, verify that it fails because note is published
                Post("/v2/owners/" + collectiveUUID + "/data/notes/" + putNoteResponse.uuid.get + "/convert_to_list",
                    marshal(newNote)) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                  val failure = responseAs[ErrorResult]
                  status should be (BadRequest)
                  failure.code should be(ERR_NOTE_CONVERT_PUBLISHED.number)
                }

                // Unpublish, then convert again should work
                Post("/v2/owners/" + collectiveUUID + "/data/notes/" + putNoteResponse.uuid.get + "/unpublish") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                  val unpublishNoteResult = responseAs[SetResult]
                  Post("/v2/owners/" + collectiveUUID + "/data/notes/" + putNoteResponse.uuid.get + "/convert_to_list",
                      marshal(assignedNote)) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val listFromNote = responseAs[List]
                    listFromNote.relationships.get.assignee.get should be (lauriUUID)
                    listFromNote.relationships.get.assigner.get should be (authenticateResponse.userUUID)
                  }
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
    it("should successfully get user with GET /v2/admin/users?email=[email]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Get("/v2/users?email=" + LAURI_EMAIL) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        writeJsonOutput("userResponse", responseAs[String])
        val publicUser = responseAs[PublicUser]
        publicUser.uuid should not be None
      }
    }
    it("should successfully get collective items with GET to /v2/owners/[collectiveUUID]/data"
      + "put new task on PUT to /v2/owners//[collectiveUUID]/data/tasks "
      + "update it with PUT to /v2/owners/[collectiveUUID]/data/tasks/[itemUUID] "
      + "and get it back with GET to /v2/owners/[collectiveUUID]/data/tasks/[itemUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val collectiveUuidMap = getCollectiveUUIDMap(authenticateResponse)
      val tcUUID = collectiveUuidMap.get("test company").get
      Get("/v2/owners/" + tcUUID + "/data") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = responseAs[Items]
        writeJsonOutput("collectiveItemsResponse", responseAs[String])
        itemsResponse.items should not be None
        itemsResponse.tasks should not be None
        itemsResponse.tasks.get.length should equal(1)
        itemsResponse.notes should not be None
      }
      val newTask = Task("change border colour to lighter gray", None, None, None, None, None, None)
      val putTaskResponse = putNewTask(newTask, authenticateResponse, Some(tcUUID))
      val putExistingTaskResponse = putExistingTask(newTask.copy(description = Some("e.g. #EDEDED")),
        putTaskResponse.uuid.get, authenticateResponse, Some(tcUUID))
      assert(putExistingTaskResponse.modified > putTaskResponse.modified)

      val updatedTask = getTask(putTaskResponse.uuid.get, authenticateResponse, Some(tcUUID))
      updatedTask.description should not be None
    }
    it("should successfully change user type with POST to /v2/admin/users/UUID/change_user_type") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Get("/v2/users?email=" + INFO_EMAIL) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val infoUser = responseAs[PublicUser]
        Post("/v2/admin/users/" + infoUser.uuid + "/change_user_type",
            marshal(Access(Token.ALFA)).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          writeJsonOutput("changeUserTypeResponse", responseAs[String])
          val changeUserTypeResponse = responseAs[SetResult]
          changeUserTypeResponse.modified should not be None
          val infoAuthenticateResponse = emailPasswordAuthenticate(INFO_EMAIL, INFO_PASSWORD)
          infoAuthenticateResponse.userType should equal(Token.ALFA)

          // Also verify that account works
          Get("/v2/users/" + authenticateResponse.userUUID) ~> addCredentials(BasicHttpCredentials("token", infoAuthenticateResponse.token.get)) ~> route ~> check {
            val userResponse = responseAs[User]
          }

          Post("/v2/admin/users/" + infoUser.uuid + "/change_user_type",
              marshal(Access(Token.NORMAL)).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
            val infoReAuthenticateResponse = emailPasswordAuthenticate(INFO_EMAIL, INFO_PASSWORD)
            infoReAuthenticateResponse.userType should equal(Token.NORMAL)

            // Also verify that account works
            Get("/v2/users/" + authenticateResponse.userUUID) ~> addCredentials(BasicHttpCredentials("token", infoAuthenticateResponse.token.get)) ~> route ~> check {
              val userReResponse = responseAs[User]
            }
          }
        }
      }
    }
    it("should successfully reset tokens with POST to /v2/admin/reset_tokens, " +
      "rebuild user indexes with POST to /v2/admin/users/rebuild, " +
      "and rebuild item indexes with POST to /admin/[userUUID]/items/rebuild") {
      Post("/v2/admin/reset_tokens") ~> addCredentials(BasicHttpCredentials("token", emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD).token.get)) ~> route ~> check {
        writeJsonOutput("tokensResetResponse", responseAs[String])
        val countResult = responseAs[CountResult]
        countResult.count should be(6)
      }
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Post("/v2/admin/rebuild_users_index") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        writeJsonOutput("usersRebuildResponse", responseAs[String])
        val countResult = responseAs[CountResult]
        countResult.count should be(3)
      }
      Post("/v2/admin/users/" + authenticateResponse.userUUID + "/rebuild_items_index") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        writeJsonOutput("itemsRebuildResponse", responseAs[String])
        val countResult = responseAs[CountResult]
        countResult.count should be(17)
      }
    }
    it("should successfully rebuild items and public indexes with POST to /v2/admin/rebuild_public_and_items_indexes") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Post("/v2/admin/rebuild_public_and_items_indexes") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val countResult = responseAs[CountResult]
        countResult.count should be(6)
        Get("/v2/public/timo/productivity") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
          val publicItem = responseAs[PublicItem]
          Get("/v2/public/timo") ~> addHeader("Content-Type", "application/json") ~> route ~> check {
            val publicItems = responseAs[PublicItems]
          }
        }
        Get("/v2/owners/" + authenticateResponse.userUUID + "/data") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val itemsResponse = responseAs[Items]
          itemsResponse.tasks.get.length should equal(6)
        }
      }
    }
    it("should successfully get statistics with GET to /v2/admin") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Get("/v2/admin") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val statistics = responseAs[Statistics]
        writeJsonOutput("statisticsResponse", responseAs[String])
      }
    }
    it("should successfully get owners with GET to /v2/owners") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Get("/v2/owners") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val owners = responseAs[Owners]
        writeJsonOutput("ownersResponse", responseAs[String])
      }
    }
    it("should successfully destroy a user with POST to /v2/admin/users/[userUUID]/destroy_user") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Get("/v2/owners") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val owners = responseAs[Owners]
        val lauriUser = owners.users.filter(user => if (user.email.get == LAURI_EMAIL) true else false)(0)
        Post("/v2/admin/users/" + lauriUser.uuid.get + "/destroy_user") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          writeJsonOutput("destroyUserResponse", responseAs[String])
          val destroyUserResponse = responseAs[DestroyResult]
          destroyUserResponse.destroyed(0) should be (lauriUser.uuid.get)
          Get("/v2/owners") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
            responseAs[Owners].users.filter(user => if (user.email.get == LAURI_EMAIL) true else false).size should be(0)
          }
        }
      }
    }
    it("should successfully send hourly tick with POST to /tick") {
      Post("/tick",
          marshal(Tick(2)).right.get) ~> route ~> check {
        val statusResponse = responseAs[String]
        statusResponse should be ("{\"status\":true}")
      }
    }
    it("should successfully get foreign item statistics with GET to /v2/admin/items/[itemUUID]/stats " +
       "and change and remove single item Long and String properties with POST to /v2/admin/items/[itemUUID]/change_property " +
       "and change and remove single owner Long and String properties with POST to /v2/admin/owners/[itemUUID]/change_property ") {
      val timoAuthenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val lauriAuthenticateResponse = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
      Get("/v2/owners/" + lauriAuthenticateResponse.userUUID + "/data?completed=true") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = responseAs[Items]
        itemsResponse.tasks.get.length should be(1)
        val itemUUID = itemsResponse.tasks.get(0).uuid.get
        val completed = itemsResponse.tasks.get(0).completed.get
        val title = itemsResponse.tasks.get(0).title
        Get("/v2/admin/items/" + itemUUID + "/stats") ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
          val statisticsResponse = responseAs[NodeStatistics]
          writeJsonOutput("itemStatisticsResponse", responseAs[String])
          // Change two values and remove one property
          val newCompleted = System.currentTimeMillis
          Post("/v2/admin/items/" + itemUUID + "/change_property",
              marshal(NodeProperty("completed", None, Some(newCompleted))).right.get) ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
            val setResult = responseAs[SetResult]
          }
          val newTitle = "updated"
          Post("/v2/admin/items/" + itemUUID + "/change_property",
              marshal(NodeProperty("title", Some(newTitle), None)).right.get) ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
            val setResult = responseAs[SetResult]
          }
          Post("/v2/admin/items/" + itemUUID + "/change_property",
              marshal(NodeProperty("description", None, None)).right.get) ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
            val setResult = responseAs[SetResult]
          }
          Get("/v2/owners/" + lauriAuthenticateResponse.userUUID + "/data?completed=true") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
            val changedTask = responseAs[Items].tasks.get(0)
            changedTask.completed.get should be(newCompleted)
            changedTask.title should be(newTitle)
            changedTask.description should be(None)
          }
        }

        Post("/v2/admin/owners/" + lauriAuthenticateResponse.userUUID + "/change_property",
              marshal(NodeProperty("sid", None, Some(2))).right.get) ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
          val setResult = responseAs[SetResult]
        }
        Post("/v2/admin/owners/" + lauriAuthenticateResponse.userUUID + "/change_property",
              marshal(NodeProperty("handle", Some("lauri"), None)).right.get) ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
          val setResult = responseAs[SetResult]
        }
        Post("/v2/admin/owners/" + lauriAuthenticateResponse.userUUID + "/change_property",
              marshal(NodeProperty("displayName", Some("Lauri J"), None)).right.get) ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
          val setResult = responseAs[SetResult]
        }
        Get("/v2/users/" + lauriAuthenticateResponse.userUUID) ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
          val account = responseAs[User]
          account.handle.get should be("lauri")
          account.displayName.get should be("Lauri J")
          account.shortId.get should be("2")
        }
      }
    }
    it("should successfully get owner statistics with GET to /v2/admin/owners/[ownerUUID]/stats") {
      val timoAuthenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val lauriAuthenticateResponse = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
      Get("/v2/admin/owners/" + lauriAuthenticateResponse.userUUID.toString + "/stats") ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
        val statisticsResponse = responseAs[NodeStatistics]
        writeJsonOutput("ownerStatisticsResponse", responseAs[String])
      }
    }
    it("should successfully put version info with POST to /v2/admin/update_version " +
       "and get it back without authentication from GET to /info and GET to /v2/update") {
      Get("/info") ~> route ~> check {
        val info = responseAs[Info]
        info.clients should be (None)
      }
      Get("/v2/update?platform=darwin&version=0.9") ~> route ~> check {
        status should be (NoContent)
      }

      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val osxVersionBeta =
        PlatformVersionInfo(None, Some("beta"), None, None, "1.0-beta", None,
          Some("http://localhost:8008/files/testdata-1.0-beta.zip"),
          Some("http://localhost:8008/files/testdata-1.0-beta.dmg"))

      Post("/v2/admin/update_version",
          marshal(VersionInfo("darwin", osxVersionBeta)).right.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get))  ~> route ~> check {
        val setResult = responseAs[SetResult]
      }

      Get("/info?history=true") ~> route ~> check {
        val info = responseAs[Info]
        info.clients.get.size should be (1)
        info.clients.get(0).platform should be("darwin")
        info.clients.get(0).info.version should be("1.0-beta")
        info.clients.get(0).info.notes should be(None)
      }

      Get("/v2/update?platform=darwin&version=0.9") ~> route ~> check {
        val squirrelInfo = responseAs[PlatformVersionInfo]
        squirrelInfo.url.get should be ("http://localhost:8008/files/testdata-1.0-beta.zip")
        squirrelInfo.fullUrl should be (None)
        squirrelInfo.updateUrl should be (None)
        squirrelInfo.notes should be(None)
        squirrelInfo.version should be("1.0-beta")
        squirrelInfo.name.get should be("beta")
      }
      Get("/v2/update?platform=darwin&version=1.0-beta") ~> route ~> check {
        status should be (NoContent)
      }

      // Update the previous version
      Post("/v2/admin/update_version",
          marshal(VersionInfo("darwin", osxVersionBeta.copy(notes=Some("this is a beta version")))).right.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get))  ~> route ~> check {
        val setResult = responseAs[SetResult]
      }
      Get("/info?history=true") ~> route ~> check {
        val info = responseAs[Info]
        info.clients.get.size should be (1)
        info.clients.get(0).platform should be("darwin")
        info.clients.get(0).info.version should be("1.0-beta")
        info.clients.get(0).info.notes.get should be("this is a beta version")
      }
      Get("/v2/update?platform=darwin&version=0.9") ~> route ~> check {
        val squirrelInfo = responseAs[PlatformVersionInfo]
        writeJsonOutput("updateResponse", responseAs[String])
        squirrelInfo.url.get should be ("http://localhost:8008/files/testdata-1.0-beta.zip")
        squirrelInfo.fullUrl should be (None)
        squirrelInfo.updateUrl should be (None)
        squirrelInfo.notes.get should be("this is a beta version")
      }
      Get("/v2/update?platform=win32&version=0.9") ~> route ~> check {
        status should be (NoContent)
      }

      // Add another platform
      val winVersionBeta = osxVersionBeta.copy(
          name = None,
          updateUrl = Some("http://localhost:8008/files/testdata-1.0-beta.nupkg"),
          fullUrl = Some("http://localhost:8008/files/testdata-1.0-beta.exe"))
      Post("/v2/admin/update_version",
          marshal(VersionInfo("win32", winVersionBeta)).right.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get))  ~> route ~> check {
        val setResult = responseAs[SetResult]
      }
      Get("/info?history=true") ~> route ~> check {
        val info = responseAs[Info]
        info.commonCollective._2 should be ("test data")
        info.clients.get.size should be (2)
        info.clients.get.find(info => info.platform == "darwin") should not be None
        info.clients.get.find(info => info.platform == "win32") should not be None
      }
      Get("/v2/update?platform=win32&version=0.9") ~> route ~> check {
        val squirrelInfo = responseAs[PlatformVersionInfo]
        squirrelInfo.url.get should be ("http://localhost:8008/files/testdata-1.0-beta.nupkg")
        squirrelInfo.fullUrl should be (None)
        squirrelInfo.updateUrl should be (None)
        squirrelInfo.version should be("1.0-beta")
        // When name is not set, it should default to version
        squirrelInfo.name.get should be(squirrelInfo.version)
      }
      Get("/v2/update?platform=win32&version=0.9&userType=3") ~> route ~> check {
        val squirrelInfo = responseAs[PlatformVersionInfo]
        squirrelInfo.url.get should be ("http://localhost:8008/files/testdata-1.0-beta.nupkg")
      }
      Get("/v2/update?platform=win32&version=1.0-beta") ~> route ~> check {
        status should be (NoContent)
      }

      // Add another version to first platform, but only for BETA, or more privileged users
      val osxVersionBeta2 = osxVersionBeta.copy(
          version = "1.0-beta.2",
          name = Some("beta2"),
          userType = Some(Token.BETA),
          updateUrl = Some("http://localhost:8008/files/testdata-1.0-beta.2.zip"),
          fullUrl = Some("http://localhost:8008/files/testdata-1.0-beta.2.dmg"))
      Post("/v2/admin/update_version",
          marshal(VersionInfo("darwin", osxVersionBeta2)).right.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get))  ~> route ~> check {
        val setResult = responseAs[SetResult]
      }
      Get("/info?history=true") ~> route ~> check {
        val info = responseAs[Info]
        writeJsonOutput("infoResponse", responseAs[String])
        info.clients.get.size should be (3)
        info.clients.get.filter(info => info.platform == "darwin").size should be(2)
        info.clients.get.find(info => info.platform == "darwin" &&
                                      info.info.userType.isDefined && info.info.userType.get == Token.BETA) should not be None
        info.clients.get.find(info => info.platform == "win32") should not be None
      }

      // Updates should only return beta 2
      Get("/info?latest=true") ~> route ~> check {
        val info = responseAs[Info]
        info.clients.get.size should be (2)
        info.clients.get.find(info => info.platform == "darwin").get.info.version should be("1.0-beta.2")
        info.clients.get.find(info => info.platform == "win32") should not be None
      }
      Get("/v2/update?platform=darwin&version=0.9") ~> route ~> check {
        val squirrelInfo = responseAs[PlatformVersionInfo]
        squirrelInfo.url.get should be ("http://localhost:8008/files/testdata-1.0-beta.zip")
      }
      Get("/v2/update?platform=darwin&version=1.0-beta") ~> route ~> check {
        status should be (NoContent)
      }
      // For ADMIN, ALFA and BETA users, the latest version should be visible
      Get("/v2/update?platform=darwin&version=0.9&userType=1") ~> route ~> check {
        val squirrelInfo = responseAs[PlatformVersionInfo]
        squirrelInfo.url.get should be ("http://localhost:8008/files/testdata-1.0-beta.2.zip")
      }
      Get("/v2/update?platform=darwin&version=1.0-beta&userType=2") ~> route ~> check {
        val squirrelInfo = responseAs[PlatformVersionInfo]
        squirrelInfo.url.get should be ("http://localhost:8008/files/testdata-1.0-beta.2.zip")
      }
      Get("/v2/update?platform=darwin&version=1.0-beta.2&userType=0") ~> route ~> check {
        status should be (NoContent)
      }
    }
  }

}
