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
import spray.util.LoggingContext

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
  
  def exceptionHandler(implicit log: LoggingContext): ExceptionHandler = {
    val currentTime = System.currentTimeMillis()

    ExceptionHandler.apply {
      case e: TokenExpiredException => ctx => {
        log.error(e, "Status code: " + 419 + " @" + currentTime)
        ctx.complete(419, e.description)
      } 
      case e: InvalidParameterException => ctx => {
        log.error(e, "Status code: " + BadRequest + " @" + currentTime)
        ctx.complete(BadRequest, e.description + " @" + currentTime)
      }
      case e: InternalServerErrorException => ctx => {
        log.error(e, "Status code: " + InternalServerError + " @" + currentTime)        
        ctx.complete(InternalServerError, e.description + " @" + currentTime)
      }
      case t: Throwable => ctx => {
        log.error(t, "Status code: " + InternalServerError + " @" + currentTime)        
        ctx.complete(InternalServerError, "Unknown error occured  @" + currentTime)        
      }
    }
  }  
}

// we don't implement our route structure directly in the service actor because
// we want to be able to test it independently, without having to spin up an actor
class ServiceActor extends HttpServiceActor with Service {
  
  // Implement abstract field from Service
  def settings = SettingsExtension(context.system)
  def configurations = new Configuration(settings, actorRefFactory)

  // Setup implicits
  implicit val implRejectionHandler = Service.rejectionHandler 
  implicit val implExceptionHandler = Service.exceptionHandler

  // this actor only runs our route, but you could add
  // other things here, like request stream processing
  // or timeout handling
  def receive = runRoute(emRoute)
}

// this class defines our service behavior independently from the service actor
trait Service extends API with Injectable {

  // Settings and configuration need to be initialized in the child class
  def settings: Settings
  def configurations: Injector

  implicit val implModules = configurations
  implicit val implSettings = settings
  implicit val executor = actorRefFactory.dispatcher

  import JsonImplicits._
  
  val emRoute = {
    getRoot {
      complete {
        "Extended Mind backend is running"
      }
    } ~
    postSignUp { url =>
      entity(as[SignUp]) { signUp =>
        complete{
          Future[SetResult] {
            userActions.signUp(signUp) match {
              case Right(sr) => sr
              case Left(e) => processErrors(e)
            }
          }
        }
      }
    } ~
    postInviteRequest { url =>
      entity(as[InviteRequest]) { inviteRequest =>
        complete{
          Future[SetResult] {
            userActions.requestInvite(inviteRequest) match {
              case Right(sr) => sr
              case Left(e) => processErrors(e)
            }
          }
        }
      }
    } ~
    getInviteRequests { path =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userType == 0){
          complete {
            Future[List[InviteRequest]] {
              userActions.getInviteRequests match {
                case Right(inviteRequests) => inviteRequests
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }
    } ~ 
    getInviteRequestQueueNumber { inviteRequestUUID =>
      complete{
        Future[InviteRequestQueueNumber] {
          userActions.getInviteRequestQueueNumber(inviteRequestUUID) match {
            case Right(queueNumber) => queueNumber
            case Left(e) => processErrors(e)
          }
        }
      }
    } ~ 
    postAuthenticate { url =>
      authenticate(ExtendedAuth(authenticateAuthenticator)) { securityContext =>
        complete {
          securityContext
        }
      }
    } ~
    getItems{ ownerUUID =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == ownerUUID){
		      complete {
		        Future[Items] {
		          itemActions.getItems(ownerUUID) match {
                case Right(items) => items
                case Left(e) => processErrors(e)
		          }
		        }
		      }
        }
      }
    } ~ 
    getItem { (ownerUUID, itemUUID) =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == ownerUUID){
          complete{
            Future[Item] {
              itemActions.getItem(ownerUUID, itemUUID) match {
                case Right(item) => item
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }      
    } ~
    putNewItem { ownerUUID =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == ownerUUID){
          entity(as[Item]) { item =>
            complete{
              Future[SetResult]{
                itemActions.putNewItem(ownerUUID, item) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      }
    } ~
    putExistingItem { (ownerUUID, itemUUID) =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == ownerUUID){
          entity(as[Item]) { item =>
            complete{
              Future[SetResult]{
                itemActions.putExistingItem(ownerUUID, itemUUID, item) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      }
    } ~
    deleteItem { (ownerUUID, itemUUID) =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == ownerUUID){
          complete{
            Future[DeleteItemResult]{
              itemActions.deleteItem(ownerUUID, itemUUID) match {
                case Right(dir) => dir
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }
    } ~
    undeleteItem { (ownerUUID, itemUUID) =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == ownerUUID){
          complete{
            Future[SetResult]{
              itemActions.undeleteItem(ownerUUID, itemUUID) match {
                case Right(sr) => sr
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }
    } ~
    getTask { (ownerUUID, taskUUID) =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == ownerUUID){
          complete{
            Future[Task] {
              taskActions.getTask(ownerUUID, taskUUID) match {
                case Right(task) => task
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }
    } ~
    putNewTask { ownerUUID =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == ownerUUID){
          entity(as[Task]) { task =>
            complete {
              Future[SetResult] {
                taskActions.putNewTask(ownerUUID, task) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      }
    } ~
    putExistingTask { (ownerUUID, taskUUID) =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == ownerUUID){
          entity(as[Task]) { task =>
            complete {
              Future[SetResult] {
                taskActions.putExistingTask(ownerUUID, taskUUID, task) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      }
    } ~
    completeTask { (ownerUUID, taskUUID) =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == ownerUUID){
          complete{
            Future[CompleteTaskResult] {
              taskActions.completeTask(ownerUUID, taskUUID) match {
                case Right(task) => task
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }
    } ~
    uncompleteTask { (ownerUUID, taskUUID) =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == ownerUUID){
          complete{
            Future[SetResult] {
              taskActions.uncompleteTask(ownerUUID, taskUUID) match {
                case Right(sr) => sr
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }
    } ~
    getNote { (ownerUUID, noteUUID) =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == ownerUUID){
          complete{
            Future[Note] {
              noteActions.getNote(ownerUUID, noteUUID) match {
                case Right(note) => note
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }
    } ~
    putNewNote { ownerUUID =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == ownerUUID){
          entity(as[Note]) { note =>
            complete {
              Future[SetResult] {
                noteActions.putNewNote(ownerUUID, note) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      }
    } ~
    putExistingNote { (ownerUUID, noteUUID) =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == ownerUUID){
          entity(as[Note]) { note =>
            complete {
              Future[SetResult] {
                noteActions.putExistingNote(ownerUUID, noteUUID, note) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }       
        }
      }
    } ~
    getTag{ (ownerUUID, tagUUID) =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == ownerUUID){
          complete {
            Future[Tag] {
              tagActions.getTag(ownerUUID, tagUUID) match {
                case Right(tag) => tag
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      }
    } ~
    putNewTag { ownerUUID =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == ownerUUID){
          entity(as[Tag]) { tag =>
            complete {
              Future[SetResult] {
                tagActions.putNewTag(ownerUUID, tag) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      }
    } ~
    putExistingTag { (ownerUUID, tagUUID) =>
      authenticate(ExtendedAuth(authenticator, "user")) { securityContext =>
        authorize(securityContext.userUUID == ownerUUID){
          entity(as[Tag]) { tag =>
            complete {
              Future[SetResult] {
                tagActions.putExistingTag(ownerUUID, tagUUID, tag) match {
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
  
  def authenticateAuthenticator: ExtendedMindAuthenticateUserPassAuthenticator = {
    inject[ExtendedMindAuthenticateUserPassAuthenticator] (by default new ExtendedMindAuthenticateUserPassAuthenticatorImpl)
  }
  
  def authenticator: ExtendedMindUserPassAuthenticator = {
    inject[ExtendedMindUserPassAuthenticator] (by default new ExtendedMindUserPassAuthenticatorImpl)
  }
  
  def securityActions: SecurityActions = {
    inject[SecurityActions]
  }
  
  def userActions: UserActions = {
    inject[UserActions]
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
  
  def tagActions: TagActions = {
    inject[TagActions]
  }

}
