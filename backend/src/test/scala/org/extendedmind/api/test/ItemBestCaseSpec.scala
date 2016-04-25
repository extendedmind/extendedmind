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
import scala.collection.mutable.ListBuffer

/**
 * Best case test for item routes. Also generates .json files.
 */
class ItemBestCaseSpec extends ServiceSpecBase {

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

  describe("In the best case, ItemService") {
    it("should generate item list response on /[userUUID]/items") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Get("/" + authenticateResponse.userUUID + "/items?completed=true") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = responseAs[Items]
        writeJsonOutput("itemsResponse", responseAs[String])
        itemsResponse.items should not be None
        itemsResponse.tasks should not be None
        itemsResponse.tasks.get.length should equal(7)
        itemsResponse.notes should not be None
        itemsResponse.notes.get.find(note => note.revision.isDefined) should not be(None)
        itemsResponse.lists should not be None
        itemsResponse.lists.get.find(
            list=>list.visibility.isDefined &&
            list.visibility.get.agreements.isDefined &&
            list.visibility.get.agreements.get(0).proposedTo.get.email.get == LAURI_EMAIL) should not be (None)

        // Make sure common collective values are found in tagsOnly response
        val commonCollectiveUUID = authenticateResponse.collectives.get.find(value => {
          value._2._3
        }).get._1

        Get("/" + commonCollectiveUUID + "/items?tagsOnly=true") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val tagsOnlyItemsResponse = responseAs[Items]
          writeJsonOutput("tagsOnlyItemsResponse", responseAs[String])
          tagsOnlyItemsResponse.items should be (None)
          tagsOnlyItemsResponse.tasks should be (None)
          tagsOnlyItemsResponse.notes should be (None)
          tagsOnlyItemsResponse.lists should be (None)
          tagsOnlyItemsResponse.tags should not be None

          val commonCollectiveTagUUIDs = new ListBuffer[UUID]
          itemsResponse.tasks.get.foreach(task => {
            if (task.relationships.isDefined && task.relationships.get.collectiveTags.isDefined){
              task.relationships.get.collectiveTags.get.foreach(colTags => {
                if (colTags._1 == commonCollectiveUUID){
                  colTags._2.foreach(commonCollectiveTagUUID => {
                    if (!commonCollectiveTagUUIDs.contains(commonCollectiveTagUUID))
                      commonCollectiveTagUUIDs.append(commonCollectiveTagUUID)
                  })
                }
              })
            }
          })
          itemsResponse.notes.get.foreach(note => {
            if (note.relationships.isDefined && note.relationships.get.collectiveTags.isDefined){
              note.relationships.get.collectiveTags.get.foreach(colTags => {
                if (colTags._1 == commonCollectiveUUID){
                  colTags._2.foreach(commonCollectiveTagUUID => {
                    if (!commonCollectiveTagUUIDs.contains(commonCollectiveTagUUID))
                      commonCollectiveTagUUIDs.append(commonCollectiveTagUUID)
                  })
                }
              })
            }
          })
          commonCollectiveTagUUIDs.size should not be(0)
          commonCollectiveTagUUIDs.foreach(commonCollectiveTagUUID=>{
            tagsOnlyItemsResponse.tags.get.find(tag => {
              tag.uuid.get == commonCollectiveTagUUID
            }) should not be(None)
          })
        }
      }
      Post("/authenticate") ~> addHeader(Authorization(BasicHttpCredentials(LAURI_EMAIL, LAURI_PASSWORD))) ~> route ~> check {
        val lauriAuthenticateResponse = responseAs[SecurityContext]
        writeJsonOutput("sharedToAuthenticateResponse", responseAs[String])
        Get("/" + authenticateResponse.userUUID + "/items") ~> addCredentials(BasicHttpCredentials("token", lauriAuthenticateResponse.token.get)) ~> route ~> check {
          val sharedItemsResponse = responseAs[Items]
          writeJsonOutput("sharedItemsResponse", responseAs[String])
        }
      }
    }
    it("should generate limited item list response on /[userUUID]/items to foreign user") {
      val authenticateResponse = emailPasswordAuthenticate(LAURI_EMAIL, LAURI_PASSWORD)
      Get("/" + authenticateResponse.sharedLists.get.last._1 + "/items") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = responseAs[Items]
        writeJsonOutput("limitedItemsResponse", responseAs[String])
        itemsResponse.items should be (None)
        itemsResponse.tasks should not be None
        itemsResponse.tasks.get.length should equal(3)
        itemsResponse.notes should be (None)
        itemsResponse.lists should not be None
        itemsResponse.lists.get.length should equal(1)
        itemsResponse.lists.get(0).visibility.get.agreements.get(0).proposedBy.get.email.get should be (TIMO_EMAIL)
       }
    }
    it("should successfully put new item on PUT to /[userUUID]/item "
      + "update it with PUT to /[userUUID]/item/[itemUUID] "
      + "and get it back with GET to /[userUUID]/item/[itemUUID] "
      + "and delete it with DELETE to /[userUUID]/item/[itemUUID] "
      + "and undelete it with POST to /[userUUID]/item/[itemUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newItem = Item("learn how to fly", None, None).copy(ui = Some("testUI"))
      Put("/" + authenticateResponse.userUUID + "/item",
        marshal(newItem).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val putItemResponse = responseAs[SetResult]
          writeJsonOutput("putItemResponse", responseAs[String])
          putItemResponse.modified should not be None
          putItemResponse.uuid should not be None

          val updatedItem = Item("learn how to fly", Some("not kidding"), None).copy(ui = Some("testUI"))
          Put("/" + authenticateResponse.userUUID + "/item/" + putItemResponse.uuid.get,
            marshal(updatedItem).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
              val putExistingItemResponse = responseAs[String]
              writeJsonOutput("putExistingItemResponse", putExistingItemResponse)
              putExistingItemResponse should include("modified")
              putExistingItemResponse should not include ("uuid")
              Get("/" + authenticateResponse.userUUID + "/item/" + putItemResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                val itemResponse = responseAs[Item]
                writeJsonOutput("itemResponse", responseAs[String])
                itemResponse.description.get should be("not kidding")
                itemResponse.ui.get should be("testUI")
                Delete("/" + authenticateResponse.userUUID + "/item/" + putItemResponse.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                  val deleteItemResponse = responseAs[DeleteItemResult]
                  writeJsonOutput("deleteItemResponse", responseAs[String])
                  Get("/" + authenticateResponse.userUUID + "/item/" + putItemResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val failure = responseAs[ErrorResult]
                    status should be (BadRequest)
                    failure.description should startWith("Item " + putItemResponse.uuid.get + " is deleted")
                  }
                  // Deleting again should return the same deleted and modified values
                  Delete("/" + authenticateResponse.userUUID + "/item/" + putItemResponse.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val redeleteItemResponse = responseAs[DeleteItemResult]
                    redeleteItemResponse.deleted should be (deleteItemResponse.deleted)
                    redeleteItemResponse.result.modified should be (deleteItemResponse.result.modified)
                  }
                  Post("/" + authenticateResponse.userUUID + "/item/" + putItemResponse.uuid.get + "/undelete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val undeleteItemResponse = responseAs[SetResult]
                    writeJsonOutput("undeleteItemResponse", responseAs[String])
                    val undeletedItem = getItem(putItemResponse.uuid.get, authenticateResponse)
                    undeletedItem.deleted should be(None)
                    undeletedItem.modified should not be (None)

                    // Re-undelete should also work
                    Post("/" + authenticateResponse.userUUID + "/item/" + putItemResponse.uuid.get + "/undelete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                      val reundeleteItemResponse = responseAs[SetResult]
                      reundeleteItemResponse.modified should be (undeleteItemResponse.modified)
                    }
                  }
                }
              }
            }
        }
    }
    it("should delete items, notes and tasks and generate shorter item list response on /[userUUID]/items ") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)

      Get("/" + authenticateResponse.userUUID + "/items") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = responseAs[Items]
        itemsResponse.items should not be None
        itemsResponse.tasks should not be None
        itemsResponse.tasks.get.length should equal(6)
        itemsResponse.notes should not be None

        val numberOfItems = itemsResponse.items.get.length
        val numberOfTasks = itemsResponse.tasks.get.length
        val numberOfNotes = itemsResponse.notes.get.length
        val deletedItem = itemsResponse.items.get(0)
        val deletedTask = itemsResponse.tasks.get(0)
        val deletedNote = itemsResponse.notes.get(1)
        Delete("/" + authenticateResponse.userUUID + "/item/" + deletedItem.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          responseAs[String] should include("deleted")
        }
        Delete("/" + authenticateResponse.userUUID + "/task/" + deletedTask.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          responseAs[String] should include("deleted")
        }
        Delete("/" + authenticateResponse.userUUID + "/note/" + deletedNote.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          responseAs[String] should include("deleted")
        }
        Get("/" + authenticateResponse.userUUID + "/items") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val shorterItemsResponse = responseAs[Items]
          shorterItemsResponse.items.get.length should be(numberOfItems - 1)
          shorterItemsResponse.tasks.get.length should be(numberOfTasks - 1)
          shorterItemsResponse.notes.get.length should be(numberOfNotes - 1)

        }
      }
    }
    it("should generate filter responses using get parameters for /[userUUID]/items") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      // When active is set to false, should return empty list
      Get("/" + authenticateResponse.userUUID + "/items" + "?active=false") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = responseAs[Items]
        isEmptyItems(itemsResponse) should be (true)
      }
      // When active is set to false and completed to true, should return list of one
      Get("/" + authenticateResponse.userUUID + "/items" + "?active=false&completed=true") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = responseAs[Items]
        itemsResponse.items should be (None)
        itemsResponse.tasks.get.length should be (1)
        itemsResponse.notes should be (None)
        itemsResponse.lists should be (None)
        itemsResponse.tags should be (None)
      }
      // When searching for items that have been modified after now, should return empty list
      Get("/" + authenticateResponse.userUUID + "/items" + "?modified=" + System.currentTimeMillis) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = responseAs[Items]
        isEmptyItems(itemsResponse) should be (true)
      }
      // When searching for items that have been modified after the epoch, should return equal list as normal query
      Get("/" + authenticateResponse.userUUID + "/items" + "?modified=0") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = responseAs[Items]
        Get("/" + authenticateResponse.userUUID + "/items") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val equalItemsResponse = responseAs[Items]
          equalItemsResponse.items.get.length should be (itemsResponse.items.get.length)
          equalItemsResponse.tasks.get.length should be (itemsResponse.tasks.get.length)
          equalItemsResponse.notes.get.length should be (itemsResponse.notes.get.length)
          equalItemsResponse.lists.get.length should be (itemsResponse.lists.get.length)
          equalItemsResponse.tags.get.length should be (itemsResponse.tags.get.length)
        }
      }
      // Put a couple of new items
      val testResponse = putNewItem(Item("test", None, None), authenticateResponse)
      val test2Response = putNewItem(Item("test2", None, None), authenticateResponse)

      // Check that getting with the modified value of first we get only the second
      Get("/" + authenticateResponse.userUUID + "/items" + "?modified=" + testResponse.modified) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = responseAs[Items]
        itemsResponse.items.get.length should be (1)
        itemsResponse.tasks should be (None)
        itemsResponse.notes should be (None)
        itemsResponse.lists should be (None)
        itemsResponse.tags should be (None)
      }
      // Check that it succeeds again
      Get("/" + authenticateResponse.userUUID + "/items" + "?modified=" + testResponse.modified) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = responseAs[Items]
        itemsResponse.items.get.length should be (1)
      }
      // Check that getting with the modified value of second we get an empty list
      Get("/" + authenticateResponse.userUUID + "/items" + "?modified=" + test2Response.modified) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = responseAs[Items]
        isEmptyItems(itemsResponse) should be (true)
      }

      // Check that deleting the second, we get it back with deleted query
      Delete("/" + authenticateResponse.userUUID + "/item/" + test2Response.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val deleteResponse = responseAs[DeleteItemResult]
        deleteResponse.deleted should not be None
      }
      // Check that getting with the modified value of second we get the deleted item
      Get("/" + authenticateResponse.userUUID + "/items" + "?modified=" + test2Response.modified + "&deleted=true") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = responseAs[Items]
        itemsResponse.items.get.length should be (1)
        itemsResponse.items.get(0).deleted should not be None
      }
      // Check that we can get it again with the same modified value
      Get("/" + authenticateResponse.userUUID + "/items" + "?modified=" + test2Response.modified + "&deleted=true") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = responseAs[Items]
        itemsResponse.items.get.length should be (1)
        itemsResponse.items.get(0).deleted should not be None
      }
    }
  }
}
