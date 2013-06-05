package org.extendedmind.test

import org.neo4j.scala.DatabaseService
import org.neo4j.scala.DatabaseServiceImpl
import org.neo4j.test.ImpermanentGraphDatabase
import java.util.{HashMap => jMap}

/**
 * provides a specific Database Service
 * in this case an impermanent database service
 */
trait ImpermanentGraphDatabaseServiceProvider {
 /**
   * setup configuration parameters
   * @return Map[String, String] configuration parameters
   */
  def configParams = Map[String, String]()

  /**
   * using an instance of an impermanent graph database
   */
  val ds: DatabaseService = {
    import collection.JavaConversions.mapAsJavaMap
    DatabaseServiceImpl(
      new ImpermanentGraphDatabase(new jMap[String, String](configParams))
    )
  }
}