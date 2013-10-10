package org.extendedmind.db.test

import org.extendedmind.test._
import org.extendedmind.test.TestGraphDatabase._
import org.extendedmind.domain._
import org.extendedmind.security.SecurityContext
import java.util.UUID

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
				case Right(user) => assert(user.email === testEmail)
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
      db.getItems(db.timoUUID) match {
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
      val testTask = Task("testTitle", Some("testDescription"), None, None, None, None)
      val result = db.putNewTask(db.timoUUID, 
           testTask)
      // Put it back without the description
      val updateResult = db.putExistingTask(db.timoUUID, result.right.get.uuid.get, 
          testTask.copy(description = None))
      
      db.getTask(db.timoUUID, result.right.get.uuid.get) match {
        case Right(task) => {
          // Assert that the modified timestamp has changed from the previous round
          assert(task.modified.get > result.right.get.modified)
          // Assert that the description has indeed been removed
          // NOTE: For some odd reason this fails when called from Eclipse
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
          assert(nameSet.contains(("extended mind", 0)))
          assert(nameSet.contains(("extended mind technologies", 0)))
        }
        case Left(e) => {
          fail("Could not authenticate as Timo")
        }
      }
      db.authenticate(LAURI_EMAIL, LAURI_PASSWORD) match {
        case Right(securityContext) => {
          assert(securityContext.collectives.get.size === 2)
          val nameSet = getCollectiveAccess(securityContext)
          assert(nameSet.contains(("extended mind", 1)))
          assert(nameSet.contains(("extended mind technologies", 2)))
        }
        case Left(e) => {
          fail("Could not authenticate as Lauri")
        }
      }
      db.authenticate(INFO_EMAIL, INFO_PASSWORD) match {
        case Right(securityContext) => {
          assert(securityContext.collectives.get.size === 1)
          val nameSet = getCollectiveAccess(securityContext)
          assert(nameSet.contains(("extended mind", 1)))
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
              assert(nameSet.contains(("extended mind", 1)))
              assert(nameSet.contains(("extended mind technologies", 1)))
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

  }
  
  private def getCollectiveAccess(securityContext: SecurityContext): Set[(String, Byte)] = {
    securityContext.collectives.get.map(collectiveAccess => collectiveAccess._2).toSet
  }
  private def getCollectiveUUIDMap(securityContext: SecurityContext): Map[String, UUID] = {
    securityContext.collectives.get.map(collectiveAccess => (collectiveAccess._2._1 -> collectiveAccess._1))
  }


}