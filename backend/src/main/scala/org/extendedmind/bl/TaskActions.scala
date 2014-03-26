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

trait TaskActions {

  def db: GraphDatabase;

  def putNewTask(owner: Owner, task: Task)(implicit log: LoggingAdapter): Response[SetResult] = {
    db.putNewTask(owner, task)
  }

  def putExistingTask(owner: Owner, taskUUID: UUID, task: Task)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("putExistingTask")
    db.putExistingTask(owner, taskUUID, task)
  }

  def getTask(owner: Owner, taskUUID: UUID)(implicit log: LoggingAdapter): Response[Task] = {
    log.info("getTask")
    db.getTask(owner, taskUUID)
  }
  
  def deleteTask(owner: Owner, taskUUID: UUID)(implicit log: LoggingAdapter): Response[DeleteItemResult] = {
    log.info("deleteTask")
    db.deleteTask(owner, taskUUID)
  }
  
  def undeleteTask(owner: Owner, taskUUID: UUID)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("undeleteTask")
    db.undeleteItem(owner: Owner, taskUUID, Some(ItemLabel.TASK))
  }

  def completeTask(owner: Owner, taskUUID: UUID)(implicit log: LoggingAdapter): Response[CompleteTaskResult] = {
    log.info("completeTask")
    db.completeTask(owner, taskUUID)
  }
  
  def uncompleteTask(owner: Owner, taskUUID: UUID)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("uncompleteTask")
    db.uncompleteTask(owner, taskUUID)
  }

}

class TaskActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends TaskActions with Injectable {
  def db = inject[GraphDatabase]
}
