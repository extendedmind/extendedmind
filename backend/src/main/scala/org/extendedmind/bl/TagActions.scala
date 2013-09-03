package org.extendedmind.bl

import org.extendedmind.domain._
import org.extendedmind.db._
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.search.ElasticSearchIndex
import org.extendedmind.search.SearchIndex
import org.extendedmind.domain.Item
import java.util.UUID
import org.extendedmind._
import org.extendedmind.Response._
import spray.util.LoggingContext

trait TagActions {

  def db: GraphDatabase;

  def putNewTag(userUUID: UUID, tag: Tag)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putNewTag: user " + userUUID)
    db.putNewTag(userUUID, tag)
  }
  
  def putExistingTag(userUUID: UUID, tagUUID: UUID, tag: Tag)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putExistingTag: user " + userUUID + ", tag " + tagUUID)
    db.putExistingTag(userUUID, tagUUID, tag)
  }
  
  def getTag(userUUID: UUID, tagUUID: UUID)(implicit log: LoggingContext): Response[Tag] = {
    log.info("getTag: user " + userUUID + ", tag " + tagUUID)
    db.getTag(userUUID, tagUUID)
  }
}

class TagActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends TagActions with Injectable {
  def db = inject[GraphDatabase]
}
