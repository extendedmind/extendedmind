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

trait TaskActions {

  def db: GraphDatabase;

  def putNewTask(userUUID: UUID, task: Task)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putNewTask: user {}", userUUID)
    db.putNewTask(userUUID, task)
  }

  def putExistingTask(userUUID: UUID, taskUUID: UUID, task: Task)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putExistingTask: user {}, task {}", userUUID, taskUUID)
    db.putExistingTask(userUUID, taskUUID, task)
  }

  def getTask(userUUID: UUID, taskUUID: UUID)(implicit log: LoggingContext): Response[Task] = {
    log.info("getTask: user {}, task {}", userUUID, taskUUID)
    db.getTask(userUUID, taskUUID)
  }
  
  def deleteTask(userUUID: UUID, taskUUID: UUID)(implicit log: LoggingContext): Response[DeleteItemResult] = {
    log.info("deleteTask: user {}, task {}", userUUID, taskUUID)
    db.deleteTask(userUUID, taskUUID)
  }
  
  def undeleteTask(userUUID: UUID, taskUUID: UUID)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("undeleteTask: user {}, task {}", userUUID, taskUUID)
    db.undeleteItem(userUUID, taskUUID, Some(ItemLabel.TASK))
  }

  def completeTask(userUUID: UUID, taskUUID: UUID)(implicit log: LoggingContext): Response[CompleteTaskResult] = {
    log.info("completeTask: user {}, task {}", userUUID, taskUUID)
    db.completeTask(userUUID, taskUUID)
  }
  
  def uncompleteTask(userUUID: UUID, taskUUID: UUID)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("uncompleteTask: user {}, task {}", userUUID, taskUUID)
    db.uncompleteTask(userUUID, taskUUID)
  }

}

class TaskActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends TaskActions with Injectable {
  def db = inject[GraphDatabase]
}
