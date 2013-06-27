package org.extendedmind.api

import scala.concurrent.Future
import org.extendedmind.Configuration
import org.extendedmind.Settings
import org.extendedmind.SettingsExtension
import org.extendedmind.bl.SecurityActions
import org.extendedmind.bl.ItemActions
import org.extendedmind.domain.User
import scaldi.Injectable
import scaldi.Injector
import spray.http._
import spray.httpx.SprayJsonSupport.sprayJsonMarshaller
import spray.httpx.SprayJsonSupport.sprayJsonUnmarshaller
import spray.json.DefaultJsonProtocol
import spray.routing.Directive.pimpApply
import spray.routing.HttpServiceActor
import spray.routing.directives.CompletionMagnet.fromObject
import spray.routing.authentication.BasicAuth
import org.extendedmind.security.ExtendedMindUserPassAuthenticator
import org.extendedmind.domain.Item
import org.extendedmind.db.GraphDatabase
import org.extendedmind.security.SecurityContext
import org.extendedmind.security.ExtendedMindUserPassAuthenticatorImpl

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
  implicit val implItem = jsonFormat5(Item)
  implicit val implUser = jsonFormat2(User)
  implicit val implSecurityContext = jsonFormat5(SecurityContext)
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
    getRoot {
      complete {
        "Extended Mind Scala Stack is running"
      }
    } ~
    postAuthenticate { url =>
      authenticate(BasicAuth(authenticator, "user")) { securityContext =>
        complete {
          securityContext
        }
      }
    } ~
    getItems{ userUUID =>
      authenticate(BasicAuth(authenticator, "user")) { securityContext =>
        authorize(true){
	      complete {
	        Future[List[Item]] {
	          itemActions.getItems(userUUID)
	        }
	      }
        }
      }
    } ~ 
    putNewItem { userUUID =>
      entity(as[Item]) { item =>
        val uuid: String = itemActions.putItem(userUUID, item, None)
        complete(uuid)
      }   
    } ~
    putExistingItem { (userUUID, itemUUID) =>
      entity(as[Item]) { item =>
        val uuid: String = itemActions.putItem(userUUID, item, Some(itemUUID))
        complete(uuid)
      }
    }
  }

  def itemActions: ItemActions = {
    inject[ItemActions]
  }

  def securityActions: SecurityActions = {
    inject[SecurityActions]
  }
  
  def authenticator: ExtendedMindUserPassAuthenticator = {
    inject[ExtendedMindUserPassAuthenticator] (by default new ExtendedMindUserPassAuthenticatorImpl)
  }
  
  def graphDatabase: GraphDatabase = {
    inject[GraphDatabase]
  }
}
