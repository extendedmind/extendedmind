package org.extendedmind.api.test

import org.extendedmind.test._

import org.neo4j.test.TestGraphDatabaseFactory

trait ImpermanentGraphDatabaseSpecBase extends SpraySpecBase with Neo4jHelper{

  // Create test database
  val db: TestImpermanentGraphDatabase = new TestImpermanentGraphDatabase

}