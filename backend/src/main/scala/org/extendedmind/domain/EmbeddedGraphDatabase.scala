package org.extendedmind.domain

import org.neo4j.scala.EmbeddedGraphDatabaseServiceProvider
import com.typesafe.config.Config
import org.extendedmind.Settings
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.bl.ElasticSearchIndex
import org.extendedmind.bl.SearchIndex

class EmbeddedGraphDatabase(settings: Settings) 
	extends GraphDatabase with EmbeddedGraphDatabaseServiceProvider{
  def neo4jStoreDir = settings.neo4jStoreDir  
}