package org.extendedmind.bl

import org.extendedmind.domain._
import org.extendedmind.db._
import org.extendedmind._
import org.extendedmind.Response._
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.security._
import java.util.UUID
import akka.event.LoggingAdapter

trait AdminActions {

  def db: GraphDatabase;

  def rebuildUserIndexes()(implicit log: LoggingAdapter): Response[CountResult] = {
    log.info("rebuildUserIndex")
    db.rebuildUserIndexes
  }
  
  def rebuildInviteRequestsIndex()(implicit log: LoggingAdapter): Response[CountResult] = {
    log.info("rebuildInvitesIndex")
    db.rebuildInviteRequestsIndex
  }
  
  def resetTokens()(implicit log: LoggingAdapter): Response[CountResult] = {
    log.info("resetTokens")
    db.destroyAllTokens
  }
  
  def rebuildItemsIndex(ownerUUID: UUID)(implicit log: LoggingAdapter): Response[CountResult] = {
    log.info("rebuildItemsIndex")
    db.rebuildItemsIndex(ownerUUID)
  }
  
  def migrateToLists(ownerUUID: UUID)(implicit log: LoggingAdapter): Response[CountResult] = {
    log.info("migrateToLists")
    val countResult = db.migrateToLists(ownerUUID)
    if (countResult.isRight) log.info("migrated " + countResult.right.get.count + " projects to lists")
    countResult
  }

  def loadDatabase(implicit log: LoggingAdapter): Boolean = {
    log.info("loadDatabase")
    db.loadDatabase
  }
  
  def checkDatabase(implicit log: LoggingAdapter): Boolean = {
    log.info("checkDatabase")
    db.checkDatabase
  }
  
  def shutdown(implicit log: LoggingAdapter): Unit = {
    log.info("shutdown")
    db.shutdownServer
  }
  
}

class AdminActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends AdminActions with Injectable {
  def db = inject[GraphDatabase]
}
