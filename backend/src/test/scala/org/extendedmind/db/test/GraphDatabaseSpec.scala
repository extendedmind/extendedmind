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

package org.extendedmind.db.test

import org.extendedmind.test._
import org.extendedmind.test.TestGraphDatabase._
import org.extendedmind.domain._
import org.extendedmind.security.SecurityContext
import java.util.UUID
import org.extendedmind.security.AuthenticatePayload

class GraphDatabaseSpec extends ImpermanentGraphDatabaseSpecBase{

  def configurations = EmptyTestConfiguration

  before{
    db.insertTestData()
  }

  after {
    cleanDb(db.ds.gds)
  }

  describe("UserDatabase"){
    it("should getUser"){
      val testEmail = TIMO_EMAIL
      db.getUser(testEmail) match {
        case Right(user) => assert(user.email.get === testEmail)
        case Left(e) => {
          e foreach (resp => {
              println(resp)
              if (resp.throwable.isDefined) resp.throwable.get.printStackTrace()
            }
          )
          fail("Got errors")
        }
      }
    }
  }
  describe("ItemDatabase"){
     it("should getItems"){

       db.getItems(Owner(db.timoUUID, None), None, true, false, false, false, false) match {
        case Right(items) => {
          assert(items.items.isDefined)
          assert(items.items.get.size === 2)
        }
        case Left(e) => {
          e foreach (resp => {
              println(resp)
              if (resp.throwable.isDefined) resp.throwable.get.printStackTrace()
            }
          )
          fail("Got errors")
        }
      }
    }
  }
  describe("TaskDatabase"){
     it("should remove properties of a task from the database"){
      val testTask = Task("testTitle", Some("testDescription"), None, None, None, None, None)
      val result = db.putNewTask(Owner(db.timoUUID, None),
           testTask)
      // Put it back without the description
      val updateResult = db.putExistingTask(Owner(db.timoUUID, None), result.right.get.uuid.get,
          testTask.copy(description = None))

      db.getTask(Owner(db.timoUUID, None), result.right.get.uuid.get) match {
        case Right(task) => {
          // Assert that the modified timestamp has changed from the previous round
          assert(task.modified.get > result.right.get.modified)
          // Assert that the description has indeed been removed
          task.description should be (None)
        }
        case Left(e) => {
          e foreach (resp => {
              println(resp)
              if (resp.throwable.isDefined) resp.throwable.get.printStackTrace()
            }
          )
          fail("Got errors")
        }
      }
    }
  }
  describe("SecurityDatabase"){
     it("should get the right collectives with authenticate"){
      db.authenticate(TIMO_EMAIL, TIMO_PASSWORD) match {
        case Right(securityContext) => {
          assert(securityContext.collectives.get.size === 2)
          val nameSet = getCollectiveAccess(securityContext)
          assert(nameSet.contains(("extended mind", 0, true, None)))
          assert(nameSet.contains(("extended mind technologies", 0, false, Some("emt"))))
        }
        case Left(e) => {
          fail("Could not authenticate as Timo")
        }
      }
      db.authenticate(LAURI_EMAIL, LAURI_PASSWORD) match {
        case Right(securityContext) => {
          assert(securityContext.collectives.get.size === 2)
          val nameSet = getCollectiveAccess(securityContext)
          assert(nameSet.contains(("extended mind", 1, true, None)))
          assert(nameSet.contains(("extended mind technologies", 2, false, Some("emt"))))
        }
        case Left(e) => {
          fail("Could not authenticate as Lauri")
        }
      }
      db.authenticate(INFO_EMAIL, INFO_PASSWORD) match {
        case Right(securityContext) => {
          assert(securityContext.collectives.get.size === 1)
          val nameSet = getCollectiveAccess(securityContext)
          assert(nameSet.contains(("extended mind", 1, true, None)))
        }
        case Left(e) => {
          fail("Could not authenticate as info")
        }
      }
    }
    it("should be able to change the permission to collective"){
      db.authenticate(TIMO_EMAIL, TIMO_PASSWORD) match {
        case Right(securityContext) => {
          val collectiveUuidMap = getCollectiveUUIDMap(securityContext)

          // Change permission for Lauri
          val lauri = db.getUser(LAURI_EMAIL).right.get

          db.setCollectiveUserPermission(collectiveUuidMap.get("extended mind technologies").get,
                                         securityContext.userUUID, lauri.uuid.get, Some(SecurityContext.READ))

          // Authenticate as Lauri and check modified permission
          db.authenticate(LAURI_EMAIL, LAURI_PASSWORD) match {
            case Right(lauriSecurityContext) => {
              assert(lauriSecurityContext.collectives.get.size === 2)
              val nameSet = getCollectiveAccess(lauriSecurityContext)
              assert(nameSet.contains(("extended mind", 1, true, None)))
              assert(nameSet.contains(("extended mind technologies", 1, false, Some("emt"))))
            }
            case Left(e) => {
              fail("Could not authenticate as Lauri")
            }
          }
        }
        case Left(e) => {
          fail("Could not authenticate as Timo")
        }
      }
    }
    it("should be consistently be able to store and get token"){

      db.rebuildUserIndexes

      1 to 100 foreach { _ => {
        db.generateToken(TIMO_EMAIL, TIMO_PASSWORD, Some(AuthenticatePayload(true, None))) match {
          case Right(securityContext) => {
            db.swapToken(securityContext.token.get, None) match {
              case Right(newSecurityContext) => {
                newSecurityContext.token should not be None
              }
              case _ => {
                fail("Error swapping token")
              }
            }
          }
          case _ => {
            fail("Error generating token")
          }
        }
      }}
    }
  }
}