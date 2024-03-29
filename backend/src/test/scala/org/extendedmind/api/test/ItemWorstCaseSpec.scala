/**
 * Copyright (c) 2013-2017 Extended Mind Technologies Oy
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
import java.io.File
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

  override def configurations = TestDataGeneratorConfiguration :: new Configuration(settings, actorRefFactory, actorSystem)

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
      Get("/v2/owners/" + authenticateResponse.userUUID + "/data/items/" + randomUUID
          ) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val failure = responseAs[ErrorResult]
        status should be (BadRequest)
        failure.description should startWith("Could not find item " + randomUUID + " for owner " + authenticateResponse.userUUID)
      }
    }
    it("should return 409 Conflict when trying to modify task with invalid modified timestamp") {
      val authenticateResponse = emailPasswordAuthenticate(TIMO_EMAIL, TIMO_PASSWORD)
      val newItem = Item("learn how to fly", None, None)
      Put("/v2/owners/" + authenticateResponse.userUUID + "/data/items",
          marshal(newItem).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        val putItemResponse = responseAs[SetResult]
        Put("/v2/owners/" + authenticateResponse.userUUID + "/data/items/" + putItemResponse.uuid.get,
            marshal(newItem.copy(modified = Some(putItemResponse.modified + 1))).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
          status should be (Conflict)
          val failure = responseAs[ErrorResult]
          failure.code should be (ERR_BASE_WRONG_EXPECTED_MODIFIED.number)
        }
      }
    }
  }
}
