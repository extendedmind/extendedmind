package org.extendedmind.db.test

import org.extendedmind.test.TestGraphDatabase
import org.extendedmind.test.SpecBase
import org.extendedmind.test.TestImpermanentGraphDatabase
import org.extendedmind.test.SpraySpecBase
import org.extendedmind.test.TestGraphDatabase._
import org.extendedmind.api.test.ImpermanentGraphDatabaseSpecBase

class GraphDatabaseSpec extends ImpermanentGraphDatabaseSpecBase{
	
  def configurations = EmptyTestConfiguration 
  
  describe("Graph Database Class"){
    it("should contain test users"){
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
}