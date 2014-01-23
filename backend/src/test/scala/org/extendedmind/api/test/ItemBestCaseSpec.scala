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
 * Best case test for item routes. Also generates .json files.
 */
class ItemBestCaseSpec extends ServiceSpecBase {

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

  describe("In the best case, ItemService") {
    it("should generate item list response on /[userUUID]/items") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      Get("/" + authenticateResponse.userUUID + "/items") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = entityAs[Items]
        writeJsonOutput("itemsResponse", entityAs[String])
        itemsResponse.items should not be None
        itemsResponse.tasks should not be None
        itemsResponse.tasks.get.length should equal(8)
        itemsResponse.notes should not be None
      }
    }
    it("should successfully put new item on PUT to /[userUUID]/item "
      + "update it with PUT to /[userUUID]/item/[itemUUID] "
      + "and get it back with GET to /[userUUID]/item/[itemUUID] "
      + "and delete it with DELETE to /[userUUID]/item/[itemUUID] "
      + "and undelete it with POST to /[userUUID]/item/[itemUUID]") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newItem = Item(None, None, None, "learn how to fly", None)
      Put("/" + authenticateResponse.userUUID + "/item",
        marshal(newItem).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val putItemResponse = entityAs[SetResult]
          writeJsonOutput("putItemResponse", entityAs[String])
          putItemResponse.modified should not be None
          putItemResponse.uuid should not be None

          val updatedItem = Item(None, None, None, "learn how to fly", Some("not kidding"))
          Put("/" + authenticateResponse.userUUID + "/item/" + putItemResponse.uuid.get,
            marshal(updatedItem).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
              val putExistingItemResponse = entityAs[String]
              writeJsonOutput("putExistingItemResponse", putExistingItemResponse)
              putExistingItemResponse should include("modified")
              putExistingItemResponse should not include ("uuid")
              Get("/" + authenticateResponse.userUUID + "/item/" + putItemResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                val itemResponse = entityAs[Item]
                writeJsonOutput("itemResponse", entityAs[String])
                itemResponse.description.get should be("not kidding")
                Delete("/" + authenticateResponse.userUUID + "/item/" + putItemResponse.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                  val deleteItemResponse = entityAs[String]
                  writeJsonOutput("deleteItemResponse", deleteItemResponse)
                  deleteItemResponse should include("deleted")
                  Get("/" + authenticateResponse.userUUID + "/item/" + putItemResponse.uuid.get) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val failure = entityAs[String]
                    // TODO: Fix bug with Internal Server Error!
                    failure should include("error")
                  }
                  Post("/" + authenticateResponse.userUUID + "/item/" + putItemResponse.uuid.get + "/undelete") ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
                    val undeleteItemResponse = entityAs[String]
                    writeJsonOutput("undeleteItemResponse", undeleteItemResponse)
                    undeleteItemResponse should include("modified")
                    val undeletedItem = getItem(putItemResponse.uuid.get, authenticateResponse)
                    undeletedItem.deleted should be(None)
                    undeletedItem.modified should not be (None)
                  }
                }
              }
            }
        }
    }
    it("should delete items, notes and tasks and generate shorter item list response on /[userUUID]/items ") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)

      Get("/" + authenticateResponse.userUUID + "/items") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val itemsResponse = entityAs[Items]
        writeJsonOutput("itemsResponse", entityAs[String])
        itemsResponse.items should not be None
        itemsResponse.tasks should not be None
        itemsResponse.tasks.get.length should equal(8)
        itemsResponse.notes should not be None

        val numberOfItems = itemsResponse.items.get.length
        val numberOfTasks = itemsResponse.tasks.get.length
        val numberOfNotes = itemsResponse.notes.get.length
        val deletedItem = itemsResponse.items.get(0)
        val deletedTask = itemsResponse.tasks.get(0)
        val deletedNote = itemsResponse.notes.get(1)
        Delete("/" + authenticateResponse.userUUID + "/item/" + deletedItem.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          entityAs[String] should include("deleted")
        }
        Delete("/" + authenticateResponse.userUUID + "/task/" + deletedTask.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          entityAs[String] should include("deleted")
        }
        Delete("/" + authenticateResponse.userUUID + "/note/" + deletedNote.uuid.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          entityAs[String] should include("deleted")
        }
        Get("/" + authenticateResponse.userUUID + "/items") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          val shorterItemsResponse = entityAs[Items]
          shorterItemsResponse.items.get.length should be(numberOfItems - 1)
          shorterItemsResponse.tasks.get.length should be(numberOfTasks - 1)
          shorterItemsResponse.notes.get.length should be(numberOfNotes - 1)

        }
      }
    }
  }
}
