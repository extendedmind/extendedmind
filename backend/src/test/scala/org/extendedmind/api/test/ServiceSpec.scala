package org.extendedmind.api.test
import scaldi.Module
import org.mockito.Mockito._
import java.io.PrintWriter
import spray.testkit.ScalatestRouteTest
import org.extendedmind.api._
import org.extendedmind.domain._
import org.extendedmind.db._
import org.extendedmind._
import org.extendedmind.test._
import org.extendedmind.security._
import org.extendedmind.bl._
import org.extendedmind.test.TestGraphDatabase._
import org.extendedmind.api.JsonImplicits._
import spray.http.HttpHeaders.Authorization
import spray.http.BasicHttpCredentials
import java.util.UUID
import spray.httpx.SprayJsonSupport._
import spray.httpx.marshalling._

class ServiceSpec extends SpraySpecBase with ImpermanentGraphDatabaseSpecBase{

  // Mock out all action classes to use only the Service class for output
  val mockItemActions = mock[ItemActions]
  val mockGraphDatabase = mock[GraphDatabase]

  object ServiceTestConfiguration extends Module {
    bind[GraphDatabase] to mockGraphDatabase
    bind[ItemActions] to mockItemActions
  }

  override def configurations = ServiceTestConfiguration

  before{
    db.insertTestData()
  }
  
  after {
    cleanDb(db.ds.gds)
    // Reset mocks after each test to be able to use verify after each test
    reset(mockItemActions)
    reset(mockGraphDatabase)
  }

  describe("Service") {
    val currentTime = System.currentTimeMillis()

    it("should return a list of available commands at root") {
      Get() ~> emRoute ~> check { entityAs[String] should include("is running") }
    }

    it("should generate token response on /authenticate") {
      stubTimoAuthenticate()
      Post("/authenticate"
          ) ~> addHeader(Authorization(BasicHttpCredentials(TIMO_EMAIL, TIMO_PASSWORD))
          ) ~> emRoute ~> check {
        val authenticateResponse = entityAs[String]
        authenticateResponse should include("token")
      }
      verify(mockGraphDatabase).generateToken(TIMO_EMAIL, TIMO_PASSWORD, None)
    }

    it("should generate item list response on /[userUUID]/items") {
      val securityContext = stubTimoAuthenticate()
      stub(itemActions.getItems(securityContext.userUUID)).toReturn(
        Right(Items(Some(List(Item(Some(UUID.randomUUID()), Some(currentTime), "book flight", None),
          Item(Some(UUID.randomUUID()), Some(currentTime), "buy tickets", None),
          Item(Some(UUID.randomUUID()), Some(currentTime), "notes on productivity", None))), 
          None, None)))
      Get("/" + securityContext.userUUID + "/items"
          ) ~> addHeader(Authorization(BasicHttpCredentials("token", securityContext.token.get))
          ) ~> emRoute ~> check {
        val itemsResponse = entityAs[String]
        itemsResponse should include("book flight")
      }
    }

    it("should generate uuid response on existing item put to /[userUUID]/item/[itemUUID]") {
      val securityContext = stubTimoAuthenticate()
      val existingItemUUID = UUID.randomUUID()
      val existingItem = Item(None, None, "remember the milk", None)
      stub(itemActions.putExistingItem(securityContext.userUUID, existingItemUUID, existingItem))
            .toReturn(Right(new SetResult(None, System.currentTimeMillis())))
      Put("/" + securityContext.userUUID + "/item/" + existingItemUUID,
        marshal(existingItem).right.get
            ) ~> addHeader("Content-Type", "application/json"
            ) ~> addHeader(Authorization(BasicHttpCredentials("token", securityContext.token.get))
            ) ~> emRoute ~> check {
          val putExistingItemResponse = entityAs[String]
          putExistingItemResponse should include("modified")
        }
    }
    
    it("should generate uuid response on new item put to /[userUUID]/item") {
      val securityContext = stubTimoAuthenticate()
      val newItem = Item(None, None, "remember the milk", None)
      stub(itemActions.putNewItem(securityContext.userUUID, newItem))
            .toReturn(Right(new SetResult(Some(UUID.randomUUID()), System.currentTimeMillis())))
      Put("/" + securityContext.userUUID + "/item",
        marshal(newItem).right.get
            ) ~> addHeader("Content-Type", "application/json"
            ) ~> addHeader(Authorization(BasicHttpCredentials("token", securityContext.token.get))
            ) ~> emRoute ~> check {
          val putItemResponse = entityAs[String]
          putItemResponse should include("uuid")
        }
    }
  }

  def stubTimoAuthenticate(): SecurityContext = {
    val uuid = UUID.randomUUID()
    val token = Token.encryptToken(Token(uuid))
    val securityContext = SecurityContext(uuid, TIMO_EMAIL, Token.ADMIN, Some(token), None)
    stub(mockGraphDatabase.generateToken(TIMO_EMAIL, TIMO_PASSWORD, None)).toReturn(
      Right(securityContext))
    stub(mockGraphDatabase.authenticate(token)).toReturn(
      Right(securityContext))
    securityContext
  }
  
}