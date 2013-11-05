package org.extendedmind.db

import java.util.UUID
import scala.collection.JavaConversions._
import scala.collection.JavaConverters._
import org.apache.commons.codec.binary.Base64
import org.extendedmind.security._
import org.extendedmind._
import org.extendedmind.Response._
import org.neo4j.graphdb.Direction
import org.neo4j.graphdb.DynamicRelationshipType
import org.neo4j.graphdb.Node
import org.neo4j.graphdb.traversal.Evaluators
import org.neo4j.graphdb.traversal.TraversalDescription
import org.neo4j.kernel.Traversal
import org.neo4j.scala.DatabaseService
import org.neo4j.graphdb.traversal.Evaluation
import scala.collection.mutable.HashMap
import org.neo4j.graphdb.Relationship
import spray.util.LoggingContext

trait SecurityDatabase extends AbstractGraphDatabase with UserDatabase {
  
  // Token is valid for twelve hours
  val TOKEN_DURATION: Long = 12 * 60 * 60 * 1000
  // If rememberMe is set, the token can be replaced for 7 days
  val TOKEN_REPLACEABLE: Long = 7 * 24 * 60 * 60 * 1000

  // PUBLIC

  def generateToken(email: String, attemptedPassword: String, payload: Option[AuthenticatePayload]): Response[SecurityContext] = {
    withTx {
      implicit neo =>
        for {
          scWithoutToken <- authenticate(email, attemptedPassword).right
          token <- Right(Token(scWithoutToken.userUUID)).right
          saved <- Right(saveToken(scWithoutToken.user, token, payload)).right
          sc <- Right(scWithoutToken.copy(token = Some(Token.encryptToken(token)))).right
          } yield sc
    }
  }

  def swapToken(oldToken: String, payload: Option[AuthenticatePayload]): Response[SecurityContext] = {
    val currentTime = System.currentTimeMillis()
    withTx {
      implicit neo =>
        for {
          token <- Token.decryptToken(oldToken).right
          tokenNode <- getTokenNode(token).right
          tokenNode <- validateTokenReplacable(tokenNode, currentTime).right
          userNode <- getUserNode(tokenNode).right
          sc <- Right(getSecurityContext(userNode)).right
          sc <- Right(createNewAccessKey(tokenNode, sc, payload)).right
        } yield sc
    }
  }

  def authenticate(email: String, attemptedPassword: String): Response[SecurityContext] = {
    withTx{
      implicit neo4j => 
        for {
          user <- getUserNode(email).right
          sc <- validatePassword(user, attemptedPassword).right
        } yield sc
    }
  }
  
  def authenticate(email: String, attemptedPassword: String, ownerUUID: Option[UUID]): Response[SecurityContext] = {
    withTx{
      implicit neo4j => 
        for {
          user <- getUserNode(email).right
          collectiveUUID <- Right(getCollectiveUUID(user, ownerUUID)).right
          sc <- validatePassword(user, attemptedPassword, collectiveUUID).right
        } yield sc
    }
  }

  def authenticate(token: String, ownerUUID: Option[UUID])(implicit log: LoggingContext): Response[SecurityContext] = {
    withTx{
      implicit neo4j => 
        for {
          token <- Token.decryptToken(token).right
          user <- getUserNode(token).right
          collectiveUUID <- Right(getCollectiveUUID(user, ownerUUID)).right
          sc <- getSecurityContext(user, collectiveUUID).right
        } yield sc
    }
  }
  
  def validateEmailUniqueness(email: String): Response[Boolean] = {
    withTx{
      implicit neo4j => 
        val userNodeList = findNodesByLabelAndProperty(OwnerLabel.USER, "email", email).toList
        if (!userNodeList.isEmpty){
          return fail(INVALID_PARAMETER, "User already exists with given email: " + email)
        }
        val requestNodeList = findNodesByLabelAndProperty(MainLabel.REQUEST, "email", email).toList
        if (!requestNodeList.isEmpty){
          return fail(INVALID_PARAMETER, "Request already exists with given email: " + email)      
        }
        val inviteNodeList = findNodesByLabelAndProperty(MainLabel.INVITE, "email", email).toList
        if (!requestNodeList.isEmpty){
          return fail(INVALID_PARAMETER, "Invite already exists with given email: " + email)      
        }
        Right(true)
    }
  }
  
  def logout(encryptedToken: String): Response[SecurityContext] = {
    withTx{
      implicit neo4j => 
        for {
          token <- Token.decryptToken(encryptedToken).right
          tokenNode <- getTokenNode(token).right
          userNode <- getUserNode(tokenNode).right
          result <- Right(destroyToken(tokenNode)).right
          sc <- getSecurityContext(userNode, None).right
        } yield sc
    }
  }
  
  def destroyTokens(userUUID: UUID): Response[CountResult] = {
    withTx{
      implicit neo4j => 
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          result <- destroyTokens(userNode).right
        } yield result
    }
  }
  
  def changePassword(userUUID: UUID, newPassword: String): Response[Unit] = {
    withTx{
      implicit neo4j =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          result <- Right(setUserPassword(userNode, newPassword)).right
        } yield result
    }
  }
  
  def changeUserType(userUUID: UUID, userType: Integer): Response[SetResult] = {
    for {
      userNode <- changeUserNodeType(userUUID, userType).right
      result <- Right(getSetResult(userNode, false)).right
    } yield result
  }
  
  def destroyAllTokens: Response[CountResult] = {
    withTx {
      implicit neo4j =>
        val tokens = findNodesByLabel(MainLabel.TOKEN)
        val count = tokens.size
        tokens.foreach { token => {
         token.getRelationships() foreach {relationship => relationship.delete}
         token.delete() 
        }}
        Right(CountResult(count))
    }
  }
  
  // PRIVATE
  
  protected def validateTokenReplacable(tokenNode: Node, currentTime: Long): Response[Node] = {
    if (tokenNode.hasProperty("replaceable")) {
      val replaceable = tokenNode.getProperty("replaceable").asInstanceOf[Long];
      if (currentTime < replaceable) {
        Right(tokenNode)
      } else fail(TOKEN_EXPIRED, "Token no longer replaceable")
    } else fail(INVALID_PARAMETER, "Token not replaceable")
  }

  protected def createNewAccessKey(tokenNode: Node, sc: SecurityContext, payload: Option[AuthenticatePayload])(implicit neo4j: DatabaseService): SecurityContext = {
    // Make new token and set properties to the token node
    val token = Token(sc.userUUID)
    setTokenProperties(tokenNode, token, payload)
    SecurityContext(
      sc.userUUID,
      sc.userType,
      Some(Token.encryptToken(token)),
      sc.collectives)
  }

  protected def saveToken(userNode: Node, token: Token, payload: Option[AuthenticatePayload]) {
    withTx {
      implicit neo =>
        val tokenNode = createNode(MainLabel.TOKEN)
        setTokenProperties(tokenNode, token, payload);
        tokenNode --> SecurityRelationship.IDS --> userNode
    }
  }
  
  def destroyTokens(userNode: Node): Response[CountResult] = {
    withTx{
      implicit neo4j => 
        val tokenTraversal = Traversal.description()
          .breadthFirst()
          .relationships(DynamicRelationshipType.withName(SecurityRelationship.IDS.name), Direction.INCOMING)
          .evaluator(Evaluators.excludeStartPosition())
          .evaluator(LabelEvaluator(List(MainLabel.TOKEN)))
          .evaluator(Evaluators.toDepth(1))
          .traverse(userNode)
        val tokenList = tokenTraversal.nodes().toList
        val deleteCount = tokenList.size
        tokenList.foreach(tokenNode => {
          destroyToken(tokenNode)
        })
        Right(CountResult(deleteCount))
    }
  }
  
  protected def destroyToken(tokenNode: Node)(implicit neo4j: DatabaseService) {
    // Remove all relationships
    val relationShipList = tokenNode.getRelationships().toList
    relationShipList.foreach(relationship => relationship.delete())
    // Delete token itself
    tokenNode.delete()
  }

  private def setTokenProperties(tokenNode: Node, token: Token, payload: Option[AuthenticatePayload])
                                (implicit neo4j: DatabaseService){
    val currentTime = System.currentTimeMillis()
    tokenNode.setProperty("accessKey", token.accessKey)
    tokenNode.setProperty("expires", currentTime + TOKEN_DURATION)
    if (payload.isDefined && payload.get.rememberMe) {
      // Remember me has been clicked
      tokenNode.setProperty("replaceable", currentTime + TOKEN_REPLACEABLE)
    }else if (tokenNode.hasProperty("replaceable")){
      tokenNode.removeProperty("replaceable")
    }
  }

  private def getStoredPassword(user: Node): Password = {
    Password(
      user.getProperty("passwordAlgorithm").asInstanceOf[String],
      user.getProperty("passwordIterations").asInstanceOf[Int],
      Base64.decodeBase64(user.getProperty("passwordHash").asInstanceOf[String]),
      user.getProperty("passwordSalt").asInstanceOf[Array[Byte]])
  }

  private def validatePassword(user: Node, attemptedPassword: String): Response[SecurityContext] = {
    for{
      validPassword <- validatePassword(attemptedPassword, getStoredPassword(user)).right
      sc <- Right(getSecurityContext(user)).right
    } yield sc
  }
  
  private def validatePassword(user: Node, attemptedPassword: String, collectiveUUID: Option[UUID]): Response[SecurityContext] = {
    for{
      validPassword <- validatePassword(attemptedPassword, getStoredPassword(user)).right
      sc <- getSecurityContext(user, collectiveUUID).right
    } yield sc
  }
  
  private def validatePassword(attemptedPassword: String, storedPassword: Password): Response[Boolean] = {
    // Check password
    if (PasswordService.authenticate(attemptedPassword, storedPassword)) {
      Right(true)
    } else {
      fail(INVALID_PARAMETER, "Invalid password")
    }
  }
    
  private def getCollectiveUUID(user: Node, ownerUUID: Option[UUID]): Option[UUID] = {
    if (ownerUUID.isDefined && (getUUID(user) == ownerUUID.get)) None
    else ownerUUID
  }

  private def getSecurityContext(user: Node): SecurityContext = {
    getCompleteSecurityContext(user, getUserType(user))
  }
  
  private def getSecurityContext(user: Node, collectiveUUID: Option[UUID]): Response[SecurityContext] = {
    getLimitedSecurityContext(user, getUserType(user), collectiveUUID)
  }
  
  

  private def getCompleteSecurityContext(user: Node, userType: Byte): SecurityContext = {
    val traverser = collectivesTraversalDescription.traverse(user)
    val relationshipList = traverser.relationships().toList
    val sc = getSecurityContextSkeleton(user, userType).copy(
               collectives = getCollectiveAccess(relationshipList))
    sc.user = user
    sc
  }
  
  private def getLimitedSecurityContext(user: Node, userType: Byte, collectiveUUID: Option[UUID]):
                  Response[SecurityContext] = {
    val collectives: Option[Map[UUID,(String, Byte)]] = {
      if (collectiveUUID.isEmpty){
        None
      }else{
        // Get access right for the collective
        val traverser = collectivesTraversalDescription
                        .evaluator(UUIDEvaluator(collectiveUUID.get))
                        .traverse(user)
        val relationshipList = traverser.relationships().toList
        if (relationshipList.isEmpty){ 
          return fail(INVALID_PARAMETER, "No access right to collective " + collectiveUUID.get + 
                                         " or collective does not exist")
        }else{
          getCollectiveAccess(relationshipList)
        }
      }
    }
    val sc = getSecurityContextSkeleton(user, userType).copy(
      collectives = collectives)
    sc.user = user
    Right(sc)
  }
  
  private def getCollectiveAccess(relationshipList: List[Relationship]): Option[Map[UUID,(String, Byte)]] = {
    if (relationshipList.isEmpty) None
    else{
      val collectiveAccessMap = new HashMap[UUID,(String, Byte)]
      relationshipList foreach (relationship => {
        val collective = relationship.getEndNode()
        val title = collective.getProperty("title").asInstanceOf[String]
        val uuid = getUUID(collective)
        relationship.getType().name() match {
          case SecurityRelationship.IS_FOUNDER.relationshipName => 
            collectiveAccessMap.put(uuid, (title, SecurityContext.FOUNDER))
          case SecurityRelationship.CAN_READ.relationshipName => {
            if (!collectiveAccessMap.contains(uuid))
              collectiveAccessMap.put(uuid, (title, SecurityContext.READ))
          }
          case SecurityRelationship.CAN_READ_WRITE.relationshipName => {
            if (collectiveAccessMap.contains(uuid))
              collectiveAccessMap.update(uuid, (title, SecurityContext.READ_WRITE))
            else
              collectiveAccessMap.put(uuid, (title, SecurityContext.READ_WRITE))
          }
        }
      })
      Some(collectiveAccessMap.toMap)
    }
  }

  private def getSecurityContextSkeleton(user: Node, userType: Byte): SecurityContext = {
    SecurityContext(
      getUUID(user),
      userType,
      None,
      None)
  }
  
  private def collectivesTraversalDescription: TraversalDescription = {
    Traversal.description()
          .depthFirst()
          .relationships(DynamicRelationshipType.withName(SecurityRelationship.IS_FOUNDER.name), Direction.OUTGOING)
          .relationships(DynamicRelationshipType.withName(SecurityRelationship.CAN_READ.name), Direction.OUTGOING)
          .relationships(DynamicRelationshipType.withName(SecurityRelationship.CAN_READ_WRITE.name), Direction.OUTGOING)
          .evaluator(Evaluators.excludeStartPosition())
          .evaluator(LabelEvaluator(List(OwnerLabel.COLLECTIVE)))
          .evaluator(Evaluators.toDepth(1)) 
  }
  
  private def changeUserNodeType(userUUID: UUID, userType: Integer): Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          result <- Right(changeUserType(userNode, userType)).right
        } yield userNode
    }
  }
  
  private def changeUserType(userNode: Node, userType: Integer)(implicit neo4j: DatabaseService) = {
    val currentUserType = getUserType(userNode)
    
    if (userType.intValue() != currentUserType){
      if (userType == Token.ADMIN.intValue){
        setUserTypeLabel(userNode, UserLabel.ADMIN)
      }else if (userType == Token.ALFA.intValue){
        setUserTypeLabel(userNode, UserLabel.ALFA)
      }else if (userType == Token.BETA.intValue){
        setUserTypeLabel(userNode, UserLabel.BETA)
      }else if (userType == Token.NORMAL.intValue){
        removeUserTypeLabel(userNode)      }
    }
  }
  
  private def getUserType(user: Node): Byte = {
    val labels = user.getLabels().asScala
    if (labels.find(p => p.name() == "ADMIN").isDefined)
      Token.ADMIN
    else if (labels.find(p => p.name() == "ALFA").isDefined)
      Token.ALFA
    else if (labels.find(p => p.name() == "BETA").isDefined)
      Token.BETA
    else
      Token.NORMAL
  }
  
  private def setUserTypeLabel(userNode: Node, label: Label)(implicit neo4j: DatabaseService){
    removeUserTypeLabel(userNode)
    userNode.addLabel(label)
  }
  
  private def removeUserTypeLabel(userNode: Node)(implicit neo4j: DatabaseService){
    // Remove existing user type
    if (userNode.hasLabel(UserLabel.ADMIN))
      userNode.removeLabel(UserLabel.ADMIN)
    else if (userNode.hasLabel(UserLabel.ALFA))
      userNode.removeLabel(UserLabel.ALFA)
    else if (userNode.hasLabel(UserLabel.BETA))
      userNode.removeLabel(UserLabel.BETA)
  }

}