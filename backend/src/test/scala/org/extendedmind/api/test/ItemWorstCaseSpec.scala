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
import spray.http.StatusCodes._


/**
 * Worst case test for item routes.
 */
class ItemWorstCaseSpec extends ServiceSpecBase{

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

  describe("In the worst case, ItemService") {
    it("should return 'not found' when getting item that does not exist") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val randomUUID = UUID.randomUUID().toString()
      Get("/" + authenticateResponse.userUUID + "/item/" + randomUUID
          ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val failure = responseAs[String]        
        status should be (BadRequest)
        failure should startWith("Could not find item " + randomUUID + " for owner " + authenticateResponse.userUUID)
      }
    }
  }
}
