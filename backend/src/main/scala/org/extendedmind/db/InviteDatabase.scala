/**
 * Copyright (c) 2013-2014 Extended Mind Technologies Oy
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
import org.neo4j.graphdb.Relationship
import spray.util.LoggingContext

trait InviteDatabase extends UserDatabase {

  // PUBLICs

  def putExistingInvite(inviteUUID: UUID, invite: Invite): Response[SetResult] = {
    for {
      updatedInvite <- updateInvite(inviteUUID, invite).right
      result <- Right(getSetResult(updatedInvite, false)).right
    } yield result
  }
  
  def getInvite(code: Long, email: String): Response[Invite] = {
    withTx {
      implicit neo =>
        for {
          inviteNode <- getInviteNode(code, email).right
          invite <- toCaseClass[Invite](inviteNode).right
        } yield invite
    }
  }
  
  def getInvite(inviteUUID: UUID, email: String): Response[Invite] = {
    withTx {
      implicit neo =>
	    for {
	      inviteNode <- getInviteNode(inviteUUID, email).right
	      invite <- toCaseClass[Invite](inviteNode).right
	    } yield invite
    }
  }

  def getInvites(): Response[Invites] = {
    withTx {
      implicit neo =>
        val inviteNodeList = findNodesByLabel(MainLabel.INVITE).toList
        if (inviteNodeList.isEmpty) {
          Right(Invites(scala.List()))
        } else {
          Right(Invites(inviteNodeList map (inviteNode => {
            val response = toCaseClass[Invite](inviteNode)
            if (response.isLeft) return Left(response.left.get)
            else response.right.get
          })))
        }
    }
  }

  def acceptInvite(signUp: SignUp, code: Long, signUpMode: SignUpMode): Response[(SetResult, Option[Long])] = {
    for {
      acceptResult<- acceptInviteNode(signUp, code, signUpMode).right
      result <- Right(getSetResult(acceptResult._1, true)).right
    } yield (result, acceptResult._2)
  }

  def destroyInviteRequest(inviteRequestUUID: UUID): Response[DestroyResult] = {
    withTx {
      implicit neo4j =>
        val inviteRequest = getNode(inviteRequestUUID, MainLabel.REQUEST)
        if (inviteRequest.isLeft) Left(inviteRequest.left.get)
        else {
          if (!inviteRequest.right.get.getRelationships().toList.isEmpty) {
            fail(INVALID_PARAMETER, ERR_INVITE_DELETE_ACCEPTED, "Can't delete accepted invite request")
          } else {
            // First delete it from the index
            val inviteRequests = neo4j.gds.index().forNodes("inviteRequests")
            inviteRequests.remove(inviteRequest.right.get)
            // Delete it completely
            inviteRequest.right.get.delete()
            Right(DestroyResult(scala.List(inviteRequestUUID)))
          }
        }
    }
  }
  
  def destroyInvite(inviteUUID: UUID): Response[DestroyResult] = {
    withTx {
      implicit neo4j =>
        for {
          inviteNode <- getNode(inviteUUID, MainLabel.INVITE).right
          result <- destroyInviteNode(inviteNode).right
        } yield result
    }
  }

  // PRIVATE

  protected def updateInvite(inviteUUID: UUID, invite: Invite): Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          inviteNode <- getNode(inviteUUID, MainLabel.INVITE).right
          updatedNode <- updateNode(inviteNode, invite).right
        } yield updatedNode
    }
  }

  protected def createInvite(userNode: Option[Node], inviteRequestUUID: UUID, message: Option[String]): Response[(Node, Invite)] = {
    withTx {
      implicit neo =>
        val inviteRequestNode = getNode(inviteRequestUUID, MainLabel.REQUEST)
        if (inviteRequestNode.isLeft) Left(inviteRequestNode.left.get)
        else {
          // Create an invite from the invite request
          val email = inviteRequestNode.right.get.getProperty("email").asInstanceOf[String]
          val invite = Invite(None, email, Random.generateRandomUnsignedLong, None, message, None, None)
          val inviteNode = createNode(invite, MainLabel.INVITE)
          inviteRequestNode.right.get --> SecurityRelationship.IS_ORIGIN --> inviteNode
          if (userNode.isDefined){
            userNode.get --> SecurityRelationship.IS_ACCEPTER --> inviteNode
          }
          // Remove invite request from index
          val inviteRequests = neo.gds.index().forNodes("inviteRequests")
          inviteRequests.remove(inviteRequestNode.right.get)
          Right(inviteNode, invite)
        }
    }
  }

  protected def getInviteNode(code: Long, email: String): Response[Node] = {
    withTx {
      implicit neo =>
        val nodeIter = findNodesByLabelAndProperty(MainLabel.INVITE, "code", code: java.lang.Long)
        val invalidParameterDescription = "No invite found with given code " + code
        if (nodeIter.toList.isEmpty) {
          fail(INVALID_PARAMETER, ERR_INVITE_NOT_FOUND, invalidParameterDescription)
        } else if (nodeIter.toList.size > 1) {
          fail(INTERNAL_SERVER_ERROR, ERR_INVITE_MORE_THAN_1, "Ḿore than one user found with given code " + code)
        } else {
          val inviteNode = nodeIter.toList(0)
          if (inviteNode.getProperty("email").asInstanceOf[String] != email) {
            fail(INVALID_PARAMETER, ERR_INVITE_NOT_FOUND_EMAIL, invalidParameterDescription)
          } else {
            Right(inviteNode)
          }
        }
    }
  }
  
  protected def getInviteNode(uuid: UUID, email: String): Response[Node] = {
    withTx {
      implicit neo =>
        val inviteNode = getNode(uuid, MainLabel.INVITE)
        if (inviteNode.isLeft) Left(inviteNode.left.get)
        else{
          if(inviteNode.right.get.getProperty("email").asInstanceOf[String] == email){
            Right(inviteNode.right.get)          
          }else{
            fail(INVALID_PARAMETER, ERR_INVITE_NOT_FOUND_UUID, "invite not found with given UUID " + uuid + " and email " + email)
          }
        }
    }
  }

  protected def acceptInviteNode(signUp: SignUp, code: Long, signUpMode: SignUpMode): Response[(Node, Option[Long])] = {
    val currentTime = System.currentTimeMillis().asInstanceOf[java.lang.Long]
    withTx {
      implicit neo =>
        val user = User(signUp.email, signUp.cohort, None)
        for {
          inviteNode <- getInviteNode(code, signUp.email).right
          userNodeResult <- createUser(user, signUp.password, getExtraUserLabel(signUpMode), 
        		  				 emailVerified = if (signUp.bypass.isDefined && signUp.bypass.get) None else Some(currentTime)).right
          relationship <- Right(linkInviteAndUser(inviteNode, userNodeResult._1, currentTime)).right
        } yield (userNodeResult._1, userNodeResult._2)
    }
  }

  protected def linkInviteAndUser(inviteNode: Node, userNode: Node, currentTime: Long)(implicit neo4j: DatabaseService): Relationship = {
    inviteNode.setProperty("accepted", currentTime)
    inviteNode --> SecurityRelationship.IS_ORIGIN --> userNode <
  }
  
  protected def getInviteUUIDs(label: Label): Response[scala.List[UUID]] = {
    withTx {
      implicit neo4j =>
        val inviteNodeList = findNodesByLabel(label).toList
        val inviteUUIDList = inviteNodeList.map(inviteNode => {
          getUUID(inviteNode)
        })
        Right(inviteUUIDList)
    }
  }
  
  protected def destroyInviteNode(inviteNode: Node)(implicit neo4j: DatabaseService): Response[DestroyResult] = {
    if (inviteNode.hasProperty("accepted")){
      fail(INVALID_PARAMETER, ERR_INVITE_DESTROY_ACCEPTED, "Can't delete accepted invite")
    }else{
      val inviteRelationshipList = inviteNode.getRelationships().toList
      val acceptRelationships = inviteRelationshipList.filter(relationship => {
        if (relationship.getType().name() == SecurityRelationship.IS_ACCEPTER.name()) true
        else false
      })
      val originRelationships = inviteRelationshipList.filter(relationship => {
        if (relationship.getType().name() == SecurityRelationship.IS_ORIGIN.name()) true
        else false
      })

      if (acceptRelationships.size > 1){
        fail(INTERNAL_SERVER_ERROR, ERR_INVITE_REL_ACCEPTED, "Invalid number of accept relationships for invite " + getUUID(inviteNode))
      }else if (originRelationships.size > 1){
        fail(INTERNAL_SERVER_ERROR, ERR_INVITE_REL_ORIGIN, "Invalid number of origin relationships for invite " + getUUID(inviteNode))
      }else{
        if (acceptRelationships.size == 1)
          acceptRelationships(0).delete()
        
        val deletedInviteRequestUUID = {
          if (originRelationships.size == 1){
            val inviteRequestNode = originRelationships(0).getStartNode()
            originRelationships(0).delete()
            if (inviteRequestNode.getRelationships().toList.size > 1){
              // This invite request has two invites attached to it, don't delete the invite request
              None
            }else{
              if (inviteRequestNode.getRelationships().toList.size == 1){
                // Delete the accepted relationship
                inviteRequestNode.getRelationships().toList(0).delete()
              }
              val uuid = getUUID(inviteRequestNode)
              inviteRequestNode.delete()
              Some(uuid)
            }
          }else{
            None
          }
        }
        
        val destroyedUuids = 
          if (deletedInviteRequestUUID.isDefined)
            scala.List(deletedInviteRequestUUID.get, getUUID(inviteNode))
          else scala.List(getUUID(inviteNode))
        inviteNode.delete()
        Right(DestroyResult(destroyedUuids))
      }
    }
  }
}