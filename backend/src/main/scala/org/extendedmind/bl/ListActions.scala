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
    db.undeleteItem(owner: Owner, listUUID, Some(ItemLabel.LIST))
  }

  def archiveList(owner: Owner, listUUID: UUID)(implicit log: LoggingAdapter): Response[ArchiveListResult] = {
    log.info("archiveList")
    db.archiveList(owner, listUUID)
  }
}

class ListActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends ListActions with Injectable {
  def db = inject[GraphDatabase]
}
