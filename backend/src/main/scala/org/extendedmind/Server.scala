package org.extendedmind

import akka.actor.{ActorSystem, Props}
import akka.io.IO
import spray.can.Http
import com.typesafe.config.{ Config, ConfigFactory }
import org.extendedmind.api.ServiceActor
import org.slf4j.LoggerFactory
import ch.qos.logback.access.joran.JoranConfigurator
import ch.qos.logback.core.util.StatusPrinter
import ch.qos.logback.classic.LoggerContext

object Server extends App {

  implicit val system = {
    if (!args.isEmpty){
      if (args.size > 1){
        // The second parameter is the location of the logback configuration file
        val context = LoggerFactory.getILoggerFactory().asInstanceOf[LoggerContext];
		val configurator = new JoranConfigurator();
		configurator.setContext(context);
		configurator.doConfigure(args(1)); // loads logback file
		StatusPrinter.printInCaseOfErrorsOrWarnings(context); // Internal status data is printed in case of warnings or errors.
      }
      // First parameter is the location for the configuration file
      ActorSystem("extendedmind", ConfigFactory.load(args(0)))
    }else{
      ActorSystem("extendedmind")
    }
  }
  
  // the handler actor replies to incoming HttpRequests
  val handler = system.actorOf(Props[ServiceActor], name = "handler")

  IO(Http) ! Http.Bind(handler, interface = "localhost", port = Integer.valueOf(SettingsExtension(system).serverPort))
}
