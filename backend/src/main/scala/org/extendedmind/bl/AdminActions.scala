/**
 * Copyright (c) 2013-2016 Extended Mind Technologies Oy
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
import org.neo4j.kernel.ha.HighlyAvailableGraphDatabase
import org.neo4j.kernel.ha.cluster.HighAvailabilityMemberState

trait AdminActions {

  def db: GraphDatabase;
  def settings: Settings

  def getStatistics()(implicit log: LoggingAdapter): Response[Statistics] = {
    log.info("getStatistics")
    db.getStatistics
  }

  def rebuildUserIndexes()(implicit log: LoggingAdapter): Response[CountResult] = {
    log.info("rebuildUserIndexes")
    db.rebuildUserIndexes
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

  def upgradePublishedNotes(ownerUUID: UUID)(implicit log: LoggingAdapter): Response[CountResult] = {
    log.info("upgradePublishedNotes")
    val result = db.upgradePublishedNotes(ownerUUID)
    if (result.isRight){
      log.info("upgraded " + result.right.get.count + " published items for owner " + ownerUUID)
    }
    result
  }

  def getItemStatistics(uuid: UUID)(implicit log: LoggingAdapter): Response[NodeStatistics] = {
    log.info("getItemStatistics")
    db.getItemStatistics(uuid)
  }

  def getOwnerStatistics(uuid: UUID)(implicit log: LoggingAdapter): Response[NodeStatistics] = {
    log.info("getOwnerStatistics")
    db.getOwnerStatistics(uuid)
  }

  def setItemProperty(uuid: UUID, property: NodeProperty)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("setItemProperty")
    db.setItemProperty(uuid, property.key, property.stringValue, property.longValue)
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
      db.destroyDeletedOwners match {
        case Right(CountResult(deleteCount)) => {
          log.info("Destroyed {} deleted users", deleteCount)
          true
        } case Left(errors) =>
          log.error("Could not destroy deleted owners with the following errors")
             errors foreach (e => log.error(e.responseType + ": " + e.description, e.throwable))
          false
      }
    }else if (priority == 3){
      // Daily
      log.info("tick daily")
      db.purgeUnpublishedFromPublicIndex()
      true
    }else{
      log.error("invalid tick priority: " + priority)
      false
    }
  }

  def getHAStatus: String = {
    if (settings.isHighAvailability){
      val state = db.ds.gds.asInstanceOf[HighlyAvailableGraphDatabase].getInstanceState
      if (state == HighAvailabilityMemberState.MASTER) "master"
      else if (state == HighAvailabilityMemberState.SLAVE) "slave"
      else "none"
    }else{
      "master"
    }
  }

  def getInfo: Response[Info] = {
    db.getInfo
  }

  def putInfo(info: Info): Response[SetResult] = {
    db.putInfo(info)
  }
}

class AdminActionsImpl(implicit val implSettings: Settings, implicit val inj: Injector)
  extends AdminActions with Injectable {
  override def settings  = implSettings
  def db = inject[GraphDatabase]
}
