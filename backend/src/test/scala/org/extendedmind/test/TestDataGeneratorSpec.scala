package org.extendedmind.test

import java.io.PrintWriter
import java.util.UUID
import org.extendedmind._
import org.extendedmind.bl._
import org.extendedmind.db._
import org.extendedmind.domain._
import org.extendedmind.security._
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
import org.extendedmind.api.JsonImplicits._
import spray.httpx.SprayJsonSupport._
import spray.httpx.marshalling._

/**
 * Class that is used to generate .json filesDuration from the
 * service layer and also to zip the test database.
 */
class TestDataGeneratorSpec extends SpraySpecBase {

  val TEST_DATA_STORE = "target/neo4j-test-database"

  // Create test database  
  val db = new TestEmbeddedGraphDatabase(TEST_DATA_STORE)
    
  object TestDataGeneratorConfiguration extends Module{
    bind [GraphDatabase] to db
  }
  override def configurations = TestDataGeneratorConfiguration
    
  describe("Embedded Graph Database") {
    it("should initialize with test data") {
      db.insertTestData(Some(db.TEST_DATA_DESTINATION))
      db.shutdown(db.ds)
      packNeo4jStore
    }
  }

  def packNeo4jStore() {
    val storeDir = new File(TEST_DATA_STORE)
    ZipUtil.pack(storeDir, new File(db.TEST_DATA_DESTINATION + "/neo4j-test.zip"))
    FileUtils.deleteDirectory(storeDir)
  }
}
