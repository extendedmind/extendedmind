package org.extendedmind.bl

import org.extendedmind.domain._
import org.extendedmind.db._
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.domain.Item
import java.util.UUID
import org.extendedmind._
import org.extendedmind.Response._
import spray.util.LoggingContext

trait ItemActions {

  def db: GraphDatabase;

  def putNewItem(userUUID: UUID, item: Item)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putNewItem: user {}", userUUID)
    db.putNewItem(userUUID, item)
  }

  def putExistingItem(userUUID: UUID, itemUUID: UUID, item: Item)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putExistingItem: user {}, item {}", userUUID, itemUUID)
    db.putExistingItem(userUUID, itemUUID, item)
  }

  def getItems(userUUID: UUID)(implicit log: LoggingContext): Response[Items] = {
    log.info("getItems: user {}", userUUID)
    db.getItems(userUUID)
  }

  def getItem(userUUID: UUID, itemUUID: UUID)(implicit log: LoggingContext): Response[Item] = {
    log.info("getItems: user {}, item {}", userUUID, itemUUID)
    db.getItem(userUUID, itemUUID)
  }
}

class ItemActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends ItemActions with Injectable {
  def db = inject[GraphDatabase]
}
