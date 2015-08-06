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
import akka.actor.ActorRefFactory

// Custom settings from application.conf or overridden file

sealed abstract class SignUpMethod
case object SIGNUP_ON extends SignUpMethod
case object SIGNUP_OFF extends SignUpMethod

sealed abstract class SignUpMode
case object MODE_ADMIN extends SignUpMode
case object MODE_ALFA extends SignUpMode
case object MODE_BETA extends SignUpMode
case object MODE_NORMAL extends SignUpMode

class Settings(config: Config) extends Extension {
  val version = config.getString("extendedmind.version")
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
  val disableTimestamps =
    if (config.hasPath("extendedmind.neo4j.disableTimestamps"))
      config.getBoolean("extendedmind.neo4j.disableTimestamps")
    else false

  val tokenSecret = config.getString("extendedmind.security.tokenSecret")
  val signUpMethod: SignUpMethod  = {
    config.getString("extendedmind.security.signUpMethod") match {
      case "OFF" => SIGNUP_OFF
      case "ON" => SIGNUP_ON
    }
  }
  val signUpCoupon: Option[String] = {
    if (config.hasPath("extendedmind.security.signUpCoupon"))
      Some(config.getString("extendedmind.security.signUpCoupon"))
    else
      None
  }

  val signUpMode: SignUpMode  = {
    config.getString("extendedmind.security.signUpMode") match {
      case "ADMIN" => MODE_ADMIN
      case "ALFA" => MODE_ALFA
      case "BETA" => MODE_BETA
      case "NORMAL" => MODE_NORMAL
    }
  }
  val mailgunDomain = config.getString("extendedmind.email.mailgun.domain")
  val mailgunApiKey = config.getString("extendedmind.email.mailgun.apiKey")
  // Email templates
  val emailFrom = config.getString("extendedmind.email.from")
  val emailUrlOrigin = config.getString("extendedmind.email.urlOrigin")
  val emailTemplateDir: Option[String] = {
    if (config.hasPath("extendedmind.email.templates.directory"))
      Some(config.getString("extendedmind.email.templates.directory"))
    else
      None
  }
  val shareListTitle = config.getString("extendedmind.email.templates.shareListTitle")
  val acceptShareURI = config.getString("extendedmind.email.templates.acceptShareURI")
  val resetPasswordTitle = config.getString("extendedmind.email.templates.resetPasswordTitle")
  val resetPasswordURI = config.getString("extendedmind.email.templates.resetPasswordURI")
  val verifyEmailTitle = config.getString("extendedmind.email.templates.verifyEmailTitle")
  val verifyEmailURI = config.getString("extendedmind.email.templates.verifyEmailURI")
}

object SettingsExtension extends ExtensionId[Settings] with ExtensionIdProvider{
  override def lookup = SettingsExtension
  override def createExtension(system: ExtendedActorSystem) = new Settings(system.settings.config)
}

// Scaldi default configuration

class Configuration(settings: Settings, actorRefFactory: ActorRefFactory) extends Module{
  implicit val implSettings = settings
  implicit val implActorRefFactory = actorRefFactory
  bind [GraphDatabase] to new EmbeddedGraphDatabase
  bind [MailgunClient] to new MailgunClientImpl
  bind [SecurityActions] to new SecurityActionsImpl
  bind [UserActions] to new UserActionsImpl
  bind [CollectiveActions] to new CollectiveActionsImpl
  bind [ItemActions] to new ItemActionsImpl
  bind [TaskActions] to new TaskActionsImpl
  bind [NoteActions] to new NoteActionsImpl
  bind [ListActions] to new ListActionsImpl
  bind [TagActions] to new TagActionsImpl
  bind [AdminActions] to new AdminActionsImpl
}
