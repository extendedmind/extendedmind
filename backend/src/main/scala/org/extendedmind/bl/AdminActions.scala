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

  def getStatistics()(implicit log: LoggingAdapter): Response[Statistics] = {
    log.info("getStatistics")
    db.getStatistics
  }
  
  def rebuildUserIndexes()(implicit log: LoggingAdapter): Response[CountResult] = {
    log.info("rebuildUserIndexes")
    db.rebuildUserIndexes
  }
  
  def upgradeOwners()(implicit log: LoggingAdapter): Response[CountResult] = {
    log.info("upgradeOwners")
    db.upgradeOwners
  }
  
  def upgradeOwner(ownerUUID: UUID)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("upgradeOwner: {}" + ownerUUID)
    db.upgradeOwner(ownerUUID)
  }
  
  def upgradeItems()(implicit log: LoggingAdapter): Response[CountResult] = {
    log.info("upgradeItems")
    val countResult = db.upgradeItems
    if (countResult.isRight){    
      log.info("upgraded " + countResult.right.get.count + " items")
    }
    countResult
  }
  
  def upgradeInvites()(implicit log: LoggingAdapter): Response[CountResult] = {
    log.info("upgradeInvites")
    db.upgradeInvites
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
