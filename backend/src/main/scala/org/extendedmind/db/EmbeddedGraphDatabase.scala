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
      configMap.put("dbms.backup.address", "0.0.0.0:6362")
      if (settings.isHighAvailability){
        // No config file, but HA, use enviroment variables to set HA properties
        configMap.put("dbms.mode", "HA")
        for(serverId <- settings.haServerId) configMap.put("ha.server_id", serverId.toString)
        for(initialHosts <- settings.haInitialHosts) configMap.put("ha.initial_hosts", initialHosts)
        for(pushFactor <- settings.haPushFactor) configMap.put("ha.tx_push_factor", pushFactor.toString)
      }else{
        configMap.put("dbms.mode", "SINGLE")
      }
      configMap.put("dbms.allow_format_migration", settings.formatMigration.toString)
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
