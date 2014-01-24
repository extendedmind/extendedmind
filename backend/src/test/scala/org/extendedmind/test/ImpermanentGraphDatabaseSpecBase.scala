package org.extendedmind.test

import org.neo4j.test.TestGraphDatabaseFactory

object ImpermanentGraphDatabaseSpecBase {
  // Test database
  var localdb: TestImpermanentGraphDatabase = null
  def db(implicit settings: org.extendedmind.Settings): TestImpermanentGraphDatabase = {
    if (localdb == null){
      localdb = new TestImpermanentGraphDatabase
    }
    localdb
  }
}

trait ImpermanentGraphDatabaseSpecBase extends SpraySpecBase with Neo4jHelper{
  // Test database, singleton
  val db: TestImpermanentGraphDatabase = ImpermanentGraphDatabaseSpecBase.db
}