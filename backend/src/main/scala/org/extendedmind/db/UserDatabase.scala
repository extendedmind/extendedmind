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

trait UserDatabase extends AbstractGraphDatabase {

  // PUBLIC

  def signUp(signUp: SignUp, adminSignUp: Boolean): Response[SetResult] = {
    for{
      user <- createUser(User(signUp.email), signUp.password, (if (adminSignUp) Some(UserLabel.ADMIN) else None)).right
      result <- Right(getSetResult(user, true)).right
    }yield result
  }
  
  def putNewUser(user: User, password: String, signUpMode: SignUpMode): Response[SetResult] = {
    val signUpExtraLabel = {
      signUpMode match {
        case MODE_ADMIN => Some(UserLabel.ADMIN)
        case MODE_ALFA => Some(UserLabel.ALFA)
        case MODE_BETA => Some(UserLabel.BETA)
        case _ => None
      }
    }
    
    for{
      user <- createUser(user, password, signUpExtraLabel).right
      result <- Right(getSetResult(user, true)).right
    }yield result
  }
  
  def putExistingUser(userUUID: UUID, user: User): Response[(SetResult, Boolean)] = {
    for {
      updateResult <- updateUser(userUUID, user).right
      result <- Right(getSetResult(updateResult._1, false)).right
    } yield (result, updateResult._2)
  }

  def getUser(email: String): Response[User] = {
    withTx{
      implicit neo =>
        for{
          userNode <- getUserNode(email).right
          user <- toCaseClass[User](userNode).right
        }yield user
    }
  }
  
  def getUser(uuid: UUID): Response[User] = {
    withTx{
      implicit neo =>
        for{
          userNode <- getNode(uuid, OwnerLabel.USER).right
          user <- toCaseClass[User](userNode).right
        }yield user
    }
  }
  
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
          Right(InviteRequests(List()))}
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
          Right(Invites(List()))}
        else {
          Right(Invites(inviteNodeList map (inviteNode => {
            val response = toCaseClass[Invite](inviteNode)
            if (response.isLeft) return Left(response.left.get)
            else response.right.get
          })))
        }
    }
  }

  def acceptInvite(code: Long, signUp: SignUp): Response[SetResult] = {
    for {
      userNode <- acceptInviteNode(signUp, code).right
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
            Right(DestroyResult(List(inviteRequestUUID)))
          }
        }
    }
  }
  
  def rebuildUserIndexes: Response[CountResult] = {
    dropIndexes(OwnerLabel.USER)
    createNewIndex(OwnerLabel.USER, "uuid")
    dropIndexes(OwnerLabel.COLLECTIVE)
    createNewIndex(OwnerLabel.COLLECTIVE, "modified")
    dropIndexes(MainLabel.TOKEN)
    createNewIndex(MainLabel.TOKEN, "accessKey")
    Right(CountResult(3))
  }
  
  // PRIVATE
  
  protected def createUser(user: User, plainPassword: String, userLabel: Option[Label] = None): Response[Node] = {
    withTx{
      implicit neo4j =>
        val userNode = createNode(user, MainLabel.OWNER, OwnerLabel.USER)
        if (userLabel.isDefined) userNode.addLabel(userLabel.get)
        setUserPassword(userNode, plainPassword)
        userNode.setProperty("email", user.email)
        
        // Give user read permissions to common collectives
        val collectivesList = findNodesByLabelAndProperty(OwnerLabel.COLLECTIVE, "common", java.lang.Boolean.TRUE).toList
        if (!collectivesList.isEmpty) {
          collectivesList.foreach(collective => {
            userNode --> SecurityRelationship.CAN_READ --> collective;
          })
        }
        Right(userNode)
    }
  }
  
  protected def updateUser(userUUID: UUID, user: User): Response[(Node, Boolean)] = {
    withTx {
      implicit neo4j =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          result <- Right(updateUser(userNode, user)).right
        } yield (userNode, result)
    }
  }
  
  protected def updateUser(userNode: Node, user: User)(implicit neo4j: DatabaseService): Boolean = {
    if (userNode.getProperty("email").asInstanceOf[String] != user.email){
      userNode.setProperty("email", user.email)
      true
    }else{
      false
    }
  }

  protected def setUserPassword(userNode: Node, plainPassword: String)(implicit neo4j: DatabaseService) = {
    val salt = PasswordService.generateSalt
    val encryptedPassword = PasswordService.getEncryptedPassword(
      plainPassword, salt, PasswordService.ALGORITHM, PasswordService.ITERATIONS)
    userNode.setProperty("passwordAlgorithm", encryptedPassword.algorithm)
    userNode.setProperty("passwordIterations", encryptedPassword.iterations)
    userNode.setProperty("passwordHash", Base64.encodeBase64String(encryptedPassword.passwordHash))
    userNode.setProperty("passwordSalt", encryptedPassword.salt)
  }
  
  protected def getUserNode(email: String): Response[Node] = {
    withTx {
      implicit neo =>
        val nodeIter = findNodesByLabelAndProperty(OwnerLabel.USER, "email", email)
        if (nodeIter.toList.isEmpty) {
          fail(INVALID_PARAMETER, "No users found with given email " + email)
        } else if (nodeIter.toList.size > 1) {
          fail(INTERNAL_SERVER_ERROR, "Ḿore than one user found with given email " + email)
        } else
          Right(nodeIter.toList(0))
    }
  }

  protected def getUserNode(tokenNode: Node)(implicit neo4j: DatabaseService): Response[Node] = {
    // Check that token is still valid
    val expires = tokenNode.getProperty("expires").asInstanceOf[Long]
    if (System.currentTimeMillis() > expires) {
      fail(TOKEN_EXPIRED, "Token has expired")
    }else{
      val userFromToken: TraversalDescription = 
        Traversal.description()
          .relationships(DynamicRelationshipType.withName(SecurityRelationship.IDS.name), 
                         Direction.OUTGOING)
          .depthFirst()
          .evaluator(Evaluators.excludeStartPosition())
          .evaluator(LabelEvaluator(List(OwnerLabel.USER)))
          
      val traverser = userFromToken.traverse(tokenNode)
      val userNodeList = traverser.nodes().toArray

      if (userNodeList.length == 0) {
        fail(INTERNAL_SERVER_ERROR, "Token attached to no users")
      } else if (userNodeList.length > 1) {
        fail(INTERNAL_SERVER_ERROR, "Token attached to more than one user")
      } else {
        Right(userNodeList.head)
      }
    }
  }

  protected def getUserNode(token: Token)(implicit log: LoggingContext): Response[Node] = {
    withTx {
      implicit neo =>
        for {
          tokenNode <- getTokenNode(token).right
          userNode <- getUserNode(tokenNode).right
        }yield userNode
    }
  }
  
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
          val invite = Invite(email, Random.generateRandomUnsignedLong, message, None)
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
  
  protected def acceptInviteNode(signUp: SignUp, code: Long): Response[Node] = {
    withTx {
      implicit neo =>
        val user = User(signUp.email)
        for {
          inviteNode <- getInviteNode(code, signUp.email).right
          userNode <- createUser(user, signUp.password, None).right
          relationship <- Right(linkInviteAndUser(inviteNode, userNode)).right
        } yield userNode
    }
  }
  
  protected def linkInviteAndUser(inviteNode: Node, userNode: Node)
                  (implicit neo4j: DatabaseService): Relationship = {
    inviteNode --> SecurityRelationship.IS_ORIGIN --> userNode <
  }
  
  protected def dropIndexes(label: Label): Unit = {
    withTx {
      implicit neo4j =>
      	val indexes = neo4j.gds.schema().getIndexes(label)
      	if (!indexes.isEmpty){
      	  indexes.foreach (index => index.drop())
      	}
    }
  }

  protected def createNewIndex(label: Label, property: String): Unit = {
    withTx {
      implicit neo4j =>
      	neo4j.gds.schema().indexFor(label).on(property).create()
    }
  }
  
}