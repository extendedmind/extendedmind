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

trait TaskActions{

  def db: GraphDatabase;
  def si: SearchIndex;
  
  def putNewTask(userUUID: UUID, task: Task): Response[SetResult] = {
    db.putNewTask(userUUID, task)
  }
  
  def putExistingTask(userUUID: UUID, taskUUID: UUID, task: Task): Response[SetResult] = {
    db.putExistingTask(userUUID, taskUUID, task)
  }
    
  def getTask(userUUID: UUID, taskUUID: UUID): Response[Task] = {
    db.getTask(userUUID, taskUUID)
  }
  
  def completeTask(userUUID: UUID, taskUUID: UUID): Response[CompleteTaskResult] = {
    db.completeTask(userUUID, taskUUID)
  }
  
}

class TaskActionsImpl(implicit val settings: Settings, implicit val inj: Injector) 
		extends TaskActions with Injectable{
  def db = inject[GraphDatabase]
  def si = inject[SearchIndex]
}
