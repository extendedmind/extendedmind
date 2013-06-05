package org.extendedmind.domain

import org.neo4j.scala.EmbeddedGraphDatabaseServiceProvider
import com.typesafe.config.Config
import org.extendedmind.Settings

class EmbeddedGraphDatabase(implicit val settings: Settings) extends GraphDatabase with EmbeddedGraphDatabaseServiceProvider {
  def neo4jStoreDir = settings.neo4jStoreDir
}