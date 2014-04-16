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
      setResult <- Right(getSetResult(info._2, true)).right
      inviteRequestResult <- Right(
          InviteRequestResult(
              info._1,
              if (info._1 == USER_RESULT) None else Some(setResult), 
              info._3
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
        val inviteRequestUUIDMap = scala.collection.mutable.HashMap.empty[String,Node]

        inviteRequestNodes.foreach(inviteRequestNode => {
          
          val uuid = inviteRequestNode.getProperty("uuid").asInstanceOf[String]
          // Because of our duplicate UUID bug, check that this isn't on the list already
          if (inviteRequestUUIDMap.contains(uuid)){
            val duplicateNode =
              if (inviteRequestNode.getRelationships().toList.isEmpty){
                // Prefer earlier
                inviteRequestNode
              }else {
                inviteRequestUUIDMap.get(uuid).get
              }
            // Delete duplicate
            if (duplicateNode.getRelationships().toList.isEmpty){
              println("Deleting invite request for " + duplicateNode.getProperty("email").asInstanceOf[String] 
                        + " has duplicate uuid " 
                        + UUIDUtils.getUUID(duplicateNode.getProperty("uuid").asInstanceOf[String])
                        + " with id " + duplicateNode.getId())
              duplicateNode.delete
            }
          }else {
            inviteRequestUUIDMap.put(uuid, inviteRequestNode)
            if (inviteRequestNode.getRelationships().toList.isEmpty) {
              createInviteRequestModifiedIndex(inviteRequestNode)
              count += 1
            }
          }       
        })
        Right(CountResult(count))
    }
  }

  // PRIVATE

  protected def createInviteRequestInformation(inviteRequest: InviteRequest): Response[(InviteRequestResultType, Node, Option[Int])] = {
    withTx {
      implicit neo =>
        // First check if user
        val userNodeList = findNodesByLabelAndProperty(OwnerLabel.USER, "email", inviteRequest.email).toList
        if (!userNodeList.isEmpty) {
          return Right(USER_RESULT, userNodeList(0), None)
        }
        val inviteNodeList = findNodesByLabelAndProperty(MainLabel.INVITE, "email", inviteRequest.email).toList
        if (!inviteNodeList.isEmpty) {
          return Right(INVITE_RESULT, inviteNodeList(0), None)
        }
        val requestNodeList = findNodesByLabelAndProperty(MainLabel.REQUEST, "email", inviteRequest.email).toList
        if (!requestNodeList.isEmpty) {
          val inviteRequestQueueNumberResponse = getInviteRequestQueueNumber(requestNodeList(0))
          if (inviteRequestQueueNumberResponse.isLeft) Left(inviteRequestQueueNumberResponse.left.get)
          return Right((INVITE_REQUEST_RESULT, requestNodeList(0),
            Some(inviteRequestQueueNumberResponse.right.get.queueNumber)))
        }

        // Need to create a new invite request
        val inviteRequestResponse = createInviteRequest(inviteRequest)
        if (inviteRequestResponse.isLeft) Left(inviteRequestResponse.left.get)
        else {
          val inviteRequestQueueNumberResponse = getInviteRequestQueueNumber(inviteRequestResponse.right.get)
          if (inviteRequestQueueNumberResponse.isLeft) Left(inviteRequestQueueNumberResponse.left.get)
          else Right((NEW_INVITE_REQUEST_RESULT,
            inviteRequestResponse.right.get,
            Some(inviteRequestQueueNumberResponse.right.get.queueNumber)))
        }
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
          val invite = Invite(email, Random.generateRandomUnsignedLong, None, message, None, None)
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

}