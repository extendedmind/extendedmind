package org.extendedmind.db

import org.extendedmind.Settings
import org.neo4j.graphdb.factory.GraphDatabaseFactory
import org.neo4j.graphdb.factory.HighlyAvailableGraphDatabaseFactory
import org.neo4j.scala.EmbeddedGraphDatabaseServiceProvider

class EmbeddedGraphDatabase(implicit val settings: Settings) 
	extends GraphDatabase with EmbeddedGraphDatabaseServiceProvider{
  def neo4jStoreDir = settings.neo4jStoreDir
  override def configFileLocation = {
    if (settings.neo4jPropertiesFile.isDefined)
      settings.neo4jPropertiesFile.get
    else
      null
  }
  def graphDatabaseFactory = {
    if (settings.isHighAvailability){
      new HighlyAvailableGraphDatabaseFactory().addKernelExtensions(kernelExtensions)
    }else{
      new GraphDatabaseFactory().addKernelExtensions(kernelExtensions)
    }
  }
  startServer()
}