package org.extendedmind

import org.extendedmind.domain._
import akka.actor.Actor
import scala.concurrent.Future
import spray.routing._
import spray.http._
import spray.http.MediaTypes._
import spray.routing.Directive.pimpApply
import spray.routing.directives.CompletionMagnet.fromObject
import spray.httpx.SprayJsonSupport.sprayJsonMarshaller
import spray.httpx.SprayJsonSupport.sprayJsonUnmarshaller
import spray.json.DefaultJsonProtocol
import akka.actor.ActorContext
import scaldi.Injectable
import scaldi.Injector
import org.extendedmind.bl.UserActions

// we don't implement our route structure directly in the service actor because
// we want to be able to test it independently, without having to spin up an actor
class ServiceActor extends HttpServiceActor with Service{
  
  // Implement abstract field from Service
  def settings = SettingsExtension(context.system)
  def configurations = new Configuration(settings)
    
  // this actor only runs our route, but you could add
  // other things here, like request stream processing
  // or timeout handling
  def receive = runRoute(emRoute)
}

object JsonImplicits extends DefaultJsonProtocol {
  implicit val impPerson = jsonFormat1(User)
}

// this class defines our service behavior independently from the service actor
trait Service extends API with Injectable{

  // Settings and configuration need to be initialized in the child class
  def settings: Settings
  def configurations: Injector
  
  implicit val implModules = configurations  
  implicit val implSettings = settings
  implicit val implExecutionContext = actorRefFactory.dispatcher
  
  import JsonImplicits._
  val emRoute = {
    rootPath{ 
      respondWithMediaType(`text/html`) { // XML is marshalled to `text/xml` by default, so we simply override here
        complete {
          <html>
            <body>
              <h1>Extended Mind Scala Stack is running</h1>
            </body>
          </html>
        }
      }
    }~
    path("users") {
      get {
        complete{
          Future[List[User]]{  
            userActions.getUsers
          }
        }
      }
    }~
    path("user") {
      post {
        entity(as[User]) { user =>
          val result: User = userActions.addUser(user)
          complete(result)
        }
      }
    }
  }
  
  def userActions(implicit settings: Settings): UserActions = {
    inject[UserActions]
  }
}
