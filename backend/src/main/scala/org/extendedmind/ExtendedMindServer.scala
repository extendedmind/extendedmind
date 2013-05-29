package org.extendedmind

import akka.actor.{ActorSystem, Props}
import akka.io.IO
import spray.can.Http

object ExtendedMindServer extends App {

  implicit val system = ActorSystem()

  // the handler actor replies to incoming HttpRequests
  val handler = system.actorOf(Props[ExtendedMindServiceActor], name = "handler")

  IO(Http) ! Http.Bind(handler, interface = "localhost", port = 8080)
}
