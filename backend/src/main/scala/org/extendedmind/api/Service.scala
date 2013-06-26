package org.extendedmind.api

import scala.concurrent.Future
import org.extendedmind.Configuration
import org.extendedmind.Settings
import org.extendedmind.SettingsExtension
import org.extendedmind.bl.SecurityActions
import org.extendedmind.bl.UserActions
import org.extendedmind.domain.User
import scaldi.Injectable
import scaldi.Injector
import spray.httpx.SprayJsonSupport.sprayJsonMarshaller
import spray.httpx.SprayJsonSupport.sprayJsonUnmarshaller
import spray.json.DefaultJsonProtocol
import spray.routing.Directive.pimpApply
import spray.routing.HttpServiceActor
import spray.routing.directives.CompletionMagnet.fromObject
import spray.routing.authentication.BasicAuth
import org.extendedmind.security.ExtendedMindUserPassAuthenticator
import org.extendedmind.domain.Item

// we don't implement our route structure directly in the service actor because
// we want to be able to test it independently, without having to spin up an actor
class ServiceActor extends HttpServiceActor with Service {

  // Implement abstract field from Service
  def settings = SettingsExtension(context.system)
  def configurations = new Configuration(settings)

  // this actor only runs our route, but you could add
  // other things here, like request stream processing
  // or timeout handling
  def receive = runRoute(emRoute)
}

object JsonImplicits extends DefaultJsonProtocol {
  implicit val implItem = jsonFormat2(Item)
  implicit val implUser = jsonFormat2(User)
}

// this class defines our service behavior independently from the service actor
trait Service extends API with Injectable {

  // Settings and configuration need to be initialized in the child class
  def settings: Settings
  def configurations: Injector

  implicit val implModules = configurations
  implicit val implSettings = settings
  implicit val implExecutionContext = actorRefFactory.dispatcher

  import JsonImplicits._
  val emRoute = {
    rootGet {
      complete {
        "Extended Mind Scala Stack is running"
      }
    } ~
    authenticatePost {
      authenticate(BasicAuth(ExtendedMindUserPassAuthenticator, "user")) { securityContext =>
        complete {
          Future[String] {
            securityActions.generateToken(securityContext.email)
          }
        }
      }
    } ~
    path("users") {
      get {
        complete {
          Future[List[User]] {
            userActions.getUsers
          }
        }
      }
    } ~
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

  def securityActions(implicit settings: Settings): SecurityActions = {
    inject[SecurityActions]
  }
}
