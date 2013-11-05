package org.extendedmind.bl

import org.extendedmind.domain._
import org.extendedmind.db._
import org.extendedmind._
import org.extendedmind.Response._
import scaldi.Injector
import scaldi.Injectable
import spray.util.LoggingContext
import org.extendedmind.security._
import java.util.UUID

trait SecurityActions {

  def db: GraphDatabase;

  def logout(userUUID: UUID, payload: Option[LogoutPayload])(implicit log: LoggingContext): Response[CountResult] = {
    log.info("logout: user {} payload {}", userUUID, payload)
    if (payload.isEmpty || payload.get.clearAll == false)
      Right(CountResult(1))
    else{
      db.destroyTokens(userUUID) match {
        case Right(deleteCount) => Right(CountResult(deleteCount.count + 1))
        case Left(e) => Left(e)
      }
    }
  }
  
  def changePassword(userUUID: UUID, newPassword: String)(implicit log: LoggingContext): Response[CountResult] = {
    log.info("changePassword: user {}", userUUID)
    db.changePassword(userUUID, newPassword)
    db.destroyTokens(userUUID)
  }
}

class SecurityActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends SecurityActions with Injectable {
  def db = inject[GraphDatabase]
}
