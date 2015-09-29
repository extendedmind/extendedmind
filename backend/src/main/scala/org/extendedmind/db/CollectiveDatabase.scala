/**
 * Copyright (c) 2013-2015 Extended Mind Technologies Oy
 *
 * This file is part of Extended Mind.
 *
 * Extended Mind is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

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

trait CollectiveDatabase extends UserDatabase {

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

  def hasCommonCollective(): Boolean = {
    withTx {
      implicit neo4j =>
        val collectives = findNodesByLabelAndProperty(OwnerLabel.COLLECTIVE, "common", java.lang.Boolean.TRUE).toList
        if (collectives.isEmpty)
          false
        else
          true
    }
  }

  def setCollectiveUserPermission(collectiveUUID: UUID, founderUUID: UUID, userUUID: UUID, access: Option[Byte]):
        Response[SetResult] = {
    for {
      collectiveNode <- setCollectiveUserPermissionNode(collectiveUUID, founderUUID, userUUID, access).right
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
    val collectiveNode = createNode(collective.copy(inboxId=None, apiKey=None, handle=None), MainLabel.OWNER, OwnerLabel.COLLECTIVE)
    founderNode --> SecurityRelationship.IS_FOUNDER --> collectiveNode;
    collectiveNode.setProperty("inboxId", generateUniqueInboxId())
    collectiveNode.setProperty("apiKey", Random.generateRandomUniqueString())

    if (commonCollective){
      collectiveNode.setProperty("common", true)
      // Give all existing users read access to to common collective
      val userIterator = findNodesByLabel(OwnerLabel.USER);
      userIterator.foreach(user => {
        if (user != founderNode)
          user --> SecurityRelationship.CAN_READ --> collectiveNode;
      })
    }

    // Set handle
    val handleResult = setOwnerHandle(collectiveNode, collective.handle)
    if (handleResult.isRight)
      Right(collectiveNode)
    else
      Left(handleResult.left.get)
  }

  protected def putExistingCollectiveNode(collectiveUUID: UUID, collective: Collective):
        Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          collectiveNode <- getNode(collectiveUUID, OwnerLabel.COLLECTIVE).right
          oldHandle <- setOwnerHandle(collectiveNode, collective.handle).right
          collectiveNode <- updateNode(collectiveNode, collective.copy(
              inboxId = (if (collectiveNode.hasProperty("inboxId")) Some(collectiveNode.getProperty("inboxId").asInstanceOf[String])
                        else None),
              apiKey = (if (collectiveNode.hasProperty("apiKey")) Some(collectiveNode.getProperty("apiKey").asInstanceOf[String])
                        else None))).right
        } yield collectiveNode
    }
  }

  protected def setCollectiveUserPermissionNode(collectiveUUID: UUID, founderUUID: UUID, userUUID: UUID, access: Option[Byte]):
      Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          collectiveNode <- getFoundedCollective(collectiveUUID, founderUUID).right
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          relationship <- setPermission(collectiveNode, userNode, access).right
        } yield collectiveNode
    }
  }

  protected def getFoundedCollective(collectiveUUID: UUID, founderUUID: UUID)
        (implicit neo4j: DatabaseService): Response[Node] = {
    val collectiveNode = getNode(collectiveUUID, OwnerLabel.COLLECTIVE)
    if (collectiveNode.isLeft) return collectiveNode

    val founderFromCollective: TraversalDescription = {
        neo4j.gds.traversalDescription()
          .relationships(DynamicRelationshipType.withName(SecurityRelationship.IS_FOUNDER.name),
            Direction.INCOMING)
          .depthFirst()
          .evaluator(Evaluators.excludeStartPosition())
          .evaluator(PropertyEvaluator(
            OwnerLabel.COLLECTIVE, "deleted",
            foundEvaluation=Evaluation.EXCLUDE_AND_PRUNE,
            notFoundEvaluation=Evaluation.INCLUDE_AND_CONTINUE))
    }
    val traverser = founderFromCollective.traverse(collectiveNode.right.get)
    val collectiveNodeList = traverser.nodes().toList
    if (collectiveNodeList.length == 0) {
      fail(INTERNAL_SERVER_ERROR, ERR_COLLECTIVE_NO_FOUNDER, "Collective " + collectiveUUID + " has no founder")
    } else if (collectiveNodeList.length > 1) {
      fail(INTERNAL_SERVER_ERROR, ERR_COLLECTIVE_MORE_THAN_1_FOUNDER, "More than one founder found for collective with UUID " + collectiveUUID)
    } else {
      val founder = collectiveNodeList.head
      if (getUUID(founder) != founderUUID){
        fail(INVALID_PARAMETER, ERR_COLLECTIVE_WRONG_FOUNDER, "Collective " + collectiveUUID + " is not founded by user "
            + founderUUID)
      }else{
        Right(collectiveNode.right.get)
      }
    }
  }
}