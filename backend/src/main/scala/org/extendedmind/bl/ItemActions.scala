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
import akka.actor.ActorRefFactory
import scala.concurrent.Future

trait ItemActions {

  def db: GraphDatabase;
  def actorRefFactory: ActorRefFactory
  implicit val implicitActorRefFactory = actorRefFactory
  implicit val implicitExecutionContext = actorRefFactory.dispatcher 
  
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
    val items = db.getItems(owner)
    
    // Destroy deleted items
    if (items.isRight){
      val futureDestroyResponse = Future[Response[CountResult]] {
        db.destroyDeletedItems(owner)
      }
      futureDestroyResponse onSuccess {
        case Right(CountResult(deleteCount)) => {
          log.info("Destroyed {} deleted items for {}", 
                          deleteCount, owner)
        }case Left(errors) =>
          log.error("Could not destroy deleted items for {} with the following errors", owner)
          errors foreach (e => log.error(e.responseType + ": " + e.description, e.throwable))
      }
    }
    items
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

class ItemActionsImpl(implicit val implSettings: Settings, implicit val inj: Injector,
                      implicit val implActorRefFactory: ActorRefFactory)
  extends ItemActions with Injectable {
  override def db = inject[GraphDatabase]
  override def actorRefFactory = implActorRefFactory
}
