package org.extendedmind.db

import org.neo4j.scala.EmbeddedGraphDatabaseServiceProvider
import com.typesafe.config.Config
import org.extendedmind.Settings
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.search.ElasticSearchIndex
import org.extendedmind.search.SearchIndex

class EmbeddedGraphDatabase(implicit val settings: Settings) 
	extends GraphDatabase with EmbeddedGraphDatabaseServiceProvider{
  def neo4jStoreDir = settings.neo4jStoreDir
  override def configFileLocation = settings.neo4jPropertiesFile
  def graphDatabaseFactory = settings.neo4jGraphDatabaseFactory
}