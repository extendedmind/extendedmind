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

class EmbeddedGraphDatabase(implicit val settings: Settings)
  extends GraphDatabase with EmbeddedGraphDatabaseServiceProvider{
  def neo4jStoreDir = settings.neo4jStoreDir
  override def configFileLocation = {
    if (settings.neo4jPropertiesFile.isDefined)
      settings.neo4jPropertiesFile.get
    else
      null
  }
  
  override def configParams = {
    if (settings.neo4jPropertiesFile.isEmpty){
      val configMap = new scala.collection.mutable.HashMap[String, String]()
      if (settings.isHighAvailability){
        // No config file, but HA, use enviroment variables to set HA properties
        configMap.put("dbms.mode", "HA")
        val serverId = System.getenv("EXTENDEDMIND_BACKEND_HA_SERVER_ID")
        if (serverId != null) configMap.put("ha.server_id", serverId)
        val initialHosts = System.getenv("EXTENDEDMIND_BACKEND_HA_INITIAL_HOSTS")
        if (initialHosts != null) configMap.put("ha.initial_hosts", initialHosts)
        val pushFactor = System.getenv("EXTENDEDMIND_BACKEND_HA_PUSH_FACTOR")
        if (pushFactor != null) configMap.put("ha.tx_push_factor", pushFactor)
      }
      val formatMigration = System.getenv("EXTENDEDMIND_BACKEND_FORMAT_MIGRATION")
      if (formatMigration != null) configMap.put("dbms.allow_format_migration", formatMigration)
      configMap.toMap
    }else{
      null
    }
  }

  override def graphDatabaseFactory = {
    if (settings.isHighAvailability){        
      new HighlyAvailableGraphDatabaseFactory()
    }else{
      new GraphDatabaseFactory()
    }
  }
}
