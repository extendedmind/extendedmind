package org.extendedmind.test

import org.neo4j.scala.EmbeddedGraphDatabaseServiceProvider
import org.extendedmind.Settings
import org.extendedmind.domain.GraphDatabase

class TestGraphDatabase(settings: Settings) extends GraphDatabase 
			with ImpermanentGraphDatabaseServiceProvider {
}