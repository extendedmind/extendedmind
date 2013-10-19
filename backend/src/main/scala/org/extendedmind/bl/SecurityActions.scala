package org.extendedmind.bl

import org.extendedmind.domain._
import org.extendedmind.db._
import org.extendedmind._
import org.extendedmind.Response._
import scaldi.Injector
import scaldi.Injectable
import spray.util.LoggingContext
import org.extendedmind.security._

trait SecurityActions {

  def db: GraphDatabase;
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
