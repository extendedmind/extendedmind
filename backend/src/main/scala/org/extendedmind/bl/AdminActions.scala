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
    
  def resetTokens()(implicit log: LoggingAdapter): Response[CountResult] = {
    log.info("resetTokens")
    db.destroyAllTokens
  }
  
  def rebuildItemsIndex(ownerUUID: UUID)(implicit log: LoggingAdapter): Response[CountResult] = {
    log.info("rebuildItemsIndex")
    db.rebuildItemsIndex(ownerUUID)
  }
  
  def rebuildItemsIndexes(implicit log: LoggingAdapter): Response[CountResult] = {
    log.info("rebuildItemsIndexes")
    val result = db.rebuildItemsIndexes
    if (result.isRight){
      log.info("rebuilt " + result.right.get.count + " items indexes")
    }
    result
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
  
  def tick(priority: Int)(implicit log: LoggingAdapter): Boolean = {
    if (priority == 1){
      // Minute
      log.info("tick minute")
      true
    }else if (priority == 2){
      // Hourly
      log.info("tick hourly")
      true
    }else if (priority == 3){
      // Daily
      log.info("tick daily")
      true
    }else{
      log.error("invalid tick priority: " + priority)
      false
    }
  }
  
}

class AdminActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends AdminActions with Injectable {
  def db = inject[GraphDatabase]
}
