package org.extendedmind.test

import java.io.PrintWriter
import java.util.UUID
import org.extendedmind.bl.SecurityActions
import org.extendedmind.bl.UserActions
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

/**
 * Class that is used to generate .json filesDuration from the
 * service layer and also to zip the test database.
 */
class TestDataGeneratorSpec extends SpraySpecBase{
  
  val TEST_DATA_STORE = "/tmp/neo4j-test"
  val TEST_DATA_DESTINATION = "target/test-classes"
  
  // Mock out all action classes to use only the Service class for output
  val mockUserActions = mock[UserActions]
  val mockSecurityActions = mock[SecurityActions]
  val mockGraphDatabase = mock[GraphDatabase]

  object TestDataGeneratorConfiguration extends Module{
    bind [GraphDatabase] to mockGraphDatabase
    bind [UserActions] to mockUserActions
    bind [SecurityActions] to mockSecurityActions
  }
  
  def configurations = TestDataGeneratorConfiguration 
  
  // Create test database  
  val db = new TestEmbeddedGraphDatabase(TEST_DATA_STORE)
  
  // Reset mocks after each test to be able to use verify after each test
  after{
    reset(mockUserActions)
    reset(mockSecurityActions)
    reset(mockGraphDatabase)
  }

  describe("Extended Mind Service"){
    it("should return a list of available commands at root"){
      Get() ~> emRoute ~> check { entityAs[String] should include("is running") }
    }
    it("should return a list of users at /users"){
      val users = List(UserWrapper(UUID.randomUUID(), TIMO_EMAIL), UserWrapper(UUID.randomUUID(), "jp@ext.md"))
      stub(mockUserActions.getUsers()).toReturn(users);
      Get("/users") ~> emRoute ~> check { 
        val getUsersResponse = entityAs[String]
        writeJsonOutput("getUsersResponse", getUsersResponse)
        getUsersResponse should include("timo@ext.md")
      }
      verify(mockUserActions).getUsers()
    }
    
    it("should return token on /authenticate"){
      stubTimoAuthenticate()
      stub(mockSecurityActions.generateToken(TIMO_EMAIL)).toReturn("12345");
      Post("/authenticate") ~> addHeader(Authorization(BasicHttpCredentials(TIMO_EMAIL, TIMO_PASSWORD))) ~> emRoute ~> check { 
        val authenticateResponse = entityAs[String]
        writeJsonOutput("authenticateResponse", authenticateResponse)
        authenticateResponse should include("12345")
      }
      verify(mockSecurityActions).generateToken(TIMO_EMAIL)
    }
  }

  describe("Embedded Graph Database"){
    it("should initialize with test data"){
      db.insertTestUsers
      db.shutdown(db.ds)
      packNeo4jStore
      
    }
  }
  
  def stubTimoAuthenticate(){
      stub(mockGraphDatabase.authenticate(TIMO_EMAIL, TIMO_PASSWORD)).toReturn(
          Some(
            SecurityContext(UUID.randomUUID(), TIMO_EMAIL, UserWrapper.ADMIN, None)))
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