package org.extendedmind.test

import java.io.PrintWriter
import java.util.UUID
import org.extendedmind.bl.SecurityActions
import org.extendedmind.bl.ItemActions
import org.extendedmind.db.GraphDatabase
import org.extendedmind.domain.UserWrapper
import org.extendedmind.security.SecurityContext
import org.extendedmind.test.TestGraphDatabase.TIMO_EMAIL
import org.extendedmind.test.TestGraphDatabase.TIMO_PASSWORD
import org.mockito.Mockito.reset
import org.mockito.Mockito.stub
import org.mockito.Mockito.verify
import scaldi.Module
import spray.http.BasicHttpCredentials
import spray.http.HttpHeaders.Authorization
import org.zeroturnaround.zip.ZipUtil
import java.io.File
import org.zeroturnaround.zip.FileUtil
import org.apache.commons.io.FileUtils
import org.extendedmind.security.ExtendedMindUserPassAuthenticator
import org.extendedmind.security.ExtendedMindUserPassAuthenticatorImpl
import org.extendedmind.security.Token
import org.extendedmind.domain.Item
import org.extendedmind.domain.ItemWrapper
import org.extendedmind.api.JsonImplicits._
import spray.httpx.SprayJsonSupport._
import spray.httpx.marshalling._

/**
 * Class that is used to generate .json filesDuration from the
 * service layer and also to zip the test database.
 */
class TestDataGeneratorSpec extends SpraySpecBase{
  
  val TEST_DATA_STORE = "target/neo4j-test-database"
  val TEST_DATA_DESTINATION = "target/test-classes"
  
  // Mock out all action classes to use only the Service class for output
  val mockItemActions = mock[ItemActions]
  val mockGraphDatabase = mock[GraphDatabase]

  object TestDataGeneratorConfiguration extends Module{
    bind [GraphDatabase] to mockGraphDatabase
    bind [ItemActions] to mockItemActions
  }
  
  def configurations = TestDataGeneratorConfiguration 
  
  // Create test database  
  val db = new TestEmbeddedGraphDatabase(TEST_DATA_STORE)
    
  // Reset mocks after each test to be able to use verify after each test
  after{
    reset(mockItemActions)
    reset(mockGraphDatabase)
  }
  
  describe("Test data generator"){
    it("should return a list of available commands at root"){
      Get() ~> emRoute ~> check { entityAs[String] should include("is running") }
    }
    
    it("should generate token response on /authenticate"){
      stubTimoAuthenticate()
      Post("/authenticate") ~> addHeader(Authorization(BasicHttpCredentials(TIMO_EMAIL, TIMO_PASSWORD))) ~> emRoute ~> check { 
        val authenticateResponse = entityAs[String]
        writeJsonOutput("authenticateResponse", authenticateResponse)
        authenticateResponse should include("token")
      }
      verify(mockGraphDatabase).generateToken(TIMO_EMAIL, TIMO_PASSWORD, None)
    }
    
    it ("should generate item list response on /[userUUID]/items"){
      val securityContext = stubTimoAuthenticate()
      stub(itemActions.getItems(securityContext.userUUID)).toReturn(
        List(ItemWrapper(UUID.randomUUID(), "book flight", None, None, None),
             ItemWrapper(UUID.randomUUID(), "buy tickets", Some("TASK"), Some("2013-09-01"), None),
             ItemWrapper(UUID.randomUUID(), "notes on productivity", Some("NOTE"), None, None)))
      Get("/" + securityContext.userUUID + "/items") ~> addHeader(Authorization(BasicHttpCredentials("token", securityContext.token.get))) ~> emRoute ~> check { 
        val itemsResponse = entityAs[String]
        writeJsonOutput("itemsResponse", itemsResponse)
        itemsResponse should include("book flight")
      }
    }
    
    it ("should generate uuid response on put to /[userUUID]/item"){
      val securityContext = stubTimoAuthenticate()
      val newItem = Item(None, "remember the milk", None, None, None)
      stub(itemActions.putItem(securityContext.userUUID, newItem, None)).toReturn(UUID.randomUUID().toString())
      Put("/" + securityContext.userUUID + "/item",
          marshal(newItem).right.get
          ) ~> addHeader("Content-Type", "application/json") ~> addHeader(Authorization(BasicHttpCredentials("token", securityContext.token.get))) ~> emRoute ~> check { 
        val putItemResponse = entityAs[String]
        writeJsonOutput("putItemResponse", putItemResponse)
        putItemResponse should include("-")
      }
    }
  }

  describe("Embedded Graph Database"){
    it("should initialize with test data"){
      db.insertTestUsers
      db.shutdown(db.ds)
      packNeo4jStore  
    }
  }
  
  def stubTimoAuthenticate(): SecurityContext = {
    val uuid = UUID.randomUUID()
    val token = Token.encryptToken(Token(uuid))
    val securityContext = SecurityContext(uuid, TIMO_EMAIL, UserWrapper.ADMIN, Some(token), None)
    stub(mockGraphDatabase.generateToken(TIMO_EMAIL, TIMO_PASSWORD, None)).toReturn(
          Some(securityContext))
    stub(mockGraphDatabase.authenticate(token)).toReturn(
          Some(securityContext))
    securityContext
  }
  
  // Helper file writer
  def writeJsonOutput(filename: String, contents: String): Unit = {
    Some(new PrintWriter(TEST_DATA_DESTINATION + "/" + filename + ".json")).foreach{p => p.write(contents); p.close}
  }

  def packNeo4jStore(){
    val storeDir = new File(TEST_DATA_STORE)
    ZipUtil.pack(storeDir, new File(TEST_DATA_DESTINATION + "/neo4j-test.zip"))
    FileUtils.deleteDirectory(storeDir)
  }
}
