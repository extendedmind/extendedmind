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
import akka.event.LoggingAdapter

// this class defines our service behavior independently from the service actor
trait ServiceBase extends API with Injectable {

  // Settings, configuration and logging need to be initialized in the child class
  def settings: Settings
  def configurations: Injector
  def putMdc(mdc: Map[String, Any])
  def processResult[T <: Any](result: T): T
  def processNewItemResult(itemType: String, result: SetResult): SetResult
  
  def logErrors(errors: scala.List[ResponseContent])

  implicit val implModules = configurations
  implicit val implSettings = settings
  implicit val executor = actorRefFactory.dispatcher
  implicit val log: LoggingAdapter = LoggingContext.fromActorRefFactory(actorRefFactory)
  implicit val implLogErrors = logErrors _
  
  def setLogContext(sc: SecurityContext, ownerUUID: UUID): Unit = {
    setLogContext(sc, Some(ownerUUID))
  }
  
  def setLogContext(sc: SecurityContext, ownerUUID: UUID, itemUUID: UUID): Unit = {
    setLogContext(sc, Some(ownerUUID), Some(itemUUID))
  }
  
  def setLogContext(sc: SecurityContext, ownerUUID: Option[UUID] = None, itemUUID: Option[UUID] = None): Unit = {
    if (ownerUUID.isDefined){
      if (ownerUUID.get != sc.userUUID && itemUUID.isDefined){
        return putMdc(Map("user" -> sc.userUUID.toString, "collective" -> ownerUUID.get.toString(), "item" -> itemUUID.get.toString))
      } else if (ownerUUID.get != sc.userUUID && itemUUID.isEmpty){
        return putMdc(Map("user" -> sc.userUUID.toString, "collective" -> ownerUUID.get.toString()))
      } else if (ownerUUID.get == sc.userUUID && itemUUID.isDefined){
        return putMdc(Map("user" -> sc.userUUID.toString, "item" -> itemUUID.get.toString()))
      }
    }
    return putMdc(Map("user" -> sc.userUUID.toString))
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

  def listActions: ListActions = {
    inject[ListActions]
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
