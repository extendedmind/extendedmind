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
  
  def putNewInviteRequest(inviteRequest: InviteRequest): Response[SetResult] = {
    for{
      ir <- createInviteRequest(inviteRequest).right
      createResponse <- Right(createInviteRequestModifiedIndex(ir)).right
      result <- Right(getSetResult(ir, true)).right
    }yield result
  }
  
  def putExistingInviteRequest(inviteRequestUUID: UUID, inviteRequest: InviteRequest): Response[Tuple3[SetResult, Node, Long]] = {
    for{
      updatedInviteRequest <- updateInviteRequest(inviteRequestUUID, inviteRequest).right
      result <- Right(getSetResult(updatedInviteRequest._1, false)).right
    }yield (result, updatedInviteRequest._1, updatedInviteRequest._2)
  }
  
  def createInviteRequestModifiedIndex(inviteRequestNode: Node): Unit = {
    withTx {
      implicit neo =>
        val inviteRequests = neo.gds.index().forNodes("inviteRequests")
        inviteRequests.add(inviteRequestNode, "modified", 
            new ValueContext(inviteRequestNode.getProperty("modified").asInstanceOf[Long] ).indexNumeric())
    }
  }

  def updateInviteRequestModifiedIndex(inviteRequestNode: Node, oldModified: Long): Unit = {
    withTx {
      implicit neo =>
        val inviteRequests = neo.gds.index().forNodes("inviteRequests")
        inviteRequests.remove(inviteRequestNode, "modified", oldModified)
        inviteRequests.add(inviteRequestNode, "modified", 
            new ValueContext(inviteRequestNode.getProperty("modified").asInstanceOf[Long] ).indexNumeric())
    }
  }
  
  def getInviteRequests(): Response[InviteRequests] = {
    withTx{
      implicit neo =>
        val inviteRequests = neo.gds.index().forNodes("inviteRequests")
        val inviteRequestNodeList = inviteRequests.query( "modified", 
            QueryContext.numericRange("modified", 0, Long.MaxValue).sort("modified")).toList        
        if (inviteRequestNodeList.isEmpty){
          Right(InviteRequests(scala.List()))}
        else {
          Right(InviteRequests(inviteRequestNodeList map (inviteRequestNode => {
            val response = toCaseClass[InviteRequest](inviteRequestNode)
            if (response.isLeft) return Left(response.left.get)
            else response.right.get
          })))
        }
    }
  }
  
  def getInviteRequestQueueNumber(inviteRequestUUID: UUID): Response[InviteRequestQueueNumber] = {
    withTx{
      implicit neo =>
        val inviteRequest = getNode(inviteRequestUUID, MainLabel.REQUEST)
        if (inviteRequest.isLeft) Left(inviteRequest.left.get)
        else{
          val inviteRequests = neo.gds.index().forNodes("inviteRequests")
          val inviteRequestNodeList = inviteRequests.query( "modified", 
              QueryContext.numericRange("modified", 0, Long.MaxValue).sort("modified")).toList
          val queueNumber = inviteRequestNodeList.indexOf(inviteRequest.right.get)
          if (queueNumber < -1){
            fail(INTERNAL_SERVER_ERROR, "Invite request could not be found from invite request index with UUID: " + inviteRequestUUID)
          }else{
            return Right(InviteRequestQueueNumber(queueNumber+1))
          }
        }
    }
  }
  
  def acceptInviteRequest(userUUID: UUID, inviteRequestUUID: UUID, message: Option[String]): 
          Response[(SetResult, Invite)] = {
    for{
      userNode <- getNode(userUUID, OwnerLabel.USER).right
      ir <- createInvite(userNode, inviteRequestUUID, message).right
      result <- Right(getSetResult(ir._1, true)).right
    }yield (result, ir._2)
  }
  
  def putExistingInvite(inviteUUID: UUID, invite: Invite): Response[SetResult] = {
    for{
      updatedInvite <- updateInvite(inviteUUID, invite).right
      result <- Right(getSetResult(updatedInvite, false)).right
    }yield result
  }
  
  def getInvite(code: Long, email: String): Response[Invite] = {
    withTx{
      implicit neo =>
        for {
          inviteNode <- getInviteNode(code, email).right
          invite <- toCaseClass[Invite](inviteNode).right
        } yield invite
    }
  }
  
  def getInvites(): Response[Invites] = {
    withTx{
      implicit neo =>
        val inviteNodeList = findNodesByLabel(MainLabel.INVITE).toList
        if (inviteNodeList.isEmpty){
          Right(Invites(scala.List()))}
        else {
          Right(Invites(inviteNodeList map (inviteNode => {
            val response = toCaseClass[Invite](inviteNode)
            if (response.isLeft) return Left(response.left.get)
            else response.right.get
          })))
        }
    }
  }

  def acceptInvite(signUp: SignUp, code: Long, signUpMode: SignUpMode): Response[SetResult] = {
    for {
      userNode <- acceptInviteNode(signUp, code, signUpMode).right
      result <- Right(getSetResult(userNode, true)).right
    } yield result
  }

  def destroyInviteRequest(inviteRequestUUID: UUID): Response[DestroyResult] = {
    withTx{
      implicit neo4j =>
        val inviteRequest = getNode(inviteRequestUUID, MainLabel.REQUEST)
        if (inviteRequest.isLeft) Left(inviteRequest.left.get)
        else{
          if (!inviteRequest.right.get.getRelationships().toList.isEmpty){
            fail(INVALID_PARAMETER, "Can't delete accepted invite request")
          }else{
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
  
  // PRIVATE
    
  protected def createInviteRequest(inviteRequest: InviteRequest): Response[Node] = {
    withTx {
      implicit neo =>
        Right(createNode(inviteRequest, MainLabel.REQUEST))
    }
  }
  
  protected def updateInviteRequest(inviteRequestUUID: UUID, inviteRequest: InviteRequest):
        Response[(Node, Long)] = {
    withTx {
      implicit neo4j =>
        for {
          inviteRequestNode <- getNode(inviteRequestUUID, MainLabel.REQUEST).right
          updatedNode <- updateNode(inviteRequestNode, inviteRequest).right
        } yield (updatedNode, updatedNode.getProperty("modified").asInstanceOf[Long])
    }
  }
  
  protected def updateInvite(inviteUUID: UUID, invite: Invite): Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          inviteNode <- getNode(inviteUUID, MainLabel.INVITE).right
          updatedNode <- updateNode(inviteNode, invite).right
        } yield updatedNode
    }
  }
  
  protected def createInvite(userNode: Node, inviteRequestUUID: UUID, message: Option[String]):
        Response[(Node, Invite)] = {
    withTx{
      implicit neo =>
        val inviteRequestNode = getNode(inviteRequestUUID, MainLabel.REQUEST)
        if (inviteRequestNode.isLeft) Left(inviteRequestNode.left.get)
        else{
          // Create an invite from the invite request
          val email = inviteRequestNode.right.get.getProperty("email").asInstanceOf[String]
          val invite = Invite(email, Random.generateRandomUnsignedLong, None, message, None)
          val inviteNode = createNode(invite, MainLabel.INVITE)
          inviteRequestNode.right.get --> SecurityRelationship.IS_ORIGIN --> inviteNode
          userNode --> SecurityRelationship.IS_ACCEPTER --> inviteNode 
          // Remove invite request from index
          val inviteRequests = neo.gds.index().forNodes("inviteRequests")
          inviteRequests.remove(inviteRequestNode.right.get)
          Right(inviteNode,invite)
        }
    }
  }
  
  protected def getInviteNode(code: Long, email: String): Response[Node] = {
    withTx {
      implicit neo =>
        val nodeIter = findNodesByLabelAndProperty(MainLabel.INVITE, "code", code: java.lang.Long)
        val invalidParameterDescription = "No invite found with given code " + code
        if (nodeIter.toList.isEmpty) {
          fail(INVALID_PARAMETER, invalidParameterDescription)
        } else if (nodeIter.toList.size > 1) {
          fail(INTERNAL_SERVER_ERROR, "Ḿore than one user found with given code " + code)
        } else{
          val inviteNode = nodeIter.toList(0)
          if (inviteNode.getProperty("email").asInstanceOf[String] != email){
            fail(INVALID_PARAMETER, invalidParameterDescription)
          }else{
            Right(inviteNode)
          }
        }
    }
  }
  
  protected def acceptInviteNode(signUp: SignUp, code: Long, signUpMode: SignUpMode): Response[Node] = {
    withTx {
      implicit neo =>
        val user = User(signUp.email)
        for {
          inviteNode <- getInviteNode(code, signUp.email).right
          userNode <- createUser(user, signUp.password, getExtraUserLabel(signUpMode)).right
          relationship <- Right(linkInviteAndUser(inviteNode, userNode)).right
        } yield userNode
    }
  }
  
  protected def linkInviteAndUser(inviteNode: Node, userNode: Node)
                  (implicit neo4j: DatabaseService): Relationship = {
    val currentTime = System.currentTimeMillis().asInstanceOf[java.lang.Long]
    inviteNode.setProperty("accepted", currentTime)
    // When the user accepts invite using a code sent to her email, 
    // that means that the email is also verified
    userNode.setProperty("emailVerified", currentTime)
    inviteNode --> SecurityRelationship.IS_ORIGIN --> userNode <
  }
  
}