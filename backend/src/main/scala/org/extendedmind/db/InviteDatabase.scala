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

  def postInviteRequest(inviteRequest: InviteRequest): Response[InviteRequestResult] = {
    for {
      info <- createInviteRequestInformation(inviteRequest).right
      queueNumber <- updateInviteRequestIndex(info._1, info._2).right
      setResult <- Right(
          if (info._1 == USER_RESULT || info._1 == SIGNUP_RESULT) None 
          else Some(getSetResult(info._2.get, true))).right
      inviteRequestResult <- Right(
          InviteRequestResult(
              info._1,
              setResult,
              queueNumber,
              if (info._3.isDefined && settings.signUpMethod == SIGNUP_ON) 
                Some(info._3.get.toHexString) 
              else None
          )).right
    } yield inviteRequestResult
  }

  def putNewInviteRequest(inviteRequest: InviteRequest): Response[SetResult] = {
    for {
      ir <- createInviteRequest(inviteRequest).right
      createResponse <- Right(createInviteRequestModifiedIndex(ir)).right
      result <- Right(getSetResult(ir, true)).right
    } yield result
  }

  def putExistingInviteRequest(inviteRequestUUID: UUID, inviteRequest: InviteRequest): Response[Tuple3[SetResult, Node, Long]] = {
    for {
      updatedInviteRequest <- updateInviteRequest(inviteRequestUUID, inviteRequest).right
      result <- Right(getSetResult(updatedInviteRequest._1, false)).right
    } yield (result, updatedInviteRequest._1, updatedInviteRequest._2)
  }

  def createInviteRequestModifiedIndex(inviteRequestNode: Node): Unit = {
    withTx {
      implicit neo =>
        val inviteRequests = neo.gds.index().forNodes("inviteRequests")
        inviteRequests.add(inviteRequestNode, "modified",
          new ValueContext(inviteRequestNode.getProperty("modified").asInstanceOf[Long]).indexNumeric())
    }
  }

  def updateInviteRequestModifiedIndex(inviteRequestNode: Node, oldModified: Long): Unit = {
    withTx {
      implicit neo =>
        val inviteRequests = neo.gds.index().forNodes("inviteRequests")
        inviteRequests.remove(inviteRequestNode, "modified", oldModified)
        inviteRequests.add(inviteRequestNode, "modified",
          new ValueContext(inviteRequestNode.getProperty("modified").asInstanceOf[Long]).indexNumeric())
    }
  }

  def getInviteRequests(): Response[InviteRequests] = {
    withTx {
      implicit neo =>
        val inviteRequests = neo.gds.index().forNodes("inviteRequests")
        val inviteRequestNodeList = inviteRequests.query("modified",
          QueryContext.numericRange("modified", 0, Long.MaxValue).sort("modified")).toList
        if (inviteRequestNodeList.isEmpty) {
          Right(InviteRequests(scala.List()))
        } else {
          Right(InviteRequests(inviteRequestNodeList map (inviteRequestNode => {
            val response = toCaseClass[InviteRequest](inviteRequestNode)
            if (response.isLeft) return Left(response.left.get)
            else response.right.get
          })))
        }
    }
  }

  def getInviteRequestQueueNumber(inviteRequestUUID: UUID): Response[InviteRequestQueueNumber] = {
    withTx {
      implicit neo =>
        for {
          inviteRequestNode <- getNode(inviteRequestUUID, MainLabel.REQUEST).right
          inviteRequestQueueNumber <- getInviteRequestQueueNumber(inviteRequestNode).right
        } yield inviteRequestQueueNumber
    }
  }

  def acceptInviteRequest(userUUID: Option[UUID], inviteRequestUUID: UUID, message: Option[String]): Response[(SetResult, Invite)] = {
    // First get user node result, hard to do in for comprehension
    val userNodeResult: Option[Response[Node]] = 
      if (userUUID.isDefined) Some(getNode(userUUID.get, OwnerLabel.USER))
      else None
    // Handle errors
    if (userNodeResult.isDefined && userNodeResult.get.isLeft){
      return Left(userNodeResult.get.left.get)
    }
    // Get node value
    val userNode: Option[Node] = 
      if (userNodeResult.isDefined) Some(userNodeResult.get.right.get)
      else None

    for {
      ir <- createInvite(userNode, inviteRequestUUID, message).right
      result <- Right(getSetResult(ir._1, true)).right
    } yield (result, ir._2)
  }

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
            fail(INVALID_PARAMETER, "Can't delete accepted invite request")
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

  def rebuildInviteRequestsIndex: Response[CountResult] = {
    withTx {
      implicit neo4j =>
        val inviteRequests = neo4j.gds.index().forNodes("inviteRequests")
        val oldInvitesInIndex = inviteRequests.query("*:*").toList
        oldInvitesInIndex.foreach(inviteRequestNode => {
          inviteRequests.remove(inviteRequestNode)
        })

        // Add all back to index
        val inviteRequestNodes = findNodesByLabel(MainLabel.REQUEST)
        var count = 0

        inviteRequestNodes.foreach(inviteRequestNode => {
	      if (inviteRequestNode.getRelationships().toList.isEmpty) {
	        createInviteRequestModifiedIndex(inviteRequestNode)
	        count += 1
	      }
        })
        Right(CountResult(count))
    }
  }
  
  def upgradeInvites: Response[CountResult] = {
    for {
      inviteRequestUUIDs <- getInviteUUIDs(MainLabel.REQUEST).right
      inviteUUIDs <- getInviteUUIDs(MainLabel.INVITE).right
      count <- upgradeInvites(inviteRequestUUIDs, inviteUUIDs).right
    } yield count
  }

  // PRIVATE

  protected def createInviteRequestInformation(inviteRequest: InviteRequest): Response[(InviteRequestResultType, Option[Node], Option[Long])] = {
    withTx {
      implicit neo =>
        // First check if user
        val userNodeList = findNodesByLabelAndProperty(OwnerLabel.USER, "email", inviteRequest.email).toList
        if (!userNodeList.isEmpty) {
          return Right(USER_RESULT, Some(userNodeList(0)), None)
        }
        val inviteNodeList = findNodesByLabelAndProperty(MainLabel.INVITE, "email", inviteRequest.email).toList
        if (!inviteNodeList.isEmpty) {
          return Right(INVITE_RESULT, Some(inviteNodeList(0)), Some(inviteNodeList(0).getProperty("code").asInstanceOf[Long]))
        }
        val requestNodeList = findNodesByLabelAndProperty(MainLabel.REQUEST, "email", inviteRequest.email).toList
        if (!requestNodeList.isEmpty) {
          return Right(INVITE_REQUEST_RESULT, Some(requestNodeList(0)), None)
        }
        if (inviteRequest.bypass.isDefined && inviteRequest.bypass.get && settings.signUpMethod == SIGNUP_ON){
          return Right(SIGNUP_RESULT, None, None)
        }

        // Need to create a new invite request
        val inviteRequestResponse = createInviteRequest(inviteRequest)
        if (inviteRequestResponse.isLeft) Left(inviteRequestResponse.left.get)
        else {
          val inviteRequestQueueNumberResponse = getInviteRequestQueueNumber(inviteRequestResponse.right.get)
          if (inviteRequestQueueNumberResponse.isLeft) Left(inviteRequestQueueNumberResponse.left.get)
          else Right(NEW_INVITE_REQUEST_RESULT,
            Some(inviteRequestResponse.right.get), None)
        }
    }
  }
  
  protected def updateInviteRequestIndex(resultType: InviteRequestResultType, node: Option[Node]): Response[Option[Int]] = {
    withTx {
      implicit neo =>
        val queueNumber: Option[Int] = resultType match {
          case USER_RESULT => None
          case SIGNUP_RESULT => None
          case INVITE_RESULT => None
          case INVITE_REQUEST_RESULT => {
            val result = getInviteRequestQueueNumber(node.get)
            if (result.isLeft) return Left(result.left.get)
            else Some(result.right.get.queueNumber)
          }
          case NEW_INVITE_REQUEST_RESULT => {
            createInviteRequestModifiedIndex(node.get)
            val result = getInviteRequestQueueNumber(node.get)
            if (result.isLeft) return Left(result.left.get)
            else Some(result.right.get.queueNumber)
          }
          case _ => {
            return fail(INTERNAL_SERVER_ERROR, "Unexpected invite request result type")
          }
        }
        Right(queueNumber)
    }
  }

  protected def createInviteRequest(inviteRequest: InviteRequest): Response[Node] = {
    withTx {
      implicit neo =>

        Right(createNode(inviteRequest, MainLabel.REQUEST))
    }
  }

  protected def updateInviteRequest(inviteRequestUUID: UUID, inviteRequest: InviteRequest): Response[(Node, Long)] = {
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

  protected def getInviteRequestQueueNumber(inviteRequestNode: Node)(implicit neo4j: DatabaseService): Response[InviteRequestQueueNumber] = {
    val inviteRequests = neo4j.gds.index().forNodes("inviteRequests")
    val inviteRequestNodeList = inviteRequests.query("modified",
      QueryContext.numericRange("modified", 0, Long.MaxValue).sort("modified")).toList
    val queueNumber = inviteRequestNodeList.indexOf(inviteRequestNode)
    if (queueNumber < -1) {
      fail(INTERNAL_SERVER_ERROR, "Invite request could not be found from invite request index with id: " + inviteRequestNode.getId())
    } else {
      return Right(InviteRequestQueueNumber(queueNumber + 1))
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
        } else {
          val inviteNode = nodeIter.toList(0)
          if (inviteNode.getProperty("email").asInstanceOf[String] != email) {
            fail(INVALID_PARAMETER, invalidParameterDescription)
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
            fail(INVALID_PARAMETER, "invite not found with given UUID " + uuid + " and email " + email)
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
  
  protected def upgradeInvites(inviteRequestUUIDs: scala.List[UUID], inviteUUIDs: scala.List[UUID]): Response[CountResult] = {
    var count = 0;
    inviteRequestUUIDs.foreach(inviteRequestUUID => {
      val upgradeResult = upgradeInviteNode(inviteRequestUUID, MainLabel.REQUEST)
      if (upgradeResult.isLeft) {
        return Left(upgradeResult.left.get)
      }else if (upgradeResult.right.get){
        count += 1;
      }
    })
    
    inviteUUIDs.foreach(inviteUUID => {
      val upgradeResult = upgradeInviteNode(inviteUUID, MainLabel.INVITE)
      if (upgradeResult.isLeft) {
        return Left(upgradeResult.left.get)
      }else if (upgradeResult.right.get){
        count += 1;
      }
    })
    Right(CountResult(count))
  }

  protected def upgradeInviteNode(uuid: UUID, label: Label): Response[Boolean] = {
    withTx {
      implicit neo4j =>
        val nodeResponse = getNode(uuid, label)
        if (nodeResponse.isLeft)
          Left(nodeResponse.left.get)
        else {
          val node = nodeResponse.right.get
          if (node.hasProperty("created")) {
            Right(false)
          } else {
            node.setProperty("created", node.getProperty("modified").asInstanceOf[Long])
            Right(true)
          }
        }
    }
  }

}