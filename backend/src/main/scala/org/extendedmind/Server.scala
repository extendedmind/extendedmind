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

package org.extendedmind

import akka.actor.{ ActorSystem, Props }
import akka.io.IO
import spray.can.Http
import com.typesafe.config.{ Config, ConfigFactory }
import org.extendedmind.api.ServiceActor
import org.slf4j.LoggerFactory
import ch.qos.logback.access.joran.JoranConfigurator
import ch.qos.logback.core.util.StatusPrinter
import ch.qos.logback.classic.LoggerContext

object Server extends App {

  // This makes it possible to use -Dconfig.file="" notation
  implicit val system = ActorSystem("extendedmind", ConfigFactory.load())

  // the handler actor replies to incoming HttpRequests
  val handler = system.actorOf(Props[ServiceActor], name = "handler")

  IO(Http) ! Http.Bind(handler, interface = "0.0.0.0", port = Integer.valueOf(SettingsExtension(system).serverPort))
}
