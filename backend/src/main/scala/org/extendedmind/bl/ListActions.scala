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

trait ListActions {

  def db: GraphDatabase;
  
  def putNewList(owner: Owner, list: List)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putNewList: owner {}", owner)
    db.putNewList(owner, list)
  }

  def putExistingList(owner: Owner, listUUID: UUID, list: List)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putExistingList: owner {}, list {}", owner, listUUID)
    db.putExistingList(owner, listUUID, list)
  }
  
   def getList(owner: Owner, listUUID: UUID)(implicit log: LoggingContext): Response[List] = {
    log.info("getList: owner {}, list {}", owner, listUUID)
    db.getList(owner, listUUID)
  }
  
  def deleteList(owner: Owner, listUUID: UUID)(implicit log: LoggingContext): Response[DeleteItemResult] = {
    log.info("deleteList: owner {}, list {}", owner, listUUID)
    db.deleteList(owner, listUUID)
  }
  
  def undeleteList(owner: Owner, listUUID: UUID)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("undeleteList: owner {}, list {}", owner, listUUID)
    db.undeleteItem(owner: Owner, listUUID, Some(ItemLabel.LIST))
  }

  def archiveList(owner: Owner, listUUID: UUID)(implicit log: LoggingContext): Response[ArchiveListResult] = {
    log.info("archiveList: owner {}, list {}", owner, listUUID)
    db.archiveList(owner, listUUID)
  }
}

class ListActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends ListActions with Injectable {
  def db = inject[GraphDatabase]
}
