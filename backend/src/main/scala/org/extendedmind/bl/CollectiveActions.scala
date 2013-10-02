package org.extendedmind.bl

import org.extendedmind.domain._
import org.extendedmind.db._
import org.extendedmind._
import org.extendedmind.email._
import org.extendedmind.security._
import org.extendedmind.Response._
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.db.EmbeddedGraphDatabase
import spray.util.LoggingContext
import scala.util.{Success, Failure}
import scala.concurrent.ExecutionContext
import akka.actor.ActorRefFactory
import akka.actor.ActorSystem
import java.util.UUID

trait CollectiveActions {

  def db: GraphDatabase
  def settings: Settings
    
  def putNewCollective(collective: Collective, userUUID: UUID)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putNewCollective")
   
    if (settings.commonCollectives) 
      log.warning("CRITICAL: Making collective {} an common collective to all "
                 +"users because extendedmind.security.commonCollective is set to true")
    db.putNewCollective(collective, userUUID, settings.commonCollectives)
  }
}

class CollectiveActionsImpl(implicit val implSettings: Settings, implicit val inj: Injector)
  extends CollectiveActions with Injectable {
  override def settings  = implSettings
  override def db = inject[GraphDatabase]
}
