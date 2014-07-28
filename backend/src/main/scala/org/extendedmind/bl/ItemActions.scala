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
import akka.actor.ActorRefFactory
import scala.concurrent.Future
import akka.event.LoggingAdapter

trait ItemActions {

  def db: GraphDatabase;
  def actorRefFactory: ActorRefFactory
  implicit val implicitActorRefFactory = actorRefFactory
  implicit val implicitExecutionContext = actorRefFactory.dispatcher

  def putNewItem(owner: Owner, item: Item)(implicit log: LoggingAdapter): Response[SetResult] = {
    db.putNewItem(owner, item)
  }

  def putExistingItem(owner: Owner, itemUUID: UUID, item: Item)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("putExistingItem: item {}", itemUUID)
    db.putExistingItem(owner, itemUUID, item)
  }

  def getItems(owner: Owner, modified: Option[Long], active: Boolean, deleted: Boolean, archived: Boolean, completed: Boolean)(implicit log: LoggingAdapter): Response[Items] = {
    log.info("getItems")
    val items = db.getItems(owner, modified, active, deleted, archived, completed)

    // Destroy old deleted items
    if (items.isRight) {
      val futureDestroyResponse = Future[Response[CountResult]] {
        db.destroyDeletedItems(owner)
      }
      futureDestroyResponse onSuccess {
        case Right(CountResult(deleteCount)) => {
          log.info("Destroyed {} deleted items for {}",
            deleteCount, owner)
        } case Left(errors) =>
          log.error("Could not destroy deleted items for {} with the following errors", owner)
          errors foreach (e => log.error(e.responseType + ": " + e.description, e.throwable))
      }
    }
    items
  }

  def getItem(owner: Owner, itemUUID: UUID)(implicit log: LoggingAdapter): Response[Item] = {
    log.info("getItem")
    db.getItem(owner, itemUUID)
  }

  def deleteItem(owner: Owner, itemUUID: UUID)(implicit log: LoggingAdapter): Response[DeleteItemResult] = {
    log.info("deleteItem")
    db.deleteItem(owner, itemUUID)
  }

  def undeleteItem(owner: Owner, itemUUID: UUID)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("undeleteItem")
    db.undeleteItem(owner, itemUUID)
  }
}

class ItemActionsImpl(implicit val implSettings: Settings, implicit val inj: Injector,
  implicit val implActorRefFactory: ActorRefFactory)
  extends ItemActions with Injectable {
  override def db = inject[GraphDatabase]
  override def actorRefFactory = implActorRefFactory
}
