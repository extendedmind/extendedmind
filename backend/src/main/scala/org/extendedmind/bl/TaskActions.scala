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

trait TaskActions {

  def db: GraphDatabase;

  def putNewTask(userUUID: UUID, task: Task)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putNewTask: user " + userUUID)
    db.putNewTask(userUUID, task)
  }

  def putExistingTask(userUUID: UUID, taskUUID: UUID, task: Task)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putExistingTask: user " + userUUID + ", task " + taskUUID)
    db.putExistingTask(userUUID, taskUUID, task)
  }

  def getTask(userUUID: UUID, taskUUID: UUID)(implicit log: LoggingContext): Response[Task] = {
    log.info("getTask: user " + userUUID + ", task " + taskUUID)
    db.getTask(userUUID, taskUUID)
  }

  def completeTask(userUUID: UUID, taskUUID: UUID)(implicit log: LoggingContext): Response[CompleteTaskResult] = {
    log.info("completeTask: user " + userUUID + ", task " + taskUUID)
    db.completeTask(userUUID, taskUUID)
  }

}

class TaskActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends TaskActions with Injectable {
  def db = inject[GraphDatabase]
}
