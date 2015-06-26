/**
 * Copyright (c) 2013-2015 Extended Mind Technologies Oy
 *
 * This file is part of Extended Mind.
 *
 * Extended Mind is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

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
  
  // Add possibility to set ha.server via environment variables.
  // This is needed to get Docker to start listening on the right eth0 port.
  if (System.getenv("HA_SERVER_IP_ENV") != null){
    configParams("ha.server") = System.getenv(System.getenv("HA_SERVER_IP_ENV")) + ":" + System.getenv("HA_SERVER_PORT")
  }
  
  override def graphDatabaseFactory = {
    if (settings.isHighAvailability){
      new HighlyAvailableGraphDatabaseFactory().addKernelExtensions(kernelExtensions(false))
    }else{
      new GraphDatabaseFactory().addKernelExtensions(kernelExtensions(false))
    }
  }
  startServer()
}