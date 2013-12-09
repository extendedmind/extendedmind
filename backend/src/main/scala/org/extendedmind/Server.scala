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

  IO(Http) ! Http.Bind(handler, interface = "localhost", port = Integer.valueOf(SettingsExtension(system).serverPort))
}
