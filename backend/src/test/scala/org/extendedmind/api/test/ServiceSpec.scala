/**
 * Copyright (c) 2013-2014 Extended Mind Technologies Oy
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
  }

  override def configurations = ServiceTestConfiguration

  before{
    db.insertTestData()
  }

  after {
    cleanDb(db.ds.gds)
    // Reset mocks after each test to be able to use verify after each test
    reset(mockGraphDatabase)
  }

  describe("Service") {

    it("should return backend version at root") {
      Get() ~> route ~> check {responseAs[String] should startWith("{\"version\":") }
    }

    it("should generate token response on /authenticate") {
      stubTimoAuthenticate()
      Post("/authenticate"
          ) ~> addHeader(Authorization(BasicHttpCredentials(TIMO_EMAIL, TIMO_PASSWORD))
          ) ~> route ~> check {
        val authenticateResponse = responseAs[String]
        authenticateResponse should include("token")
      }
      verify(mockGraphDatabase).generateToken(TIMO_EMAIL, TIMO_PASSWORD, None)
    }
  }

  def stubTimoAuthenticate(): SecurityContext = {
    val uuid = UUID.randomUUID()
    val token = Token.encryptToken(Token(uuid))
    val securityContext = SecurityContext(uuid, Token.ADMIN, None, System.currentTimeMillis, System.currentTimeMillis, None, Some(token), None, None, None, None, None, None)
    stub(mockGraphDatabase.generateToken(TIMO_EMAIL, TIMO_PASSWORD, None)).toReturn(
      Right(securityContext))
    stub(mockGraphDatabase.authenticate(token, None)).toReturn(
      Right(securityContext))
    securityContext
  }

}