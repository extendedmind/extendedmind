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

trait TagActions {

  def db: GraphDatabase;

  def putNewTag(owner: Owner, tag: Tag)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putNewTag: owner {}", owner)
    db.putNewTag(owner, tag)
  }
  
  def putExistingTag(owner: Owner, tagUUID: UUID, tag: Tag)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putExistingTag: owner {}, tag {}", owner, tagUUID)
    db.putExistingTag(owner, tagUUID, tag)
  }
  
  def getTag(owner: Owner, tagUUID: UUID)(implicit log: LoggingContext): Response[Tag] = {
    log.info("getTag: owner {}, tag {}", owner, tagUUID)
    db.getTag(owner, tagUUID)
  }
}

class TagActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends TagActions with Injectable {
  def db = inject[GraphDatabase]
}
