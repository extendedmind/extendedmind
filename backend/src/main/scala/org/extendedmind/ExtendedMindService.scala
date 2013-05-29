package org.extendedmind

import org.extendedmind.domain._

import akka.actor.Actor
import spray.routing._
import spray.http._
import spray.http.MediaTypes._
import spray.routing.Directive.pimpApply
import spray.routing.directives.CompletionMagnet.fromObject
import spray.httpx.SprayJsonSupport.sprayJsonMarshaller
import spray.httpx.SprayJsonSupport.sprayJsonUnmarshaller
import spray.json.DefaultJsonProtocol

// we don't implement our route structure directly in the service actor because
// we want to be able to test it independently, without having to spin up an actor
class ExtendedMindServiceActor extends Actor with ExtendedMindService with ProductionDB {

  // the HttpService trait defines only one abstract member, which
  // connects the services environment to the enclosing actor or test
  def actorRefFactory = context

  // this actor only runs our route, but you could add
  // other things here, like request stream processing
  // or timeout handling
  def receive = runRoute(s4Route)
}


object JsonImplicits extends DefaultJsonProtocol {
  implicit val impPerson = jsonFormat3(Person)
}


// this trait defines our service behavior independently from the service actor
trait ExtendedMindService extends HttpService { this: DBConfig =>
  import JsonImplicits._
  
  val s4Route =
    path("") {
      get {
        respondWithMediaType(`text/html`) { // XML is marshalled to `text/xml` by default, so we simply override here
          complete {
            <html>
              <body>
                <h1>The <b>S4</b> - <i>Slick Spray Scala Stack</i> is running :-)</h1>
              </body>
            </html>
          }
        }
      }
    } ~
      path("persons") {
        get { ctx =>
          ctx.complete{
            val result: List[Person] = m.getPersons()
            result
          }
        }
      }~
      path("person") {
        post {
          entity(as[Person]) { person =>
            val result: Person = m.addPerson(person)
            complete(result)
          }
        }
      }
}

class B{
    def persons: List[Person] = {
    List()
  }
}

