package org.extendedmind.db.test

import org.extendedmind.test.TestGraphDatabase
import org.extendedmind.test.SpecBase
import org.extendedmind.test.TestImpermanentGraphDatabase
import org.extendedmind.test.SpraySpecBase
import org.extendedmind.test.TestGraphDatabase._

class GraphDatabaseSpec extends SpraySpecBase{
	
  val db = new TestImpermanentGraphDatabase
  
  def configurations = EmptyTestConfiguration 
  
  // Insert to
  before{
    db.insertTestUsers
  }

  after{
    db.shutdown(db.ds)
  }

  describe("Graph Database Class"){
    it("should contain test users"){
      val testEmail = TIMO_EMAIL
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