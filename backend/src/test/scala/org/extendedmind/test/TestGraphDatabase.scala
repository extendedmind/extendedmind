package org.extendedmind.test

import org.extendedmind.Settings
import org.extendedmind.db.GraphDatabase
import org.extendedmind.search.SearchIndex
import org.neo4j.scala.EmbeddedGraphDatabaseServiceProvider
import org.neo4j.scala.Neo4jBatchIndexProvider
import org.neo4j.scala.BatchGraphDatabaseServiceProvider
import org.extendedmind.db.MainLabel

/**
 * Basic test data for Extended Mind
 */
trait TestGraphDatabase extends GraphDatabase {
  def insertTestUsers() {
    withTx {
      implicit neo =>
        val timo = createNode
        timo.addLabel(MainLabel.USER)
        val jp = createNode
        start --> "foo" --> end
    }
  }
}

class TestImpermanentGraphDatabase(settings: Settings)
  extends TestGraphDatabase with ImpermanentGraphDatabaseServiceProvider {
}

class TestBatchGraphDatabase(settings: Settings)
  extends TestGraphDatabase with Neo4jBatchIndexProvider with BatchGraphDatabaseServiceProvider {
  def neo4jStoreDir = "target/test-classes"
}
