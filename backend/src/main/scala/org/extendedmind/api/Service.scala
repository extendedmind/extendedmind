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
import org.extendedmind.security.ExtendedMindUserPassAuthenticator
import org.extendedmind.security.ExtendedAuth
import org.extendedmind.domain.Item
import org.extendedmind.db.GraphDatabase
import org.extendedmind.security.SecurityContext
import org.extendedmind.security.ExtendedMindUserPassAuthenticatorImpl
import spray.routing.RejectionHandler
import spray.routing.AuthenticationFailedRejection
import spray.routing.AuthenticationFailedRejection._
import spray.routing.MissingHeaderRejection
import spray.http.StatusCodes._
import spray.routing.ExceptionHandler
import org.extendedmind.security.TokenExpiredException
import spray.routing.authentication.BasicAuth
import org.extendedmind.security.ExtendedMindAuthenticateUserPassAuthenticator
import org.extendedmind.security.ExtendedMindAuthenticateUserPassAuthenticatorImpl
import java.util.UUID
import spray.json.JsonFormat
import spray.json.JsString
import spray.json.JsValue
import org.extendedmind.security.AuthenticatePayload

object Service {
  def rejectionHandler: RejectionHandler = {
    RejectionHandler.apply {
      case AuthenticationFailedRejection(cause, authenticator) :: _ => 
        val rejectionMessage = cause match {
          case CredentialsMissing  ⇒ "The resource requires authentication, which was not supplied with the request"
          case CredentialsRejected ⇒ "The supplied authentication is invalid"
        }
        ctx ⇒ ctx.complete(Forbidden, rejectionMessage)
    }
  }
  def exceptionHandler: ExceptionHandler = { 
      ExceptionHandler.apply {
      case e: TokenExpiredException => ctx =>
        ctx.complete(419, "The supplied token has expired.")
    }
  }
}

// we don't implement our route structure directly in the service actor because
// we want to be able to test it independently, without having to spin up an actor
class ServiceActor extends HttpServiceActor with Service {

  // Implement abstract field from Service
  def settings = SettingsExtension(context.system)
  def configurations = new Configuration(settings)

  // Setup implicits
  implicit val myRejectionHandler = Service.rejectionHandler
  implicit val myExceptionHandler = Service.exceptionHandler
  
  // this actor only runs our route, but you could add
  // other things here, like request stream processing
  // or timeout handling
  def receive = runRoute(emRoute)
}

object JsonImplicits extends DefaultJsonProtocol {

  // Create a UUID formatter
  import spray.json._
  implicit object UUIDJsonFormat extends JsonFormat[UUID] {
    def write(x: UUID) = JsString(x.toString())
    def read(value: JsValue) = value match {
      case JsString(x) => java.util.UUID.fromString(x)
      case x => deserializationError("Expected UUID as JsString, but got " + x)
    }
  }

  implicit val implItem = jsonFormat5(Item)
  implicit val implUser = jsonFormat2(User)
  implicit val implSecurityContext = jsonFormat5(SecurityContext)
  implicit val implAuthenticatePayload = jsonFormat1(AuthenticatePayload)

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
      authenticate(ExtendedAuth(authenticateAuthenticator)) { securityContext =>
        complete {
          securityContext
        }
      }
    } ~
    getItems{ userUUID =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == userUUID){
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
        complete("{\"uuid\":\"" + uuid + "\"}")
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
  
  def authenticateAuthenticator: ExtendedMindAuthenticateUserPassAuthenticator = {
    inject[ExtendedMindAuthenticateUserPassAuthenticator] (by default new ExtendedMindAuthenticateUserPassAuthenticatorImpl)
  }
  
  def authenticator: ExtendedMindUserPassAuthenticator = {
    inject[ExtendedMindUserPassAuthenticator] (by default new ExtendedMindUserPassAuthenticatorImpl)
  }
  
  def graphDatabase: GraphDatabase = {
    inject[GraphDatabase]
  }
}
