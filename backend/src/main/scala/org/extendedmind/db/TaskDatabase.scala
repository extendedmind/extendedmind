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
      taskNode <- createTask(userUUID, task).right
      result <- getSetResult(taskNode, true).right
    }yield result
  }

  def putExistingTask(userUUID: UUID, taskUUID: UUID, task: Task): Response[SetResult] = {
    for{
      item <- updateTask(userUUID, taskUUID, task).right
      result <- getSetResult(item, false).right
    }yield result
  }
  
  // PRIVATE
  
  protected def createTask(userUUID: UUID, task: Task): Response[Node] = {
    withTx{
      implicit neo4j =>
        for{
          userNode <- getUserNode(userUUID).right
          taskNode <- createTask(userNode, task).right
        }yield taskNode
    }
  }
 
  protected def createTask(userNode: Node, task: Task)(implicit neo4j: DatabaseService): Response[Node] = {
    val taskNode = createNode(task, MainLabel.ITEM, ItemLabel.TASK)
    // Attach task to the user
    userNode --> UserRelationship.OWNS --> taskNode
    Right(taskNode)
  }
  
  protected def updateTask(userUUID: UUID, taskUUID: UUID, task: Task): Response[Node] = {
    withTx{
      implicit neo4j =>
        for{
          userNode <- getUserNode(userUUID).right
          itemNode <- getItemNode(userNode, taskUUID).right
          itemNode <- updateNode(itemNode, task).right
        }yield itemNode
    }    
  }
}