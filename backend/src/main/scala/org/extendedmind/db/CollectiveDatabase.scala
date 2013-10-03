package org.extendedmind.db

import java.util.UUID
import scala.collection.JavaConversions.iterableAsScalaIterable
import org.apache.commons.codec.binary.Base64
import org.extendedmind._
import org.extendedmind.Response._
import org.extendedmind.domain._
import org.extendedmind.security._
import org.neo4j.graphdb.Direction
import org.neo4j.graphdb.DynamicRelationshipType
import org.neo4j.graphdb.Node
import org.neo4j.graphdb.traversal.Evaluators
import org.neo4j.graphdb.traversal.TraversalDescription
import org.neo4j.kernel.Traversal
import org.neo4j.scala.DatabaseService
import scala.collection.mutable.ListBuffer
import org.neo4j.index.lucene.ValueContext
import org.neo4j.index.lucene.QueryContext

trait CollectiveDatabase extends AbstractGraphDatabase {

  // PUBLIC

  def putNewCollective(creatorUUID: UUID, collective: Collective, commonCollective: Boolean): Response[SetResult] = {
    for{
      collectiveNode <- createCollective(creatorUUID, collective, commonCollective).right
      result <- Right(getSetResult(collectiveNode, true)).right
    }yield result
  }
  
  def putExistingCollective(collectiveUUID: UUID, collective: Collective): Response[SetResult] = {
    for {
      collectiveNode <- putExistingCollectiveNode(collectiveUUID, collective).right
      result <- Right(getSetResult(collectiveNode, false)).right
    } yield result
  }
  
  def getCollective(collectiveUUID: UUID): Response[Collective] = {
    withTx {
      implicit neo =>
        for {
          collectiveNode <- getNode(collectiveUUID, OwnerLabel.COLLECTIVE).right
          collective <- toCaseClass[Collective](collectiveNode).right
        } yield collective
    }
  }

  // PRIVATE
  
  protected def createCollective(creatorUUID: UUID, collective: Collective, commonCollective: Boolean): Response[Node] = {
    withTx{
      implicit neo4j =>
        for {
          creatorNode <- getNode(creatorUUID, OwnerLabel.USER).right
          collectiveNode <- createCollectiveNode(creatorNode, collective, commonCollective).right
        } yield collectiveNode
    }
  }
  
  protected def createCollectiveNode(creatorNode: Node, collective: Collective, commonCollective: Boolean)
               (implicit neo4j: DatabaseService): Response[Node] = {
    val collectiveNode = createNode(collective, MainLabel.OWNER, OwnerLabel.COLLECTIVE)
    creatorNode --> SecurityRelationship.IS_CREATOR --> collectiveNode;

    if (commonCollective){
      collectiveNode.setProperty("common", true)
      // Give all existing users read access to to common collective
      val userIterator = findNodesByLabel(OwnerLabel.USER);
      userIterator.foreach(user => {
        if (user != creatorNode)
          user --> SecurityRelationship.CAN_READ --> collectiveNode;
      })
    } 
    Right(collectiveNode)
  }
  
  protected def putExistingCollectiveNode(collectiveUUID: UUID, collective: Collective): 
        Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          collectiveNode <- getNode(collectiveUUID, OwnerLabel.COLLECTIVE).right
          collectiveNode <- updateNode(collectiveNode, collective).right
        } yield collectiveNode
    }
  }
    
}