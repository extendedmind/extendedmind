/**
 * Copyright (c) 2013-2016 Extended Mind Technologies Oy
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
import org.extendedmind.Response._
import org.extendedmind._
import org.extendedmind.domain._
import org.neo4j.graphdb.Direction
import org.neo4j.graphdb.DynamicRelationshipType
import org.neo4j.graphdb.Node
import org.neo4j.graphdb.traversal.Evaluators
import org.neo4j.graphdb.traversal.TraversalDescription
import org.neo4j.scala.DatabaseService
import scala.collection.mutable.ListBuffer
import org.neo4j.graphdb.traversal.Evaluation
import org.extendedmind.security.UUIDUtils

trait InviteDatabase extends UserDatabase {

  // PUBLIC

  def putNewInvite(owner: Owner, invite: Invite): Response[SetResult] = {
    for {
      inviteNode <- createInvite(owner, invite).right
      result <- Right(getSetResult(inviteNode, true)).right
    } yield result
  }

  def putExistingInvite(owner: Owner, inviteUUID: UUID, invite: Invite): Response[SetResult] = {
    for {
      inviteNode <- updateInvite(owner, inviteUUID, invite).right
      result <- Right(getSetResult(inviteNode, false)).right
    } yield result
  }

  def getInvite(owner: Owner, inviteUUID: UUID): Response[Invite] = {
    withTx {
      implicit neo4j =>
        for {
          userNode <- getNode(owner.userUUID, OwnerLabel.USER).right
          inviteNode <- getInviteNode(userNode, inviteUUID).right
          invite <- toCaseClass[Invite](inviteNode).right
          completeInvite <- addTransientInviteProperties(inviteNode, invite).right
        } yield completeInvite
    }
  }

  def destroyInvite(owner: Owner, inviteUUID: UUID): Response[DestroyResult] = {
    withTx {
      implicit neo4j =>
        for {
          userNode <- getNode(owner.userUUID, OwnerLabel.USER).right
          inviteNode <- getInviteNode(userNode, inviteUUID).right
          result <- destroyInviteNode(inviteNode).right
        } yield result
    }
  }

  // PRIVATE

  protected def createInvite(owner: Owner, invite: Invite): Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          unit <- validateEmailUniqueness(invite.email).right
          userNode <- getNode(owner.userUUID, OwnerLabel.USER).right
          inviteNode <- Right(createInvite(userNode, invite.copy(status = Some(InviteStatus.PENDING.toString),
                                                           emailId = None, invitee = None, accepted = None))).right
        } yield inviteNode
    }
  }

  protected def updateInvite(owner: Owner, inviteUUID: UUID, invite: Invite): Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          userNode <- getNode(owner.userUUID, OwnerLabel.USER).right
          inviteNode <- getInviteNode(userNode, inviteUUID).right
          updatedNode <- updateNode(inviteNode, invite).right
        } yield updatedNode
    }
  }

  protected def inviteTraversal(implicit neo4j: DatabaseService): TraversalDescription = {
    neo4j.gds.traversalDescription()
      .relationships(DynamicRelationshipType.withName(SecurityRelationship.OWNS.name), Direction.OUTGOING)
      .depthFirst()
      .evaluator(Evaluators.excludeStartPosition())
      .evaluator(LabelEvaluator(scala.List(MainLabel.INVITE)))
  }

  protected def getInviteNode(userNode: Node, inviteUUID: UUID)(implicit neo4j: DatabaseService): Response[Node] = {
    val traverser = inviteTraversal.evaluator(UUIDEvaluator(inviteUUID)).traverse(userNode)
    val inviteNodes = traverser.nodes.toList
    if (inviteNodes.size == 0) {
      fail(INVALID_PARAMETER, ERR_ITEM_NOT_FOUND, "Could not find invite " + inviteUUID + " for user " + getUUID(userNode))
    } else if (inviteNodes.size > 1) {
      fail(INTERNAL_SERVER_ERROR, ERR_ITEM_MORE_THAN_1, "More than one invite found with uuid " + inviteUUID + " and user + " + getUUID(userNode))
    } else {
      Right(inviteNodes(0))
    }
  }

  protected def createInvite(userNode: Node, invite: Invite)(implicit neo4j: DatabaseService): Node = {
    val inviteNode = createNode(invite, MainLabel.INVITE)
    userNode --> SecurityRelationship.OWNS --> inviteNode
    inviteNode
  }

  protected def addTransientInviteProperties(inviteNode: Node, invite: Invite)(implicit neo4j: DatabaseService): Response[Invite] = {
    val traversal = neo4j.gds.traversalDescription()
      .relationships(DynamicRelationshipType.withName(SecurityRelationship.IS_ORIGIN.name), Direction.INCOMING)
      .depthFirst()
      .evaluator(Evaluators.excludeStartPosition())
      .evaluator(LabelEvaluator(scala.List(OwnerLabel.USER)))

    // Should return only one or none
    val usersFromInvite = traversal.traverse(inviteNode).nodes.toList

    if (usersFromInvite.length > 1) {
      fail(INTERNAL_SERVER_ERROR, ERR_INVITE_MULTIPLE_USERS, "Invite " + getUUID(inviteNode) + " has multiple users created from it")
    } else {
      if (usersFromInvite.isEmpty){
        Right(invite)
      }else{
        Right(invite.copy(invitee = Some(getUUID(usersFromInvite(0)))))
      }
    }
  }

  protected def destroyInviteNode(inviteNode: Node)(implicit neo4j: DatabaseService): Response[DestroyResult] = {
    if (inviteNode.hasProperty("accepted")){
      fail(INVALID_PARAMETER, ERR_INVITE_ACCEPTED, "Can't delete accepted invite")
    }else{
      val inviteUUID = getUUID(inviteNode)
      inviteNode.getRelationships().foreach(relationship => relationship.delete)
      inviteNode.delete()
      Right(DestroyResult(scala.List(inviteUUID)))
    }
  }
}