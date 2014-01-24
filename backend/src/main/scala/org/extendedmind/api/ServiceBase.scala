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

// this class defines our service behavior independently from the service actor
trait ServiceBase extends API with Injectable {

  // Settings and configuration need to be initialized in the child class
  def settings: Settings
  def configurations: Injector

  implicit val implModules = configurations
  implicit val implSettings = settings
  implicit val executor = actorRefFactory.dispatcher

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
