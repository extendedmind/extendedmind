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

  def putNewItem(owner: Owner, item: Item)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putNewItem: owner {}", owner)
    db.putNewItem(owner, item)
  }

  def putExistingItem(owner: Owner, itemUUID: UUID, item: Item)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putExistingItem: owner {}, item {}", owner, itemUUID)
    db.putExistingItem(owner, itemUUID, item)
  }

  def getItems(owner: Owner)(implicit log: LoggingContext): Response[Items] = {
    log.info("getItems: owner {}", owner)
    db.getItems(owner)
  }

  def getItem(owner: Owner, itemUUID: UUID)(implicit log: LoggingContext): Response[Item] = {
    log.info("getItem: owner {}, item {}", owner, itemUUID)
    db.getItem(owner, itemUUID)
  }
  
  def deleteItem(owner: Owner, itemUUID: UUID)(implicit log: LoggingContext): Response[DeleteItemResult] = {
    log.info("deleteItem: owner {}, item {}", owner, itemUUID)
    db.deleteItem(owner, itemUUID)
  }
  
  def undeleteItem(owner: Owner, itemUUID: UUID)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("undeleteItem: owner {}, item {}", owner, itemUUID)
    db.undeleteItem(owner, itemUUID)
  }
}

class ItemActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends ItemActions with Injectable {
  def db = inject[GraphDatabase]
}
