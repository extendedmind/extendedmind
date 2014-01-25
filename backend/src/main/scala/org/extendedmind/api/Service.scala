package org.extendedmind.api

import scala.concurrent.Future
import org.extendedmind._
import org.extendedmind.api._
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
    ExceptionHandler {
      case e: TokenExpiredException => ctx => {
        val currentTime = System.currentTimeMillis()
        log.error("Status code: " + Forbidden + ": " + e.description + " @" + currentTime)
        ctx.complete(Forbidden, e.description)
      }
      case e: InvalidParameterException => ctx => {
        val currentTime = System.currentTimeMillis()
        log.error("Status code: " + BadRequest + ": " + e.description + " @" + currentTime)
        ctx.complete(BadRequest, e.description + " @" + currentTime)
      }
      case e: InternalServerErrorException => ctx => {
        val currentTime = System.currentTimeMillis()
        log.error("Status code: " + InternalServerError + ": " + e.description + " @" + currentTime)
        ctx.complete(InternalServerError, e.description + " @" + currentTime)
      }
      case t: Throwable => ctx => {
        val currentTime = System.currentTimeMillis()
        log.error(t, "Status code: " + InternalServerError + ": " + t.getMessage() + " @" + currentTime)
        ctx.complete(InternalServerError, "Unknown error occured @" + currentTime)
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
  implicit def implRejectionHandler(implicit log: LoggingContext) = Service.rejectionHandler
  implicit def implExceptionHandler(implicit log: LoggingContext) = Service.exceptionHandler

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
    runRoute(route)
  }
}

// this class defines our service behavior independently from the service actor
trait Service extends AdminService 
			  with SecurityService 
			  with UserService 
			  with InviteService 
			  with ItemService
			  with TaskService
			  with NoteService
			  with ListService
			  with TagService {

  import JsonImplicits._
  
  val route = {
    getRoot {
      complete {
        "Extended Mind backend is running"  
      }
    } ~ adminRoutes ~ securityRoutes ~ userRoutes ~ inviteRoutes ~ itemRoutes ~ taskRoutes ~ noteRoutes ~ listRoutes ~ tagRoutes
  }
}
