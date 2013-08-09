package org.extendedmind.db

import org.neo4j.scala.EmbeddedGraphDatabaseServiceProvider
import com.typesafe.config.Config
import org.extendedmind.Settings
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.search.ElasticSearchIndex
import org.extendedmind.search.SearchIndex
import org.neo4j.graphdb.factory.HighlyAvailableGraphDatabaseFactory
import org.neo4j.graphdb.factory.GraphDatabaseFactory
import org.neo4j.server.configuration.ServerConfigurator
import org.neo4j.kernel.GraphDatabaseAPI
import org.neo4j.server.configuration.Configurator
import org.neo4j.server.WrappingNeoServerBootstrapper

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
  if (settings.startNeo4jServer){
    val config: ServerConfigurator = new ServerConfigurator(ds.gds.asInstanceOf[GraphDatabaseAPI]);
    config.configuration().setProperty(
      Configurator.THIRD_PARTY_PACKAGES_KEY, "org.neo4j.extension.uuid=/db/uuid");
    config.configuration().setProperty(
      Configurator.WEBSERVER_PORT_PROPERTY_KEY, 7473);
    val srv: WrappingNeoServerBootstrapper = new WrappingNeoServerBootstrapper(
                                  ds.gds.asInstanceOf[GraphDatabaseAPI], config);
    srv.start();
  }
}