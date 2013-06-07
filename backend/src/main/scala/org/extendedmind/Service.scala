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
import com.escalatesoft.subcut.inject.BindingModule
import com.escalatesoft.subcut.inject.Injectable
import akka.actor.ActorContext

// we don't implement our route structure directly in the service actor because
// we want to be able to test it independently, without having to spin up an actor
class ServiceActor extends Actor{

  // Setup Subcut bindings here
  val settings = SettingsExtension(context.system)
  implicit val bindingModule = settings.configuration
  val service = new Service(context, settings)
  
  // this actor only runs our route, but you could add
  // other things here, like request stream processing
  // or timeout handling
  def receive = service.runRoute(service.emRoute)
}

object JsonImplicits extends DefaultJsonProtocol {
  implicit val impPerson = jsonFormat1(User)
}

// this class defines our service behavior independently from the service actor
class Service(context: ActorContext,
              settings: Settings)
              (implicit val bindingModule: BindingModule) extends HttpService with Injectable{

  // the HttpService trait defines only one abstract member, which
  // connects the services environment to the enclosing actor or test
  def actorRefFactory = context
  
  // Inject database
  val db = injectOptional[GraphDatabase] getOrElse(new EmbeddedGraphDatabase(settings))

  import JsonImplicits._
  val emRoute =
    path("") {
      get {
        respondWithMediaType(`text/html`) { // XML is marshalled to `text/xml` by default, so we simply override here
          complete {
            <html>
              <body>
                <h1>Extended Mind Scala Stack is running</h1>
              </body>
            </html>
          }
        }
      }
    }~
    path("users") {
      get { ctx =>
        ctx.complete{
          val result: List[User] = db.getUsers()
          result
        }
      }
    }~
    path("user") {
      post {
        entity(as[User]) { user =>
          val result: User = db.addUser(user)
          complete(result)
        }
      }
    }
}
