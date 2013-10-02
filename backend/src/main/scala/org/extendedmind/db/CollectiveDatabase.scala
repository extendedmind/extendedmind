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

  def putNewCollective(collective: Collective, userUUID: UUID, commonCollective: Boolean): Response[SetResult] = {
    for{
      collectiveNode <- createCollective(collective, userUUID, commonCollective).right
      result <- Right(getSetResult(collectiveNode, true)).right
    }yield result
  }
 
  // PRIVATE
  
  protected def createCollective(collective: Collective, userUUID: UUID, commonCollective: Boolean): Response[Node] = {
    withTx{
      implicit neo4j =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          collectiveNode <- createCollectiveNode(collective, userNode, commonCollective).right
        } yield collectiveNode
    }
  }
  
  protected def createCollectiveNode(collective: Collective, userNode: Node, commonCollective: Boolean)
               (implicit neo4j: DatabaseService): Response[Node] = {
    val collectiveNode = createNode(collective, MainLabel.OWNER, OwnerLabel.COLLECTIVE)
    userNode --> SecurityRelationship.IS_CREATOR --> collectiveNode;

    if (commonCollective){
      collectiveNode.setProperty("common", true)
      // Give all existing users read access to to common collective
      val userIterator = findNodesByLabel(OwnerLabel.USER);
      userIterator.foreach(user => {
        if (user != userNode)
          user --> SecurityRelationship.CAN_READ --> collectiveNode;
      })
    } 
    Right(collectiveNode)
  } 
}