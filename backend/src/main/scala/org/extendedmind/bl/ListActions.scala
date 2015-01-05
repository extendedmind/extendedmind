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
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.domain.Item
import java.util.UUID
import org.extendedmind._
import org.extendedmind.Response._
import akka.event.LoggingAdapter

trait ListActions {

  def db: GraphDatabase;
  
  def putNewList(owner: Owner, list: List)(implicit log: LoggingAdapter): Response[SetResult] = {
    db.putNewList(owner, list)
  }

  def putExistingList(owner: Owner, listUUID: UUID, list: List)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("putExistingList")
    db.putExistingList(owner, listUUID, list)
  }
  
   def getList(owner: Owner, listUUID: UUID)(implicit log: LoggingAdapter): Response[List] = {
    log.info("getList")
    db.getList(owner, listUUID)
  }
  
  def deleteList(owner: Owner, listUUID: UUID)(implicit log: LoggingAdapter): Response[DeleteItemResult] = {
    log.info("deleteList")
    db.deleteList(owner, listUUID)
  }
  
  def undeleteList(owner: Owner, listUUID: UUID)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("undeleteList")
    db.undeleteList(owner: Owner, listUUID)
  }

  def archiveList(owner: Owner, listUUID: UUID)(implicit log: LoggingAdapter): Response[ArchiveListResult] = {
    log.info("archiveList")
    db.archiveList(owner, listUUID)
  }
  
  def listToTask(owner: Owner, listUUID: UUID, list: List)(implicit log: LoggingAdapter): Response[Task] = {
    log.info("listToTask")
    db.listToTask(owner, listUUID, list)
  }
  
  def listToNote(owner: Owner, listUUID: UUID, list: List)(implicit log: LoggingAdapter): Response[Note] = {
    log.info("listToNote")
    db.listToNote(owner, listUUID, list)
  }
}

class ListActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends ListActions with Injectable {
  def db = inject[GraphDatabase]
}
