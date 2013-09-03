package org.extendedmind.db.test

import org.extendedmind.test._
import org.extendedmind.test.TestGraphDatabase._

import org.extendedmind.domain._

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
          assert(task.description === None)
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
  
}