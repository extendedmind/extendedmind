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

trait ItemDatabase extends AbstractGraphDatabase with UserDatabase{

  def putNewItem(userUUID: UUID, item: Item): Response[SetResult] = {
    for{
      itemId <- createItem(userUUID, item).right
      result <- getSetResult(itemId, true).right
    }yield result
  }

  def putExistingItem(userUUID: UUID, itemUUID: UUID, item: Item): Response[SetResult] = {
    for{
      item <- updateItem(userUUID, itemUUID, item).right
      result <- getSetResult(item, true).right
    }yield result
  }

  private def createItem(userUUID: UUID, item: Item): Response[Node] = {
    withTx{
      implicit neo4j =>
        for{
          userNode <- getUserNode(userUUID).right
          result <- createItem(userNode, item).right
        }yield result
    }
  }
 
  private def createItem(userNode: Node, item: Item)(implicit neo4j: DatabaseService): Response[Node] = {
    val node = createNode(item, MainLabel.ITEM)
    Right(node)
  }
  
  private def updateItem(userUUID: UUID, itemUUID: UUID, item: Item): Response[Node] = {
    withTx{
      implicit neo4j =>
        for{
          userNode <- getUserNode(userUUID).right
          itemNode <- getItemNode(userNode, itemUUID).right
          itemNode <- updateNode(itemNode, item).right
        }yield itemNode
    }    
  }
    
  private def getItemNode(userNode: Node, itemUUID: UUID)(implicit neo4j: DatabaseService): Response[Node] = {
    val itemFromUser: TraversalDescription = 
        Traversal.description()
          .relationships(DynamicRelationshipType.withName(UserRelationship.OWNS.name), 
                         Direction.OUTGOING)
          .breadthFirst()
          .evaluator(Evaluators.excludeStartPosition())
          .evaluator(UUIDEvaluator(itemUUID))
          .evaluator(LabelEvaluator(MainLabel.ITEM))

    val traverser = itemFromUser.traverse(userNode)
    val itemNodeList = traverser.nodes().toArray
    if (itemNodeList.length == 0) {
      fail(INVALID_PARAMETER, "Item " + itemUUID + " not found")
    } else if (itemNodeList.length > 1) {
      fail(INTERNAL_SERVER_ERROR, "More than one item found with UUID " + itemUUID)
    } else {
      Right(itemNodeList.head)
    }
  }

}