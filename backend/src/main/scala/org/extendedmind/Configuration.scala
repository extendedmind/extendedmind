package org.extendedmind

import akka.actor.Extension
import akka.actor.ExtensionId
import akka.actor.ExtensionIdProvider
import akka.actor.ExtendedActorSystem
import scala.concurrent.duration.Duration
import com.typesafe.config.Config
import java.util.concurrent.TimeUnit
import com.escalatesoft.subcut.inject.NewBindingModule
import org.extendedmind.domain._

// Custom settings from application.conf or overridden file

class Settings(config: Config) extends Extension {
  val neo4jStoreDir = config.getString("extendedmind.neo4j.storeDir")
  val configuration = new Configuration(this)
}

object SettingsExtension extends ExtensionId[Settings] with ExtensionIdProvider{
  override def lookup = SettingsExtension
  override def createExtension(system: ExtendedActorSystem) = new Settings(system.settings.config)
}

// Subcut defaults

class Configuration(settings: Settings) extends NewBindingModule(module => {
  import module._
  bind [GraphDatabase] toSingle new EmbeddedGraphDatabase(settings)
}) 



