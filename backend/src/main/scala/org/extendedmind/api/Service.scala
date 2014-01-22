package org.extendedmind.api

import scala.concurrent.Future
import org.extendedmind._
import org.extendedmind.Response._
import org.extendedmind.bl._
import org.extendedmind.security._
import org.extendedmind.security.Authentication._
import org.extendedmind.security.Authorization._
import org.extendedmind.domain._
import org.extendedmind.domain.Owner._
import org.extendedmind.db._
import scaldi._
import spray.http._
import StatusCodes._
import spray.httpx.SprayJsonSupport._
import spray.json._
import spray.routing._
import AuthenticationFailedRejection._
import java.util.UUID
import spray.can.Http
import spray.util._
import scala.concurrent.duration._
import MediaTypes._

object Service {
  def rejectionHandler: RejectionHandler = {
    RejectionHandler.apply {
      case AuthenticationFailedRejection(cause, authenticator) :: _ =>
        val rejectionMessage = cause match {
          case CredentialsMissing ⇒ "The resource requires authentication, which was not supplied with the request"
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

  override def preStart = {
    // Load database on start
    if (!adminActions.loadDatabase){
      throw new RuntimeException("Could not load database")
    }
  }
  
  // this actor only runs our route, but you could add
  // other things here, like request stream processing
  // or timeout handling
  def receive = {
    runRoute(emRoute)
  }
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
        authorize(settings.signUpMethod == SIGNUP_ON) {
          entity(as[SignUp]) { signUp =>
            complete {
              Future[SetResult] {
                userActions.signUp(signUp) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      postChangeUserType { (userUUID, userType) =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can change user type
          authorize(adminAccess(securityContext)) {
            complete {
              Future[SetResult] {
                userActions.changeUserType(userUUID, userType) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getUser { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can get users for now
          authorize(adminAccess(securityContext)) {
            parameters("email") { email =>
              complete {
                Future[PublicUser] {
                  userActions.getPublicUser(email) match {
                    case Right(publicUser) => publicUser
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      postInviteRequest { url =>
        authorize(settings.signUpMethod != SIGNUP_OFF) {
          entity(as[InviteRequest]) { inviteRequest =>
            complete {
              Future[SetResult] {
                inviteActions.requestInvite(inviteRequest) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putInviteRequest { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can put invite requests
          authorize(adminAccess(securityContext) && settings.signUpMethod != SIGNUP_OFF) {
            entity(as[InviteRequest]) { inviteRequest =>
              complete {
                Future[SetResult] {
                  inviteActions.putNewInviteRequest(inviteRequest) match {
                    case Right(sr) => sr
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      deleteInviteRequest { inviteRequestUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can destroy invite requests
          authorize(adminAccess(securityContext)) {
            complete {
              Future[DestroyResult] {
                inviteActions.destroyInviteRequest(inviteRequestUUID) match {
                  case Right(result) => result
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getInviteRequests { path =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[InviteRequests] {
                inviteActions.getInviteRequests match {
                  case Right(inviteRequests) => inviteRequests
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getInviteRequestQueueNumber { inviteRequestUUID =>
        complete {
          Future[InviteRequestQueueNumber] {
            inviteActions.getInviteRequestQueueNumber(inviteRequestUUID) match {
              case Right(queueNumber) => queueNumber
              case Left(e) => processErrors(e)
            }
          }
        }
      } ~
      postInviteRequestAccept { inviteRequestUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can accept invite requests
          authorize(adminAccess(securityContext) && settings.signUpMethod != SIGNUP_OFF) {
            entity(as[Option[InviteRequestAcceptDetails]]) { details =>
              complete {
                Future[SetResult] {
                  inviteActions.acceptInviteRequest(securityContext.userUUID, inviteRequestUUID, details) match {
                    case Right(result) => result._1
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      getInvite { code =>
        parameters("email") { email =>
          complete {
            Future[Invite] {
              inviteActions.getInvite(code, email) match {
                case Right(invite) => invite
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      getInvites { path =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[Invites] {
                inviteActions.getInvites match {
                  case Right(invites) => invites
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      postInviteAccept { code =>
        authorize(settings.signUpMethod != SIGNUP_OFF) {
          entity(as[SignUp]) { signUp =>
            complete {
              Future[SetResult] {
                inviteActions.acceptInvite(code, signUp) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
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
      postLogout { url =>
        authenticate(ExtendedAuth(authenticator, "logout", None)) { securityContext =>
          entity(as[Option[LogoutPayload]]) { payload =>
            complete {
              Future[CountResult] {
                securityActions.logout(securityContext.userUUID, payload) match {
                  case Right(deleteCount) => deleteCount
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putChangePassword { url =>
        authenticate(ExtendedAuth(authenticator, "secure", None)) { securityContext =>
          entity(as[NewPassword]) { newPassword =>
            complete {
              Future[CountResult] {
                securityActions.changePassword(securityContext.userUUID, newPassword.password) match {
                  case Right(deleteCount) => deleteCount
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getAccount { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          complete {
            Future[User] {
              userActions.getUser(securityContext.userUUID) match {
                case Right(user) => user
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      putAccount { url =>
        authenticate(ExtendedAuth(authenticator, "secure", None)) { securityContext =>
          entity(as[User]) { user =>
            complete {
              Future[SetResult] {
                userActions.putUser(securityContext.userUUID, user) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putNewCollective { url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can create new collectives for now
          authorize(adminAccess(securityContext)) {
            entity(as[Collective]) { collective =>
              complete {
                Future[SetResult] {
                  collectiveActions.putNewCollective(securityContext.userUUID, collective) match {
                    case Right(sr) => sr
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      putExistingCollective { collectiveUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can update collectives for now
          authorize(adminAccess(securityContext)) {
            entity(as[Collective]) { collective =>
              complete {
                Future[SetResult] {
                  collectiveActions.putExistingCollective(collectiveUUID, collective) match {
                    case Right(sr) => sr
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      getCollective { collectiveUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only admins can get collectives for now
          authorize(adminAccess(securityContext)) {
            complete {
              Future[Collective] {
                collectiveActions.getCollective(collectiveUUID) match {
                  case Right(collective) => collective
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      postCollectiveUserPermission { (collectiveUUID, userUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          // Only founder admin can assign people to exclusive collectives for now
          authorize(adminAccess(securityContext)) {
            entity(as[UserAccessRight]) { userAccessRight =>
              complete {
                Future[SetResult] {
                  collectiveActions.setCollectiveUserPermission(collectiveUUID, securityContext.userUUID, userUUID, userAccessRight.access) match {
                    case Right(sr) => sr
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      getItems { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(readAccess(ownerUUID, securityContext)) {
            complete {
              Future[Items] {
                itemActions.getItems(getOwner(ownerUUID, securityContext)) match {
                  case Right(items) => items
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getItem { (ownerUUID, itemUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(readAccess(ownerUUID, securityContext)) {
            complete {
              Future[Item] {
                itemActions.getItem(getOwner(ownerUUID, securityContext), itemUUID) match {
                  case Right(item) => item
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putNewItem { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Item]) { item =>
              complete {
                Future[SetResult] {
                  itemActions.putNewItem(getOwner(ownerUUID, securityContext), item) match {
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
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Item]) { item =>
              complete {
                Future[SetResult] {
                  itemActions.putExistingItem(getOwner(ownerUUID, securityContext), itemUUID, item) match {
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
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[DeleteItemResult] {
                itemActions.deleteItem(getOwner(ownerUUID, securityContext), itemUUID) match {
                  case Right(dir) => dir
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      undeleteItem { (ownerUUID, itemUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[SetResult] {
                itemActions.undeleteItem(getOwner(ownerUUID, securityContext), itemUUID) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getTask { (ownerUUID, taskUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(readAccess(ownerUUID, securityContext)) {
            complete {
              Future[Task] {
                taskActions.getTask(getOwner(ownerUUID, securityContext), taskUUID) match {
                  case Right(task) => task
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putNewTask { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Task]) { task =>
              complete {
                Future[SetResult] {
                  taskActions.putNewTask(getOwner(ownerUUID, securityContext), task) match {
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
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Task]) { task =>
              complete {
                Future[SetResult] {
                  taskActions.putExistingTask(getOwner(ownerUUID, securityContext), taskUUID, task) match {
                    case Right(sr) => sr
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      deleteTask { (ownerUUID, taskUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[DeleteItemResult] {
                taskActions.deleteTask(getOwner(ownerUUID, securityContext), taskUUID) match {
                  case Right(dir) => dir
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      undeleteTask { (ownerUUID, taskUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[SetResult] {
                taskActions.undeleteTask(getOwner(ownerUUID, securityContext), taskUUID) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      completeTask { (ownerUUID, taskUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[CompleteTaskResult] {
                taskActions.completeTask(getOwner(ownerUUID, securityContext), taskUUID) match {
                  case Right(task) => task
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      uncompleteTask { (ownerUUID, taskUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[SetResult] {
                taskActions.uncompleteTask(getOwner(ownerUUID, securityContext), taskUUID) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getNote { (ownerUUID, noteUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(readAccess(ownerUUID, securityContext)) {
            complete {
              Future[Note] {
                noteActions.getNote(getOwner(ownerUUID, securityContext), noteUUID) match {
                  case Right(note) => note
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putNewNote { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Note]) { note =>
              complete {
                Future[SetResult] {
                  noteActions.putNewNote(getOwner(ownerUUID, securityContext), note) match {
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
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Note]) { note =>
              complete {
                Future[SetResult] {
                  noteActions.putExistingNote(getOwner(ownerUUID, securityContext), noteUUID, note) match {
                    case Right(sr) => sr
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      deleteNote { (ownerUUID, noteUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[DeleteItemResult] {
                noteActions.deleteNote(getOwner(ownerUUID, securityContext), noteUUID) match {
                  case Right(dir) => dir
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      undeleteNote { (ownerUUID, noteUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            complete {
              Future[SetResult] {
                noteActions.undeleteNote(getOwner(ownerUUID, securityContext), noteUUID) match {
                  case Right(sr) => sr
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getTag { (ownerUUID, tagUUID) =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(readAccess(ownerUUID, securityContext)) {
            complete {
              Future[Tag] {
                tagActions.getTag(getOwner(ownerUUID, securityContext), tagUUID) match {
                  case Right(tag) => tag
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      putNewTag { ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Tag]) { tag =>
              complete {
                Future[SetResult] {
                  tagActions.putNewTag(getOwner(ownerUUID, securityContext), tag) match {
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
        authenticate(ExtendedAuth(authenticator, "user", Some(ownerUUID))) { securityContext =>
          authorize(writeAccess(ownerUUID, securityContext)) {
            entity(as[Tag]) { tag =>
              complete {
                Future[SetResult] {
                  tagActions.putExistingTag(getOwner(ownerUUID, securityContext), tagUUID, tag) match {
                    case Right(sr) => sr
                    case Left(e) => processErrors(e)
                  }
                }
              }
            }
          }
        }
      } ~
      resetTokens{ url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                adminActions.resetTokens match {
                  case Right(result) => result
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      rebuildItemsIndex{ ownerUUID =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                adminActions.rebuildItemsIndex(ownerUUID) match {
                  case Right(result) => result
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      rebuildUserIndexes{ url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              Future[CountResult] {
                adminActions.rebuildUserIndexes match {
                  case Right(result) => result
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      shutdown{ url =>
        authenticate(ExtendedAuth(authenticator, "user", None)) { securityContext =>
          authorize(adminAccess(securityContext)) {
            complete {
              adminActions.shutdown
              in(1.second){ actorSystem.shutdown() }
              "Shutting down in 1 second..."
            }
          }
        }
      }
  }

  def authenticateAuthenticator: ExtendedMindAuthenticateUserPassAuthenticator = {
    inject[ExtendedMindAuthenticateUserPassAuthenticator](by default new ExtendedMindAuthenticateUserPassAuthenticatorImpl)
  }

  def authenticator: ExtendedMindUserPassAuthenticator = {
    inject[ExtendedMindUserPassAuthenticator](by default new ExtendedMindUserPassAuthenticatorImpl)
  }

  def securityActions: SecurityActions = {
    inject[SecurityActions]
  }

  def userActions: UserActions = {
    inject[UserActions]
  }

  def inviteActions: InviteActions = {
    inject[InviteActions]
  }
  
  def collectiveActions: CollectiveActions = {
    inject[CollectiveActions]
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
  
  def adminActions: AdminActions = {
    inject[AdminActions]
  }
  
  def in[U](duration: FiniteDuration)(body: => U): Unit =
    actorSystem.scheduler.scheduleOnce(duration)(body)

}
