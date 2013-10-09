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
import org.neo4j.graphdb.traversal.Evaluation
import org.neo4j.graphdb.Relationship

trait CollectiveDatabase extends AbstractGraphDatabase {

  // PUBLIC

  def putNewCollective(founderUUID: UUID, collective: Collective, commonCollective: Boolean): Response[SetResult] = {
    for{
      collectiveNode <- createCollective(founderUUID, collective, commonCollective).right
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
  
  def addUserToCollective(collectiveUUID: UUID, founderUUID: UUID, userUUID: UUID, access: Byte): Response[SetResult] = {
    for {
      collectiveNode <- addUserToCollectiveNode(collectiveUUID, founderUUID, userUUID, access).right
      result <- Right(getSetResult(collectiveNode, false)).right
    } yield result
  }

  // PRIVATE
  
  protected def createCollective(founderUUID: UUID, collective: Collective, commonCollective: Boolean): Response[Node] = {
    withTx{
      implicit neo4j =>
        for {
          founderNode <- getNode(founderUUID, OwnerLabel.USER).right
          collectiveNode <- createCollectiveNode(founderNode, collective, commonCollective).right
        } yield collectiveNode
    }
  }
  
  protected def createCollectiveNode(founderNode: Node, collective: Collective, commonCollective: Boolean)
               (implicit neo4j: DatabaseService): Response[Node] = {
    val collectiveNode = createNode(collective, MainLabel.OWNER, OwnerLabel.COLLECTIVE)
    founderNode --> SecurityRelationship.IS_FOUNDER --> collectiveNode;

    if (commonCollective){
      collectiveNode.setProperty("common", true)
      // Give all existing users read access to to common collective
      val userIterator = findNodesByLabel(OwnerLabel.USER);
      userIterator.foreach(user => {
        if (user != founderNode)
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
  
  protected def addUserToCollectiveNode(collectiveUUID: UUID, founderUUID: UUID, userUUID: UUID, access: Byte): Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          collectiveNode <- getCreatedCollective(collectiveUUID, founderUUID).right
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          relationship <- addUserToCollective(collectiveNode, userNode, access).right
        } yield collectiveNode
    }
  }
  
  protected def getCreatedCollective(collectiveUUID: UUID, founderUUID: UUID)
        (implicit neo4j: DatabaseService): Response[Node] = {
    val collectiveNode = getNode(collectiveUUID, OwnerLabel.COLLECTIVE)
    if (collectiveNode.isLeft) return collectiveNode
        
    val founderFromCollective: TraversalDescription = {
        Traversal.description()
          .relationships(DynamicRelationshipType.withName(SecurityRelationship.IS_FOUNDER.name),
            Direction.INCOMING)
          .depthFirst()
          .evaluator(Evaluators.excludeStartPosition())
          .evaluator(PropertyEvaluator(
            OwnerLabel.COLLECTIVE, "deleted",
            Evaluation.EXCLUDE_AND_PRUNE,
            Evaluation.INCLUDE_AND_CONTINUE))
    }
    val traverser = founderFromCollective.traverse(collectiveNode.right.get)
    val collectiveNodeList = traverser.nodes().toList
    if (collectiveNodeList.length == 0) {
      fail(INTERNAL_SERVER_ERROR, "Collective " + collectiveUUID + " has no founder")
    } else if (collectiveNodeList.length > 1) {
      fail(INTERNAL_SERVER_ERROR, "More than one founder found for collective with UUID " + collectiveUUID)
    } else {
      val founder = collectiveNodeList.head
      if (getUUID(founder) != founderUUID){
        fail(INVALID_PARAMETER, "Collective " + collectiveUUID + " is not founded by user " 
            + founderUUID)
      }else{
        Right(collectiveNode.right.get)
      }
    }
  }
  
  protected def addUserToCollective(collectiveNode: Node, userNode: Node, access: Byte) 
       (implicit neo4j: DatabaseService): Response[Relationship] = {
    access match {
      case SecurityContext.READ => 
        Right(userNode --> SecurityRelationship.CAN_READ --> collectiveNode <)
      case SecurityContext.READ_WRITE => 
        Right(userNode --> SecurityRelationship.CAN_READ_WRITE --> collectiveNode <)
      case _ => 
        fail(INVALID_PARAMETER, "Invalid access value: " + access)
    }
  }

}