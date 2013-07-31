package org.extendedmind

import akka.actor.{ActorSystem, Props}
import akka.io.IO
import spray.can.Http
import org.extendedmind.api.ServiceActor

object Server extends App {

  implicit val system = ActorSystem()

  // the handler actor replies to incoming HttpRequests
  val handler = system.actorOf(Props[ServiceActor], name = "handler")

  IO(Http) ! Http.Bind(handler, interface = "localhost", port = Integer.valueOf(SettingsExtension(system).serverPort))
}
