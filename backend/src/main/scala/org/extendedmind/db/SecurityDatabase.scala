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
import org.extendedmind.domain.SignUp
import org.extendedmind.domain.UserPreferences

trait SecurityDatabase extends AbstractGraphDatabase with UserDatabase {

  // Token is valid for twelve hours
  val TOKEN_DURATION: Long = 43200000

  // If rememberMe is set, the token can be replaced for 7 days
  val TOKEN_REPLACEABLE: Long = 604800000

  // If rememberMe and extended are set, the token can be replaced for 90 days
  val TOKEN_REPLACEABLE_EXTENDED: Long = 7776000000l;

  // Password reset is valid for one hour
  val PASSWORD_RESET_DURATION: Long = 3600000

  // PUBLIC

  def generateToken(email: String, attemptedPassword: String, payload: Option[AuthenticatePayload]): Response[SecurityContext] = {
    withTx {
      implicit neo =>
        for {
          scWithoutToken <- authenticate(email, attemptedPassword).right
          unit <- Right(undeleteItem(scWithoutToken.user)).right // Resurrect deleted user with authenticate
          unit <- validateSubscription(scWithoutToken).right
          token <- Right(Token(scWithoutToken.userUUID)).right
          tokenInfo <- Right(saveToken(scWithoutToken.user, token, payload)).right
          sc <- Right(scWithoutToken.copy(
              token = Some(Token.encryptToken(token)),
              authenticated = Some(tokenInfo._1),
              expires = Some(tokenInfo._2),
              replaceable = tokenInfo._3
              )).right
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
          result <- validateTokenReplacable(tokenNode, currentTime).right
          userNode <- getUserNode(tokenNode).right
          sc <- Right(getSecurityContext(userNode)).right
          sc <- Right(createNewAccessKey(tokenNode, sc, payload)).right
          result <- Right(clearExtraLogins(userNode, tokenNode)).right
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
          foreignOwnerUUID <- Right(getForeignOwnerUUID(user, ownerUUID)).right
          sc <- validatePassword(user, attemptedPassword, foreignOwnerUUID).right
        } yield sc
    }
  }

  def authenticate(token: String, ownerUUID: Option[UUID], shareable: Boolean = false)(implicit log: LoggingContext): Response[SecurityContext] = {
    val currentTime = System.currentTimeMillis()
    withTx{
      implicit neo4j =>
        for {
          token <- Token.decryptToken(token).right
          tokenNode <- getTokenNode(token).right
          result <- validateToken(tokenNode, currentTime).right
          userNode <- getUserNode(tokenNode).right
          foreignOwnerUUID <- Right(getForeignOwnerUUID(userNode, ownerUUID)).right
          sc <- getLimitedSecurityContext(userNode, foreignOwnerUUID, shareable).right
        } yield sc
    }
  }

  def validateEmailUniqueness(email: String): Response[Boolean] = {
    withTx{
      implicit neo4j =>
        val userNodeList = findNodesByLabelAndProperty(OwnerLabel.USER, "email", email).toList
        if (!userNodeList.isEmpty){
          return fail(INVALID_PARAMETER, ERR_BASE_EMAIL_EXISTS, "User already exists with given email: " + email)
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
          sc <- getLimitedSecurityContext(userNode, None).right
        } yield sc
    }
  }

  def destroyTokens(userUUID: UUID): Response[CountResult] = {
    withTx{
      implicit neo4j =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          result <- destroyTokens(userNode, None).right
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

  def savePasswordResetInformation(userUUID: UUID, resetCode: Long, resetCodeValid: Long, emailId: String): Response[Unit] = {
    withTx {
      implicit neo4j =>
	    for {
	      userNode <- getNode(userUUID, OwnerLabel.USER).right
	      result <- Right(savePasswordResetInformation(userNode, resetCode, resetCodeValid, emailId)).right
	    } yield result
    }
  }

  def getPasswordResetExpires(code: Long, email: String): Response[Long] = {
    withTx {
      implicit neo4j =>
	    for {
	      userNode <- getUserNode(email).right
	      result <- getPasswordResetExpires(code, userNode).right
	    } yield result
    }
  }

  def resetPassword(code: Long, signUp: SignUp): Response[SetResult] = {
    for {
      userNode <- resetPasswordNode(code, signUp).right
      result <- Right(getSetResult(userNode, true)).right
    } yield result
  }

  def verifyEmail(code: Long, email: String): Response[SetResult] = {
    for {
      userNode <- verifyEmailNode(code, email).right
      result <- Right(getSetResult(userNode, true)).right
    } yield result
  }


  // PRIVATE

  protected def getTokenNode(token: Token, acceptDeleted: Boolean = false)
        (implicit log: LoggingContext): Response[Node] = {
    val response = getNode("accessKey", token.accessKey: java.lang.Long, MainLabel.TOKEN, None, acceptDeleted)
    if (response.isLeft && response.left.get(0).responseType == INVALID_PARAMETER){
      fail(INVALID_AUTHENTICATION, ERR_BASE_TOKEN_NOT_FOUND, response.left.get(0).description);
    }else{
      response
    }
  }

  protected def validateToken(tokenNode: Node, currentTime: Long): Response[Unit] = {
    if (tokenNode.hasProperty("expires")) {
      val tokenValid = tokenNode.getProperty("expires").asInstanceOf[Long];
      if (currentTime < tokenValid) {
        Right(Unit)
      } else fail(INVALID_AUTHENTICATION, ERR_BASE_TOKEN_EXPIRED, "Token has expired")
    } else fail(INTERNAL_SERVER_ERROR, ERR_BASE_TOKEN_MISSING_EXPIRED, "Token " + tokenNode.getId() + " is missing expired property")
  }

  protected def validateTokenReplacable(tokenNode: Node, currentTime: Long)(implicit neo4j: DatabaseService): Response[Unit] = {
    if (tokenNode.hasProperty("replaceable")) {
      val replaceable = tokenNode.getProperty("replaceable").asInstanceOf[Long];
      if (currentTime < replaceable) {
        Right(Unit)
      } else fail(INVALID_AUTHENTICATION, ERR_BASE_TOKEN_NO_LONGER_REPLACEABLE, "Token no longer replaceable")
    } else fail(INVALID_PARAMETER, ERR_BASE_TOKEN_NOT_REPLACEABLE, "Token not replaceable")
  }

  protected def validateSubscription(sc: SecurityContext)(implicit neo4j: DatabaseService): Response[Unit] = {
    if (settings.signUpMode == MODE_NORMAL
        && (sc.user.hasLabel(UserLabel.NORMAL) || sc.user.hasLabel(UserLabel.BETA))
        && !sc.user.hasLabel(SubscriptionLabel.PREMIUM)
        && hasValidOrReplaceableToken(sc.user)){
      fail(INVALID_PARAMETER, ERR_BASE_ALREADY_LOGGED_IN, "Already logged in and not premium user")
    }else{
      Right(Unit)
    }
  }

  protected def clearExtraLogins(userNode: Node, tokenNode: Node)(implicit neo4j: DatabaseService): Response[CountResult] = {
    if (settings.signUpMode == MODE_NORMAL
        && (userNode.hasLabel(UserLabel.NORMAL) || userNode.hasLabel(UserLabel.BETA))
        && !userNode.hasLabel(SubscriptionLabel.PREMIUM)){
      // When a normal or beta user who does not have a valid subscription swaps token,
      // all other tokens are deleted
      destroyTokens(userNode, Some(iterTokenNode => {
        if (tokenNode != iterTokenNode) true
        else false
      }))
    }else{
      // Only destroy extra tokens that have expired and are not replaceable
      destroyTokens(userNode, Some(iterTokenNode => {
        if (tokenNode == iterTokenNode){
          false
        }else{
          val currentTime = System.currentTimeMillis
          val authInfo = getAuthenticationInfo(tokenNode)
          // Delete only if expired and not replaceable
          if (authInfo._2 < currentTime && (authInfo._3.isEmpty || authInfo._3.get < currentTime)){
            true
          }else{
            false
          }
        }
      }))
    }
  }

  protected def hasValidOrReplaceableToken(userNode: Node)(implicit neo4j: DatabaseService): Boolean = {
    val tokenTraversal = neo4j.gds.traversalDescription()
      .breadthFirst()
      .relationships(DynamicRelationshipType.withName(SecurityRelationship.IDS.name), Direction.INCOMING)
      .evaluator(Evaluators.excludeStartPosition())
      .evaluator(LabelEvaluator(List(MainLabel.TOKEN)))
      .evaluator(Evaluators.toDepth(1))
      .traverse(userNode)
    val tokenList = tokenTraversal.nodes().toList
    val currentTime = System.currentTimeMillis
    tokenList.find(tokenNode => {
      val authInfo = getAuthenticationInfo(tokenNode)
      if (authInfo._2 >= currentTime || (authInfo._3.isDefined && authInfo._3.get >= currentTime)){
        true
      }else{
        false
      }
    }).isDefined
  }

  protected def createNewAccessKey(tokenNode: Node, sc: SecurityContext, payload: Option[AuthenticatePayload])(implicit neo4j: DatabaseService): SecurityContext = {
    // Make new token and set properties to the token node
    val token = Token(sc.userUUID)
    val tokenInfo = setTokenProperties(tokenNode, token, payload)
    SecurityContext(
      sc.userUUID,
      sc.userType,
      sc.subscription,
      sc.created,
      sc.modified,
      sc.cohort,
      Some(Token.encryptToken(token)),
      Some(tokenInfo._1),
      Some(tokenInfo._2),
      tokenInfo._3,
      sc.collectives,
      sc.sharedLists,
      sc.preferences)
  }

  protected def saveToken(userNode: Node, token: Token, payload: Option[AuthenticatePayload])(implicit neo4j: DatabaseService): (Long, Long, Option[Long]) = {
    val tokenNode = createNode(MainLabel.TOKEN)
    val tokenInfo = setTokenProperties(tokenNode, token, payload);
    tokenNode --> SecurityRelationship.IDS --> userNode
    tokenInfo
  }

  protected def destroyTokens(userNode: Node)(implicit neo4j: DatabaseService): Response[CountResult] = {
    destroyTokens(userNode, None)
  }

  protected def destroyTokens(userNode: Node, destroyCondition: Option[(Node => Boolean)])(implicit neo4j: DatabaseService): Response[CountResult] = {
    val tokenTraversal = neo4j.gds.traversalDescription()
      .breadthFirst()
      .relationships(DynamicRelationshipType.withName(SecurityRelationship.IDS.name), Direction.INCOMING)
      .evaluator(Evaluators.excludeStartPosition())
      .evaluator(LabelEvaluator(List(MainLabel.TOKEN)))
      .evaluator(Evaluators.toDepth(1))
      .traverse(userNode)
    val tokenList = tokenTraversal.nodes().toList
    var deleteCount: Long = 0;
    tokenList.foreach(tokenNode => {
      if (destroyCondition.isEmpty || destroyCondition.get(tokenNode)){
        destroyToken(tokenNode)
        deleteCount = deleteCount + 1;
      }
    })
    Right(CountResult(deleteCount))
  }

  protected def destroyToken(tokenNode: Node)(implicit neo4j: DatabaseService) {
    // Remove all relationships
    val relationShipList = tokenNode.getRelationships().toList
    relationShipList.foreach(relationship => relationship.delete())
    // Delete token itself
    tokenNode.delete()
  }

  private def setTokenProperties(tokenNode: Node, token: Token, payload: Option[AuthenticatePayload])(implicit neo4j: DatabaseService): (Long, Long, Option[Long]) = {
    val currentTime = System.currentTimeMillis
    val expires = currentTime + TOKEN_DURATION
    tokenNode.setProperty("accessKey", token.accessKey)
    tokenNode.setProperty("expires", expires)
    if (payload.isDefined && payload.get.rememberMe) {
      // Remember me has been clicked
      val replaceable = if (payload.get.extended.isDefined && payload.get.extended.get == true)
					      currentTime + TOKEN_REPLACEABLE_EXTENDED
					    else
					      currentTime + TOKEN_REPLACEABLE

      tokenNode.setProperty("replaceable", replaceable)
      return (currentTime, expires, Some(replaceable))
    }else if (tokenNode.hasProperty("replaceable")){
      tokenNode.removeProperty("replaceable")
    }
    (currentTime, expires, None)
  }

  private def getStoredPassword(user: Node): Password = {
    Password(
      user.getProperty("passwordAlgorithm").asInstanceOf[String],
      user.getProperty("passwordIterations").asInstanceOf[Int],
      Base64.decodeBase64(user.getProperty("passwordHash").asInstanceOf[String]),
      user.getProperty("passwordSalt").asInstanceOf[Array[Byte]])
  }

  private def validatePassword(user: Node, attemptedPassword: String)(implicit neo4j: DatabaseService): Response[SecurityContext] = {
    for{
      validPassword <- validatePassword(attemptedPassword, getStoredPassword(user)).right
      sc <- Right(getSecurityContext(user)).right
    } yield sc
  }

  private def validatePassword(user: Node, attemptedPassword: String, collectiveUUID: Option[UUID])(implicit neo4j: DatabaseService): Response[SecurityContext] = {
    for{
      validPassword <- validatePassword(attemptedPassword, getStoredPassword(user)).right
      sc <- getLimitedSecurityContext(user, collectiveUUID).right
    } yield sc
  }

  private def validatePassword(attemptedPassword: String, storedPassword: Password): Response[Boolean] = {
    // Check password
    if (PasswordService.authenticate(attemptedPassword, storedPassword)) {
      Right(true)
    } else {
      fail(INVALID_PARAMETER, ERR_BASE_INVALID_PASSWORD, "Invalid password")
    }
  }

  private def getForeignOwnerUUID(user: Node, ownerUUID: Option[UUID]): Option[UUID] = {
    if (ownerUUID.isDefined && (getUUID(user) == ownerUUID.get)) None
    else ownerUUID
  }

  private def getSecurityContext(user: Node)(implicit neo4j: DatabaseService): SecurityContext = {
    getCompleteSecurityContext(user, getUserType(user), getSubscription(user))
  }

  private def getLimitedSecurityContext(user: Node, foreignOwnerUUID: Option[UUID], shareable: Boolean = false)(implicit neo4j: DatabaseService): Response[SecurityContext] = {
    getLimitedSecurityContextWithSubscription(user, getUserType(user), getSubscription(user), foreignOwnerUUID, shareable)
  }

  private def getCompleteSecurityContext(user: Node, userType: Byte, subscription: Option[String])(implicit neo4j: DatabaseService): SecurityContext = {
    val sharingRelationshipsList = sharingTraversalDescription.traverse(user).relationships().toList
    val collectivesRelationshipList = sharingRelationshipsList filter {relationship => {
      relationship.getEndNode.hasLabel(OwnerLabel.COLLECTIVE)
    }}
    val sharedListRelationshipList = sharingRelationshipsList filter {relationship => {
      relationship.getEndNode.hasLabel(ItemLabel.LIST)
    }}
    val sc = getSecurityContextSkeleton(user, userType, subscription).copy(
    		   collectives = getCollectiveAccess(collectivesRelationshipList),
           sharedLists = getSharedListAccess(sharedListRelationshipList))
    sc.user = user
    sc
  }

  private def getLimitedSecurityContextWithSubscription(user: Node, userType: Byte, subscription: Option[String],
                                        foreignOwnerUUID: Option[UUID], shareable: Boolean = false)
                                       (implicit neo4j: DatabaseService): Response[SecurityContext] = {

    if (foreignOwnerUUID.isEmpty){
      val sc = getSecurityContextSkeleton(user, userType, subscription)
      sc.user = user
      Right(sc)
    }else{
      val sharingRelationshipsList = sharingTraversalDescription.traverse(user).relationships().toList
      val collectives = {
        // See if one of the collectives the user has access to is the foreign UUID
        val collectiveRelationshipList = sharingRelationshipsList filter {relationship => {
          relationship.getEndNode.hasLabel(OwnerLabel.COLLECTIVE) && getUUID(relationship.getEndNode) == foreignOwnerUUID.get
        }}
        if (collectiveRelationshipList.size > 0){
          getCollectiveAccess(collectiveRelationshipList)
        }else{
          None
        }
      }
      val sharedLists = {
        if (!shareable || collectives.isDefined){
          None
        } else {
          // Method call where access via sharing lists is possible, and a foreign has not
          // yet been found
          val sharedListRelationshipList = sharingRelationshipsList filter {relationship => {
            if (relationship.getEndNode.hasLabel(ItemLabel.LIST)){
              true
            }else{
              false
            }
          }}
          if (sharedListRelationshipList.size > 0){
            getSharedListAccess(sharedListRelationshipList, foreignOwnerUUID)
          }else{
            None
          }
        }
      }
      val sc = getSecurityContextSkeleton(user, userType, subscription).copy(
        collectives = collectives,
        sharedLists = sharedLists)
      sc.user = user
      Right(sc)
    }
  }

  private def getAuthenticationInfo(tokenNode: Node): (Long, Long, Option[Long]) = {
    val authenticated = tokenNode.getProperty("modified").asInstanceOf[Long]
    val expires = tokenNode.getProperty("expires").asInstanceOf[Long]
    if (tokenNode.hasProperty("replaceable")){
      (authenticated, expires, Some(tokenNode.getProperty("replaceable").asInstanceOf[Long]))
    }else{
      (authenticated, expires, None)
    }
  }

  private def getSecurityContextSkeleton(user: Node, userType: Byte, subscription: Option[String])(implicit neo4j: DatabaseService): SecurityContext = {
    SecurityContext(
      getUUID(user),
      userType,
      subscription,
      user.getProperty("created").asInstanceOf[Long],
      user.getProperty("modified").asInstanceOf[Long],
      if (user.hasProperty("cohort")) Some(user.getProperty("cohort").asInstanceOf[Int]) else None,
      None,
      None,
      None,
      None,
      None,
      None,
      getUserPreferences(user)
    )
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

  private def getSubscription(user: Node): Option[String] = {
    if (user.hasLabel(SubscriptionLabel.PREMIUM)) Some("premium")
    else None
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

  private def savePasswordResetInformation(userNode: Node, resetCode: Long, resetCodeExpires: Long, emailId: String)(implicit neo4j: DatabaseService){
    userNode.setProperty("passwordResetCode", resetCode)
    userNode.setProperty("passwordResetCodeExpires", resetCodeExpires)
    userNode.setProperty("passwordResetEmailId", emailId)
  }

  private def getPasswordResetExpires(code: Long,userNode: Node)(implicit neo4j: DatabaseService): Response[Long] = {
    if (userNode.hasProperty("passwordResetCode") && userNode.getProperty("passwordResetCode").asInstanceOf[Long] == code){
      val currentTime = System.currentTimeMillis
      if (userNode.hasProperty("passwordResetCodeExpires") && userNode.getProperty("passwordResetCodeExpires").asInstanceOf[Long] > currentTime){
        Right(userNode.getProperty("passwordResetCodeExpires").asInstanceOf[Long])
      }else{
        fail(INVALID_PARAMETER, ERR_BASE_PASSWORD_NOT_RESETABLE_ANYMORE, "Password not resetable anymore")
      }
    }else{
      fail(INVALID_PARAMETER, ERR_BASE_PASSWORD_NOT_RESETABLE, "Password not resetable")
    }
  }

  private def resetPasswordNode(code: Long, signUp: SignUp): Response[Node] = {
    withTx {
      implicit neo =>
        for {
          userNode <- getUserNode(signUp.email).right
          expires <- getPasswordResetExpires(code, userNode).right
          result <- Right(setUserPassword(userNode, signUp.password)).right
          result <- Right(clearPasswordResetExpires(userNode)).right
        } yield userNode
    }
  }

  private def verifyEmailNode(code: Long, email: String): Response[Node] = {
    withTx {
      implicit neo =>
        for {
          userNode <- getUserNode(email).right
          emailVerified <- verifyEmail(code, userNode).right
        } yield userNode
    }
  }

  private def verifyEmail(code: Long, userNode: Node)(implicit neo4j: DatabaseService): Response[Long] = {
    if (userNode.hasProperty("emailVerificationCode")){
      if (userNode.getProperty("emailVerificationCode").asInstanceOf[Long] == code){
        val currentTime = System.currentTimeMillis()
        userNode.setProperty("emailVerified", currentTime)
        Right(currentTime)
      }else{
        fail(INVALID_PARAMETER, ERR_BASE_PASSWORD_INVALID_VERIFICATION_CODE, "invalid verification code")
      }
    }else{
      fail(INVALID_PARAMETER, ERR_BASE_PASSWORD_NOT_VERIFIABLE, "email not verifiable")
    }
  }

  private def clearPasswordResetExpires(userNode: Node)(implicit neo4j: DatabaseService){
    if (userNode.hasProperty("passwordResetCodeExpires")) userNode.removeProperty("passwordResetCodeExpires")
  }

}
