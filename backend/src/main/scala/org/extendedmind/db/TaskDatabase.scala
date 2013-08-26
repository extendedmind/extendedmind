package org.extendedmind.db

import java.util.UUID
import scala.collection.JavaConversions.iterableAsScalaIterable
import org.extendedmind.Response._
import org.extendedmind._
import org.extendedmind.domain._
import org.neo4j.graphdb.Direction
import org.neo4j.graphdb.DynamicRelationshipType
import org.neo4j.graphdb.Node
import org.neo4j.graphdb.traversal.Evaluators
import org.neo4j.graphdb.traversal.TraversalDescription
import org.neo4j.kernel.Traversal
import org.neo4j.scala.DatabaseService
import scala.collection.mutable.ListBuffer

trait TaskDatabase extends AbstractGraphDatabase with ItemDatabase{

  // PUBLIC
  
  def putNewTask(userUUID: UUID, task: Task): Response[SetResult] = {
    for{
      taskNode <- createItem(userUUID, task, Some(ItemLabel.TASK)).right
      result <- getSetResult(taskNode, true).right
    }yield result
  }

  def putExistingTask(userUUID: UUID, taskUUID: UUID, task: Task): Response[SetResult] = {
    for{
      item <- updateItem(userUUID, taskUUID, task, Some(ItemLabel.TASK)).right
      result <- getSetResult(item, false).right
    }yield result
  }
  
  def getTask(userUUID: UUID, taskUUID: UUID): Response[Task] = {
    withTx{
      implicit neo =>
        for{
          userNode <- getUserNode(userUUID).right
          taskNode <- getItemNode(userNode, taskUUID, Some(ItemLabel.TASK)).right
          item <- toCaseClass[Task](taskNode).right
        }yield item
    }
  }
  
  
}