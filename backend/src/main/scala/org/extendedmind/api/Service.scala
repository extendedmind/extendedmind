package org.extendedmind.api

import scala.concurrent.Future
import org.extendedmind._
import org.extendedmind.Response._
import org.extendedmind.bl._
import org.extendedmind.security._
import org.extendedmind.domain._
import org.extendedmind.db._
import scaldi._
import spray.http._
import StatusCodes._
import spray.httpx.SprayJsonSupport._
import spray.json._
import spray.routing._
import AuthenticationFailedRejection._
import java.util.UUID

object Service {
  def rejectionHandler: RejectionHandler = {
    RejectionHandler.apply {
      case AuthenticationFailedRejection(cause, authenticator) :: _ => 
        val rejectionMessage = cause match {
          case CredentialsMissing  ⇒ "The resource requires authentication, which was not supplied with the request"
          case CredentialsRejected ⇒ "The supplied authentication is invalid"
        }
        ctx ⇒ ctx.complete(Forbidden, rejectionMessage)
      case TokenExpiredRejection(description) :: _ => 
        ctx => ctx.complete(419, description)
      case InvalidParameterRejection(description: String, throwable: Option[Throwable]) :: _ => 
        ctx => ctx.complete(BadRequest, description)
      case InternalServerErrorRejection(description: String, throwable: Option[Throwable]) :: _ => 
        ctx => ctx.complete(InternalServerError, description)
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

  implicit val implSetResult = jsonFormat2(SetResult)
  implicit val implItem = jsonFormat4(Item)
  implicit val implTask = jsonFormat11(Task)
  implicit val implNote = jsonFormat10(Note)
  implicit val implItems = jsonFormat3(Items)
  implicit val implUser = jsonFormat3(User)
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
        "Extended Mind backend is running"
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
		        Future[Items] {
		          itemActions.getItems(userUUID) match {
                case Right(items) => items
                case Left(e) => processErrors(e)
		          }
		        }
		      }
        }
      }
    } ~ 
    getItem { (userUUID, itemUUID) =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == userUUID){
          complete{
            Future[Item] {
              itemActions.getItem(userUUID, itemUUID) match {
                case Right(item) => item
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }      
    } ~
    putNewItem { userUUID =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == userUUID){
          entity(as[Item]) { item =>
            complete{
              Future[SetResult]{
                itemActions.putNewItem(userUUID, item) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      }
    } ~
    putExistingItem { (userUUID, itemUUID) =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == userUUID){
          entity(as[Item]) { item =>
            complete{
              Future[SetResult]{
                itemActions.putExistingItem(userUUID, itemUUID, item) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      }
    } ~
    getTask { (userUUID, taskUUID) =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == userUUID){
          complete{
            Future[Task] {
              taskActions.getTask(userUUID, taskUUID) match {
                case Right(task) => task
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }
    } ~
    putNewTask { userUUID =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == userUUID){
          entity(as[Task]) { task =>
            complete {
              Future[SetResult] {
                taskActions.putNewTask(userUUID, task) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      }
    } ~
    putExistingTask { (userUUID, taskUUID) =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == userUUID){
          entity(as[Task]) { task =>
            complete {
              Future[SetResult] {
                taskActions.putExistingTask(userUUID, taskUUID, task) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      }
    } ~
    getNote { (userUUID, noteUUID) =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == userUUID){
          complete{
            Future[Note] {
              noteActions.getNote(userUUID, noteUUID) match {
                case Right(note) => note
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }
    } ~
    putNewNote { userUUID =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == userUUID){
          entity(as[Note]) { note =>
            complete {
              Future[SetResult] {
                noteActions.putNewNote(userUUID, note) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      }
    } ~
    putExistingNote { (userUUID, noteUUID) =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == userUUID){
          entity(as[Note]) { note =>
            complete {
              Future[SetResult] {
                noteActions.putExistingNote(userUUID, noteUUID, note) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }       
        }
      }
    }
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
  
  def itemActions: ItemActions = {
    inject[ItemActions]
  }
  
  def taskActions: TaskActions = {
    inject[TaskActions]
  }
  
  def noteActions: NoteActions = {
    inject[NoteActions]
  }

}
