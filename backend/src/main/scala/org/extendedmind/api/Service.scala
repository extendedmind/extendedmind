/**
 * Copyright (c) 2011-2017 Extended Mind Technologies Oy
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

  final val FAILURE_STATUS_RESPONSE = "{\"status\":false}"

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
        } else if (e.code.number == ERR_BASE_HA_FAILURE.number){
          // Don't log an error as these are to expected
          ctx.complete(NotFound, FAILURE_STATUS_RESPONSE)
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
      case e: NotAcceptableErrorException => ctx => {
        val currentTime = System.currentTimeMillis()
        log.error("Status code: " + NotAcceptable + ", Description: " + e.description + " @" + currentTime)
        ctx.complete(NotAcceptable, e.description)
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
  def configurations = new Configuration(settings, actorRefFactory, context.system)

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
    })
  }

  // Setup implicits
  implicit def implRejectionHandler = Service.rejectionHandler
  implicit def implExceptionHandler = Service.exceptionHandler

  override def preStart = {
    log.debug("actor system preStart begin..");
    // Load database on start
    val futureLoadResponse = adminActions.loadDatabase
    futureLoadResponse onSuccess {
      case false => throw new RuntimeException("Could not load database")
      case true => log.info("loadDatabase success")
    }
    log.debug("...actor system preStart end");
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
        with OwnerService
        with UserService
        with CollectiveService
        with ItemService
        with TaskService
        with NoteService
        with ListService
        with TagService
        with InviteService {

  import JsonImplicits._
  implicit val implTick = jsonFormat1(Tick.apply)

  final val SUCCESS_STATUS_RESPONSE = "{\"status\":true}"

  val route = {
    v2GetRoot {
      complete {
        "{\"version\":\"" + settings.version + "\"}"
      }
    } ~
    v2Shutdown {
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
    v2Tick {
      entity(as[Tick]) { payload =>
        complete {
          "{\"status\":" + adminActions.tick(payload.priority).toString + "}"
        }
      }
    } ~
    v2GetInfo {
      parameters('latest ? false, 'history ? false) { (latest, history)=>
        complete {
          Future[Info] {
            adminActions.getInfo(latest, history) match {
              case Right(info) => processResult(info)
              case Left(e) => processErrors(e)
            }
          }
        }
      }
    } ~
    v2GetHAReady { url =>
      complete {
        adminActions.getHAStatus.map(haStatus => {
           val ready: Boolean = settings.operationMode match {
             case HA_BOOTSTRAP => {
               (haStatus == "master" || haStatus == "slave" || haStatus == "pending")
             }
             case HA => {
               (haStatus == "master" || haStatus == "slave")
             }
             case SINGLE => {
               (haStatus == "master")
             }
          }
          if (ready) processResult(SUCCESS_STATUS_RESPONSE)
          else throw new InvalidParameterException(ERR_BASE_HA_FAILURE, "HA not ready")
        })
      }
    } ~
    v2GetHAAvailable { url =>
      complete {
        adminActions.getHAStatus.map(haStatus => {
          if (haStatus == "master" || haStatus == "slave") processResult(SUCCESS_STATUS_RESPONSE)
          else throw new InvalidParameterException(ERR_BASE_HA_FAILURE, "HA not available")
        })
      }
    } ~
    v2GetHAMaster { url =>
      complete {
        adminActions.getHAStatus.map(haStatus => {
          if (haStatus == "master") processResult(SUCCESS_STATUS_RESPONSE)
          else throw new InvalidParameterException(ERR_BASE_HA_FAILURE, "HA not master")
        })
      }
    } ~
    v2GetHASlave { url =>
      complete {
        adminActions.getHAStatus.map(haStatus => {
          if (haStatus == "slave") processResult(SUCCESS_STATUS_RESPONSE)
          else throw new InvalidParameterException(ERR_BASE_HA_FAILURE, "HA not slave")
        })
      }
    } ~ adminRoutes ~ securityRoutes ~ ownerRoutes ~ userRoutes ~ collectiveRoutes ~ itemRoutes ~ taskRoutes ~ noteRoutes ~ listRoutes ~ tagRoutes ~ inviteRoutes
  }
}
