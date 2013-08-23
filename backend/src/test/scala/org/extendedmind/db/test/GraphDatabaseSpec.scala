package org.extendedmind.db.test

import org.extendedmind.test.TestGraphDatabase
import org.extendedmind.test.SpecBase
import org.extendedmind.test.TestImpermanentGraphDatabase
import org.extendedmind.test.SpraySpecBase
import org.extendedmind.test.TestGraphDatabase._
import org.extendedmind.api.test.ImpermanentGraphDatabaseSpecBase
import org.extendedmind.domain.Items

class GraphDatabaseSpec extends ImpermanentGraphDatabaseSpecBase{
	
  def configurations = EmptyTestConfiguration 
  
  before{
    db.insertTestData()
  }
  
  after {
    cleanDb(db.ds.gds)
  }
  
  describe("UserDatabase Class"){
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
    it("should getItems"){
      db.getItems(db.timoUUID) match {
        case Right(items) => {
          assert(items.items.isDefined)
          assert(items.items.get.size === 3)
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