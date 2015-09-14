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

/**
 * Best case test for admin routes. Also generates .json files.
 */
class AdminBestCaseSpec extends ServiceSpecBase {

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

  describe("In the best case, AdminService") {
    it("should successfully create new collective with PUT to /collective"
      + "update it with PUT to /collective/[collectiveUUID] "
      + "and get it back with GET to /collective/[collectiveUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val testCollective = Collective("Test", None, None, None)
      Put("/collective",
        marshal(testCollective).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          writeJsonOutput("putCollectiveResponse", responseAs[String])
          val putCollectiveResponse = responseAs[SetResult]
          putCollectiveResponse.uuid should not be None
          putCollectiveResponse.modified should not be None

          // Authenticating again should have the new collective
          val reauthenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
          reauthenticateResponse.collectives should not be None
          reauthenticateResponse.collectives.get.get(putCollectiveResponse.uuid.get).get._1 should equal(testCollective.title)
          reauthenticateResponse.collectives.get.get(putCollectiveResponse.uuid.get).get._2 should equal(0)
          reauthenticateResponse.collectives.get.get(putCollectiveResponse.uuid.get).get._3 should equal(false)

          // Update collective
          Put("/collective/" + putCollectiveResponse.uuid.get,
            marshal(testCollective.copy(description = Some("test description"))).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", reauthenticateResponse.token.get)) ~> route ~> check {
              writeJsonOutput("putExistingCollectiveResponse", responseAs[String])
              val putExistingCollectiveResponse = responseAs[SetResult]
              putExistingCollectiveResponse.uuid should be(None)
              assert(putExistingCollectiveResponse.modified > putCollectiveResponse.modified)
              // Get it back
              Get("/collective/" + putCollectiveResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", reauthenticateResponse.token.get)) ~> route ~> check {
                val collectiveResponse = responseAs[Collective]
                writeJsonOutput("collectiveResponse", responseAs[String])
                collectiveResponse.description.get should be("test description")
                collectiveResponse.inboxId should not be None
                // Should be possible to assign read/write access to new collective
                val lauriAuthenticateResponse = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
                lauriAuthenticateResponse.collectives.get.get(putCollectiveResponse.uuid.get) should equal(None)

                Post("/collective/" + putCollectiveResponse.uuid.get + "/user/" + getUserUUID(LAURI_EMAIL, reauthenticateResponse),
                  marshal(UserAccessRight(Some(2))).right.get) ~> addCredentials(BasicHttpCredentials("token", reauthenticateResponse.token.get)) ~> route ~> check {
                    val postCollectiveUserPermissionResponse = responseAs[SetResult]
                    writeJsonOutput("postCollectiveUserPermissionResponse", responseAs[String])
                    assert(postCollectiveUserPermissionResponse.modified > putExistingCollectiveResponse.modified)
                    val lauriReauthenticateResponse = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
                    lauriReauthenticateResponse.collectives.get.get(putCollectiveResponse.uuid.get).get._2 should equal(2)
                  }
              }
            }
        }
    }
    it("should successfully get user with GET /user?email=[email]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Get("/user?email=" + LAURI_EMAIL) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        writeJsonOutput("userResponse", responseAs[String])
        val publicUser = responseAs[PublicUser]
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
      Get("/" + emtUUID + "/items") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = responseAs[Items]
        writeJsonOutput("collectiveItemsResponse", responseAs[String])
        itemsResponse.items should not be None
        itemsResponse.tasks should not be None
        itemsResponse.tasks.get.length should equal(1)
        itemsResponse.notes should not be None
      }
      val newTask = Task("change border colour to lighter gray", None, None, None, None, None, None)
      val putTaskResponse = putNewTask(newTask, authenticateResponse, Some(emtUUID))
      val putExistingTaskResponse = putExistingTask(newTask.copy(description = Some("e.g. #EDEDED")),
        putTaskResponse.uuid.get, authenticateResponse, Some(emtUUID))
      assert(putExistingTaskResponse.modified > putTaskResponse.modified)

      val updatedTask = getTask(putTaskResponse.uuid.get, authenticateResponse, Some(emtUUID))
      updatedTask.description should not be None
    }
    it("should successfully change user type with POST to /user/UUID/type/INT") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Get("/user?email=" + INFO_EMAIL) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val infoUser = responseAs[PublicUser]
        Post("/admin/user/" + infoUser.uuid + "/type/" + Token.ALFA) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          writeJsonOutput("changeUserTypeResponse", responseAs[String])
          val changeUserTypeResponse = responseAs[SetResult]
          changeUserTypeResponse.modified should not be None
          val infoAuthenticateResponse = emailPasswordAuthenticate(INFO_EMAIL, INFO_PASSWORD)
          infoAuthenticateResponse.userType should equal(Token.ALFA)

          // Also verify that account works
          Get("/account") ~> addCredentials(BasicHttpCredentials("token", infoAuthenticateResponse.token.get)) ~> route ~> check {
            val userResponse = responseAs[User]
          }

          Post("/admin/user/" + infoUser.uuid + "/type/" + Token.NORMAL) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
            val infoReAuthenticateResponse = emailPasswordAuthenticate(INFO_EMAIL, INFO_PASSWORD)
            infoReAuthenticateResponse.userType should equal(Token.NORMAL)

            // Also verify that account works
            Get("/account") ~> addCredentials(BasicHttpCredentials("token", infoAuthenticateResponse.token.get)) ~> route ~> check {
              val userReResponse = responseAs[User]
            }
          }
        }
      }
    }
    it("should successfully reset tokens with POST to /admin/tokens/reset, " +
      "rebuild user indexes with POST to /admin/users/rebuild, " +
      "and rebuild item indexes with POST to /admin/[userUUID]/items/rebuild") {
      Post("/admin/tokens/reset") ~> addCredentials(BasicHttpCredentials("token", emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD).token.get)) ~> route ~> check {
        writeJsonOutput("tokensResetResponse", responseAs[String])
        val countResult = responseAs[CountResult]
        countResult.count should be(6)
      }
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Post("/admin/users/rebuild") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        writeJsonOutput("usersRebuildResponse", responseAs[String])
        val countResult = responseAs[CountResult]
        countResult.count should be(3)
      }
      Post("/admin/user/" + authenticateResponse.userUUID + "/items/rebuild") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        writeJsonOutput("itemsRebuildResponse", responseAs[String])
        val countResult = responseAs[CountResult]
        countResult.count should be(23)
      }
    }
    it("should successfully get statistics with GET to /admin") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Get("/admin") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val statistics = responseAs[Statistics]
        writeJsonOutput("statisticsResponse", responseAs[String])
      }
    }
    it("should successfully get users with GET to /admin/users") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Get("/admin/users") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val users = responseAs[Users]
        writeJsonOutput("usersResponse", responseAs[String])
      }
    }
    it("should successfully upgrade owners with POST to /admin/owners/upgrade") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Post("/admin/owners/upgrade") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val upgradeCount = responseAs[CountResult]
        upgradeCount.count should be(0)
      }
    }
    it("should successfully delete a user with DELETE to /admin/user/[userUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Get("/admin/users") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val users = responseAs[Users]
        val lauriUser = users.users.filter(user => if (user.email.get == LAURI_EMAIL) true else false)(0)
        Delete("/admin/user/" + lauriUser.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          writeJsonOutput("deleteUserResponse", responseAs[String])
          val deleteUserResponse = responseAs[DestroyResult]
          deleteUserResponse.destroyed(0) should be (lauriUser.uuid.get)
          Get("/admin/users") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
            responseAs[Users].users.filter(user => if (user.email.get == LAURI_EMAIL) true else false).size should be(0)
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
    it("should successfully get foreign item statistics with GET to /admin/item/[itemUUID] " +
       "and change and remove single Long and String properties with POST to /admin/item/[userUUID]/property") {
      val timoAuthenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val lauriAuthenticateResponse = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
      Get("/" + lauriAuthenticateResponse.userUUID + "/items?completed=true") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = responseAs[Items]
        itemsResponse.tasks.get.length should be(1)
        val itemUUID = itemsResponse.tasks.get(0).uuid.get
        val completed = itemsResponse.tasks.get(0).completed.get
        val title = itemsResponse.tasks.get(0).title
        Get("/admin/item/" + itemUUID) ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
          val statisticsResponse = responseAs[NodeStatistics]
          writeJsonOutput("itemStatisticsResponse", responseAs[String])
          // Change two values and remove one property
          val newCompleted = System.currentTimeMillis
          Post("/admin/item/" + itemUUID + "/property",
              marshal(NodeProperty("completed", None, Some(newCompleted))).right.get) ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
            val setResult = responseAs[SetResult]
          }
          val newTitle = "updated"
          Post("/admin/item/" + itemUUID + "/property",
              marshal(NodeProperty("title", Some(newTitle), None)).right.get) ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
            val setResult = responseAs[SetResult]
          }
          Post("/admin/item/" + itemUUID + "/property",
              marshal(NodeProperty("description", None, None)).right.get) ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
            val setResult = responseAs[SetResult]
          }
          Get("/" + lauriAuthenticateResponse.userUUID + "/items?completed=true") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
            val changedTask = responseAs[Items].tasks.get(0)
            changedTask.completed.get should be(newCompleted)
            changedTask.title should be(newTitle)
            changedTask.description should be(None)
          }
        }
      }
    }
    it("should successfully get owner statistics with GET to /admin/owner/[ownerUUID]") {
      val timoAuthenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val lauriAuthenticateResponse = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
      Get("/admin/owner/" + lauriAuthenticateResponse.userUUID.toString) ~> addCredentials(BasicHttpCredentials("token", timoAuthenticateResponse.token.get)) ~> route ~> check {
        val statisticsResponse = responseAs[NodeStatistics]
        writeJsonOutput("ownerStatisticsResponse", responseAs[String])
      }
    }
    it("should successfully put info with PUT to /admin/info " +
       "and get it back without authentication from GET to /info") {
      Get("/info") ~> route ~> check {
        val info = responseAs[Info]
        info.backend should not be(None)
        info.frontend should be (None)
      }
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Put("/admin/info",
          marshal(Info(None, Some(scala.List(VersionInfo("osx", "2.0"))))).right.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get))  ~> route ~> check {
        val setResult = responseAs[Info]
        Get("/info") ~> route ~> check {
          val info = responseAs[Info]
          info.backend should not be(None)
          info.frontend.get.size should be (1)
          info.frontend.get(0).platform should be("osx")
          info.frontend.get(0).version should be("2.0")
          Put("/admin/info",
              marshal(Info(None, Some(scala.List(VersionInfo("win", "1.0"))))).right.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get))  ~> route ~> check {
            val setResult2 = responseAs[Info]
            Get("/info") ~> route ~> check {
              val info2 = responseAs[Info]
              info2.backend should not be(None)
              info2.frontend.get.size should be (1)
              info2.frontend.get(0).platform should be("win")
              info2.frontend.get(0).version should be("1.0")
              Put("/admin/info",
                  marshal(Info(None, None)).right.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                Get("/info") ~> route ~> check {
                  val info3 = responseAs[Info]
                  info3.backend should not be(None)
                  info3.frontend should be (None)
                }
              }
            }
          }
        }
      }
    }
  }

}
