package org.extendedmind.db.test

import org.extendedmind.test.TestGraphDatabase
import org.extendedmind.test.SpecBase
import org.extendedmind.test.TestImpermanentGraphDatabase

class GraphDatabaseSpec extends SpecBase{
	
  val db = new TestImpermanentGraphDatabase
  
  // Insert to
  before{
    db.insertTestUsers
  }

  after{
    db.shutdown(db.ds)
  }

  describe("Graph Database Class"){
    it("should contain test users"){
      val testEmail = "timo@ext.md"
    	db.getUser(testEmail) match {
				case Right(user) => assert(user.email === testEmail)
				case Left(e) => {
				  e foreach println
				  fail("Got errors")
				} 
    	}
    }
  }
}