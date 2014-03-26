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

trait TagActions {

  def db: GraphDatabase;

  def putNewTag(owner: Owner, tag: Tag)(implicit log: LoggingAdapter): Response[SetResult] = {
    db.putNewTag(owner, tag)
  }
  
  def putExistingTag(owner: Owner, tagUUID: UUID, tag: Tag)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("putExistingTag")
    db.putExistingTag(owner, tagUUID, tag)
  }
  
  def getTag(owner: Owner, tagUUID: UUID)(implicit log: LoggingAdapter): Response[Tag] = {
    log.info("getTag")
    db.getTag(owner, tagUUID)
  }
  
  def deleteTag(owner: Owner, tagUUID: UUID)(implicit log: LoggingAdapter): Response[DeleteItemResult] = {
    log.info("deleteTag")
    db.deleteTag(owner, tagUUID)
  }
  
  def undeleteTag(owner: Owner, tagUUID: UUID)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("undeleteTag")
    db.undeleteItem(owner: Owner, tagUUID, Some(ItemLabel.TAG))
  }
}

class TagActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends TagActions with Injectable {
  def db = inject[GraphDatabase]
}
