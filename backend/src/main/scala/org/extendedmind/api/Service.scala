/**
 * Copyright (c) 2013-2014 Extended Mind Technologies Oy
 *
 * This file is part of Extended Mind.
 *
 * Extended Mind is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

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
import akka.event._
import scala.collection.JavaConverters._

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

  def exceptionHandler(implicit log: LoggingAdapter): ExceptionHandler = {

    import JsonImplicits.implErrorResult
    ExceptionHandler {
      case e: InvalidAuthenticationException => ctx => {
        val currentTime = System.currentTimeMillis()
        log.error("Status code: " + Forbidden + ", Error code: " + e.code.number + ", Description: " + e.description + " @" + currentTime)
        ctx.complete(Forbidden, ErrorResult(e.code.number, e.description, currentTime))
      }
      case e: InvalidParameterException => ctx => {
        val currentTime = System.currentTimeMillis()
        if (e.code.number == ERR_BASE_WRONG_EXPECTED_MODIFIED.number){
          log.error("Status code: " + Conflict + ", Error code: " + e.code.number + ", Description: " + e.description + " @" + currentTime)
          ctx.complete(Conflict, ErrorResult(e.code.number, e.description, currentTime))
        }else{
          log.error("Status code: " + BadRequest + ", Error code: " + e.code.number + ", Description: " + e.description + " @" + currentTime)
          ctx.complete(BadRequest, ErrorResult(e.code.number, e.description, currentTime))
        }
      }
      case e: InternalServerErrorException => ctx => {
        val currentTime = System.currentTimeMillis()
        log.error("Status code: " + InternalServerError + ", Error code: " + e.code.number + ", Description: " + e.description + " @" + currentTime)
        ctx.complete(InternalServerError, ErrorResult(e.code.number, e.description, currentTime))
      }
      case t: Throwable => ctx => {
        val currentTime = System.currentTimeMillis()
        log.error(t, "Status code: " + InternalServerError + ": " + t.getMessage() + " @" + currentTime)
        ctx.complete(InternalServerError, ErrorResult(ERR_BASE_INTERNAL_UNKNOWN.number, "Unknown error occured", currentTime))
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

  // LOGGING WITH MDC

  override implicit val log: DiagnosticLoggingAdapter = Logging(this);
  override def putMdc(mdc: Map[String, Any]) {
    log.mdc(mdc)
  }
  override def processResult[T <: Any](result: T): T = {
    log.clearMDC()
    result
  }
  override def processNewItemResult(itemType: String, result: SetResult): SetResult = {
    val map: scala.collection.mutable.Map[String, Any] = scala.collection.mutable.Map("item" -> result.uuid.get)
    log.mdc.foreach (keyValue => map.put(keyValue._1, keyValue._2))
    log.mdc(map.toMap)
    log.info("new " + itemType)
    log.clearMDC()
    result
  }

  override def logErrors(errors: scala.List[ResponseContent]) = {
    errors foreach (e => {
    	val errorString = e.responseType + ": " + e.description
    	println(errorString)
    	if (e.throwable.isDefined){
    	  log.error(e.throwable.get, errorString)
    	}else{
    	  log.error(errorString)
    	}
      }
    )
  }

  // Setup implicits
  implicit def implRejectionHandler = Service.rejectionHandler
  implicit def implExceptionHandler = Service.exceptionHandler

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
			  with ItemService
			  with TaskService
			  with NoteService
			  with ListService
			  with TagService {

  import JsonImplicits._
  implicit val implTick = jsonFormat1(Tick.apply)

  val route = {
    getRoot {
      complete {
        "{\"version\":\"" + settings.version + "\"}"
      }
    } ~
    shutdown {
      complete {
        in(1.second) {
          // First shut down actor system
          actorSystem.shutdown
          actorSystem.awaitTermination
          // Then shut down Neo4j
          adminActions.shutdown
        }
        "Shutting down in 1 second..."
      }
    } ~
    tick {
      entity(as[Tick]) { payload =>
        complete {
          "{\"status\":" + adminActions.tick(payload.priority).toString + "}"
        }
      }
    } ~
    getHAAvailable { ctx =>
      val haStatus = adminActions.getHAStatus
      if (haStatus == "master" || haStatus == "slave") ctx.complete(200, "true")
      else ctx.complete(NotFound, "false")
    } ~
    getHAMaster { ctx =>
      val haStatus = adminActions.getHAStatus
      if (haStatus == "master") ctx.complete(200, "true")
      else ctx.complete(NotFound, "false")
    } ~
    getHASlave { ctx =>
      val haStatus = adminActions.getHAStatus
      if (haStatus == "slave") ctx.complete(200, "true")
      else ctx.complete(NotFound, "false")
    } ~ adminRoutes ~ securityRoutes ~ userRoutes ~ itemRoutes ~ taskRoutes ~ noteRoutes ~ listRoutes ~ tagRoutes
  }
}
