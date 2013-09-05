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
import org.extendedmind.email._
import org.extendedmind.bl._
import org.extendedmind.db.EmbeddedGraphDatabase
import org.extendedmind.security._
import org.neo4j.graphdb.factory.GraphDatabaseFactory
import org.neo4j.graphdb.factory.HighlyAvailableGraphDatabaseFactory
import org.neo4j.kernel.extension.KernelExtensionFactory
import org.neo4j.extension.uuid.UUIDKernelExtensionFactory
import scala.collection.JavaConverters._

// Custom settings from application.conf or overridden file

class Settings(config: Config) extends Extension {
  val serverPort = config.getInt("extendedmind.server.port")
  val neo4jStoreDir = config.getString("extendedmind.neo4j.storeDir")
  val neo4jPropertiesFile: Option[String] = {
    if (config.hasPath("extendedmind.neo4j.propertiesFile"))
      Some(config.getString("extendedmind.neo4j.propertiesFile"))
    else
      None
  }
  val isHighAvailability = config.getBoolean("extendedmind.neo4j.isHighAvailability")
  val startNeo4jServer = config.getBoolean("extendedmind.neo4j.startServer")
  val neo4jServerPort = config.getInt("extendedmind.neo4j.serverPort")
  val tokenSecret = config.getString("extendedmind.security.tokenSecret")
  val emailFrom = config.getString("extendedmind.email.from")
  val mailgunDomain = config.getString("extendedmind.email.mailgun.domain")
  val mailgunApiKey = config.getString("extendedmind.email.mailgun.apiKey")
  // Email templates
  val emailTemplateDir = config.getString("extendedmind.email.templates.directory")
  val requestInviteConfirmationTitle = config.getString("extendedmind.email.templates.requestInviteConfirmationTitle")
}

object SettingsExtension extends ExtensionId[Settings] with ExtensionIdProvider{
  override def lookup = SettingsExtension
  override def createExtension(system: ExtendedActorSystem) = new Settings(system.settings.config)
}

// Scaldi default configuration

class Configuration(settings: Settings) extends Module{
  implicit val implSettings = settings
  bind [GraphDatabase] to new EmbeddedGraphDatabase
  bind [MailgunClient] to new MailgunClientImpl
  bind [SecurityActions] to new SecurityActionsImpl
  bind [UserActions] to new UserActionsImpl
  bind [ItemActions] to new ItemActionsImpl
  bind [TaskActions] to new TaskActionsImpl
  bind [NoteActions] to new NoteActionsImpl
  bind [TagActions] to new TagActionsImpl
}
