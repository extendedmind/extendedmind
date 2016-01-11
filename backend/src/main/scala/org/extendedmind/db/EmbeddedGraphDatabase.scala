/**
 * Copyright (c) 2013-2016 Extended Mind Technologies Oy
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
import scala.reflect.io.File

class EmbeddedGraphDatabase(implicit val settings: Settings)
	extends GraphDatabase with EmbeddedGraphDatabaseServiceProvider{
  def neo4jStoreDir = settings.neo4jStoreDir
  override def configFileLocation = {
    if (settings.neo4jPropertiesFile.isDefined)
      settings.neo4jPropertiesFile.get
    else
      null
  }

  override def graphDatabaseFactory = {
    if (settings.isHighAvailability){
      if (settings.neo4jPropertiesFile.isDefined){
        def getHAServerCount(propertiesFileLocation: String): Int = {
          val propertiesInputStream = new java.io.FileInputStream(settings.neo4jPropertiesFile.get)
          val properties = new java.util.Properties()
          properties.load(propertiesInputStream)
          if (properties.containsKey("ha.initial_hosts")){
            val initialHosts = properties.getProperty("ha.initial_hosts")
            propertiesInputStream.close()
            val numberOfHAServers = {
              if (initialHosts.length() > 0){
                initialHosts.length() - initialHosts.replace(",", "").length() + 1
              }else{
                0
              }
            }
            println("Configuration contains " + numberOfHAServers + " HA servers")
            numberOfHAServers
          }else{
            println("Configuration does not have a ha.initial_hosts parameter")
            0
          }
        }

        // When upgrading Neo4j, every node needs to join one at a time, which is when
        // startClusterCount needs to be set to 1 for master, 2 for first slave and default
        // 3 for third slave
        val startClusterCount =
          if (settings.startClusterCount.isDefined) settings.startClusterCount.get
          else 3

        // We need to make sure that the properties file has at least the specified ha.initial_hosts before
        // launching to get HA to work. Do a blocking poll here.
        while(getHAServerCount(settings.neo4jPropertiesFile.get) < startClusterCount){
          Thread.sleep(1000)
        }
        println("Found at least " + startClusterCount + " HA hosts, continuing")
      }
      new HighlyAvailableGraphDatabaseFactory()
    }else{
      new GraphDatabaseFactory()
    }
  }
  startServer()
}