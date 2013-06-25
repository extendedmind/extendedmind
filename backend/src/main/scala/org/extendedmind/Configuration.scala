package org.extendedmind

import akka.actor.Extension
import akka.actor.ExtensionId
import akka.actor.ExtensionIdProvider
import akka.actor.ExtendedActorSystem
import scala.concurrent.duration.Duration
import com.typesafe.config.Config
import java.util.concurrent.TimeUnit
import org.extendedmind.db.GraphDatabase
import scaldi.Module
import org.extendedmind.search.ElasticSearchIndex
import org.extendedmind.search.SearchIndex
import org.extendedmind.bl.UserActions
import org.extendedmind.bl.UserActionsImpl
import org.extendedmind.db.EmbeddedGraphDatabase

// Custom settings from application.conf or overridden file

class Settings(config: Config) extends Extension {
  val neo4jStoreDir = config.getString("extendedmind.neo4j.storeDir")
  val tokenSecret = config.getString("extendedmind.security.tokenSecret")
}

object SettingsExtension extends ExtensionId[Settings] with ExtensionIdProvider{
  override def lookup = SettingsExtension
  override def createExtension(system: ExtendedActorSystem) = new Settings(system.settings.config)
}

// Scaldi default configuration

class Configuration(settings: Settings) extends Module{
  bind [GraphDatabase] to new EmbeddedGraphDatabase(settings)
  bind [SearchIndex] to new ElasticSearchIndex(settings)
  bind [UserActions] to new UserActionsImpl(settings)
}
