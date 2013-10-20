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

  def logout(userUUID: UUID, payload: Option[LogoutPayload])(implicit log: LoggingContext): Response[DeleteCountResult] = {
    log.info("logout: user {} payload {}", userUUID, payload)
    if (payload.isEmpty || payload.get.clearAll == false)
      Right(DeleteCountResult(1))
    else{
      db.destroyTokens(userUUID) match {
        case Right(deleteCount) => Right(DeleteCountResult(deleteCount.deleteCount + 1))
        case Left(e) => Left(e)
      }
    }
  }
  
  /*
  def changePassword(securityContext: SecurityContext, newPassword: String)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("changePassword: user {}", securityContext.userUUID)
    db.changePassword(securityContext)
  }*/
}

class SecurityActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends SecurityActions with Injectable {
  def db = inject[GraphDatabase]
}
