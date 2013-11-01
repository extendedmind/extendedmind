package org.extendedmind.bl

import org.extendedmind.domain._
import org.extendedmind.db._
import org.extendedmind._
import org.extendedmind.Response._
import scaldi.Injector
import scaldi.Injectable
import spray.util.LoggingContext
import org.extendedmind.security._
import java.util.UUID

trait AdminActions {

  def db: GraphDatabase;

  def rebuildUserIndexes()(implicit log: LoggingContext): Response[CountResult] = {
    log.info("rebuildUserIndex")
    db.rebuildUserIndexes
  }
  
  def resetTokens()(implicit log: LoggingContext): Response[CountResult] = {
    log.info("resetTokens")
    db.destroyAllTokens
  }
  
  def rebuildItemsIndex(ownerUUID: UUID)(implicit log: LoggingContext): Response[CountResult] = {
    log.info("rebuildItemsIndex")
    db.rebuildItemsIndex(ownerUUID)
  }

}

class AdminActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends AdminActions with Injectable {
  def db = inject[GraphDatabase]
}
