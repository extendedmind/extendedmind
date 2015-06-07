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
import org.neo4j.scala.DatabaseService
import scala.collection.mutable.ListBuffer
import org.neo4j.index.lucene.ValueContext
import org.neo4j.index.lucene.QueryContext
import org.neo4j.graphdb.Relationship
import spray.util.LoggingContext
import scala.collection.mutable.HashMap

trait UserDatabase extends AbstractGraphDatabase {

  // METHODS THAT NEED TO BE OVERRIDDEN
  
  def updateItemsIndex(itemNode: Node, setResult: SetResult): Unit

  // PUBLICs

  def putNewUser(user: User, password: String, signUpMode: SignUpMode): Response[(SetResult, Option[Long])] = {
    for {
      userResult <- createUser(user, password, getExtraUserLabel(signUpMode)).right
      result <- Right(getSetResult(userResult._1, true)).right
    } yield (result, userResult._2)
  }

  def putExistingUser(userUUID: UUID, user: User): Response[SetResult] = {
    for {
      userNode <- updateUser(userUUID, user).right
      result <- Right(getSetResult(userNode, false)).right
    } yield result
  }

  def changeUserEmail(userUUID: UUID, email: String): Response[(SetResult, Boolean)] = {
    for {
      updateResult <- updateUserEmail(userUUID, email).right
      result <- Right(getSetResult(updateResult._1, false)).right
    } yield (result, updateResult._2)
  }

  def getUser(email: String): Response[User] = {
    withTx {
      implicit neo =>
        for {
          userNode <- getUserNode(email).right
          user <- toCaseClass[User](userNode).right
        } yield user
    }
  }

  def getUsers: Response[Users] = {
    withTx {
      implicit neo4j =>
        val users = findNodesByLabel(OwnerLabel.USER).toList
        if (users.isEmpty) {
          Right(Users(scala.List()))
        } else {
          Right(Users(users map (userNode => {
            val response = toCaseClass[User](userNode)
            if (response.isLeft) return Left(response.left.get)
            else response.right.get
          })));
        }
    }
  }

  def getUser(uuid: UUID): Response[User] = {
    withTx {
      implicit neo =>
        for {
          userNode <- getNode(uuid, OwnerLabel.USER).right
          user <- toCaseClass[User](userNode).right
          completeUser <- Right(addTransientUserProperties(userNode, user)).right
        } yield completeUser
    }
  }

  def rebuildUserIndexes: Response[CountResult] = {
    dropIndexes(OwnerLabel.USER)
    createNewIndex(OwnerLabel.USER, "uuid")
    dropIndexes(OwnerLabel.COLLECTIVE)
    createNewIndex(OwnerLabel.COLLECTIVE, "uuid")
    dropIndexes(MainLabel.TOKEN)
    createNewIndex(MainLabel.TOKEN, "accessKey")
    Right(CountResult(3))
  }

  def deleteUser(userUUID: UUID): Response[DeleteItemResult] = {
    for {
      deletedUserNode <- deleteUserNode(userUUID).right
      result <- Right(getDeleteItemResult(deletedUserNode._1, deletedUserNode._2)).right
    } yield result
  }

  def destroyUser(userUUID: UUID): Response[DestroyResult] = {
    withTx {
      implicit neo4j =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          deletable <- validateUserDeletable(userNode).right
          result <- destroyUserNode(userNode).right
        } yield result
    }
  }
  
  def getAgreement(userUUID: UUID, agreementUUID: UUID): Response[(Agreement, String)] = {
    withTx {
      implicit neo =>
        for {
          agreementInfo <- getAgreementInformation(userUUID, agreementUUID).right
          agreement <- toAgreement(agreementInfo, showProposedBy=true).right
        } yield (agreement, agreementInfo.concerningTitle)
    }
  }
  
  def putNewAgreement(agreement: Agreement): Response[(SetResult, String, String)] = {
    for {
      agreementResult <- createAgreementNode(agreement).right       
      result <- Right(getSetResult(agreementResult._1, true)).right
      unit <- Right(if (agreement.agreementType == "list") // Update items index with new list modified
                      updateItemsIndex(agreementResult._4, getSetResult(agreementResult._4, false))).right
    } yield (result, agreementResult._2, agreementResult._3)
  }
  

  def changeAgreementAccess(owner: Owner, agreementUUID: UUID, access: Byte): Response[SetResult] = {
    for {
      agreementInfo <- changeAgreementAccessNode(owner.userUUID, agreementUUID, access).right
      result <- Right(getSetResult(agreementInfo.agreement, false)).right
      unit <- Right(if (agreementInfo.agreementType == "list") // Update items index with new list modified
                      updateItemsIndex(agreementInfo.concerning, getSetResult(agreementInfo.concerning, false))).right 
    } yield result
  }
  
  def destroyAgreement(userUUID: UUID, agreementUUID: UUID): Response[SetResult] = {
    for {
      destroyAgreementResult <- destroyAgreementNode(userUUID, agreementUUID).right
      concerningSetResult <- Right(getSetResult(destroyAgreementResult._1.concerning, false)).right
      unit <- Right(if (destroyAgreementResult._1.agreementType == "list") // Update items index with new list modified
                      updateItemsIndex(destroyAgreementResult._1.concerning,
                                      concerningSetResult)).right 
    } yield concerningSetResult
  }
  
  def saveAgreementAcceptInformation(agreementUUID: UUID, acceptCode: Long, emailId: String): Response[Unit] = {
    withTx {
      implicit neo4j =>
        for {
          agreementNode <- getNode(agreementUUID, MainLabel.AGREEMENT).right
          result <- Right(saveAgreementAcceptInformation(agreementNode, acceptCode, emailId)).right
        } yield result
    }
  }
  
  def acceptAgreement(acceptCode: Long, proposedToEmail: String): Response[SetResult] = {
    for {
      agreementInfo <- acceptAgreementNode(acceptCode, proposedToEmail).right
      result <- Right(getSetResult(agreementInfo.agreement, true)).right
      unit <- Right(if (agreementInfo.agreementType == "list") // Update items index with new list modified
                      updateItemsIndex(agreementInfo.concerning, getSetResult(agreementInfo.concerning, false))).right 
    } yield result
  }

  // PRIVATE

  protected def createUser(user: User, plainPassword: String,
    userLabel: Option[Label] = None, emailVerified: Option[Long] = None): Response[(Node, Option[Long])] = {
    withTx {
      implicit neo4j =>
        if (findNodesByLabelAndProperty(OwnerLabel.USER, "email", user.email.get).toList.size > 0) {
          fail(INVALID_PARAMETER, ERR_USER_ALREADY_EXISTS, "User already exists with given email " + user.email.get)
        } else {
          val userNode = createNode(user, MainLabel.OWNER, OwnerLabel.USER)
          if (userLabel.isDefined) userNode.addLabel(userLabel.get)
          setUserPassword(userNode, plainPassword)
          userNode.setProperty("email", user.email.get)
          if (user.cohort.isDefined) userNode.setProperty("cohort", user.cohort.get)

          val emailVerificationCode = if (emailVerified.isDefined) {
            // When the user accepts invite using a code sent to her email, 
            // that means that the email is also verified
            userNode.setProperty("emailVerified", emailVerified.get)
            None
          } else {
            // Need to create a verification code
            val emailVerificationCode = Random.generateRandomUnsignedLong
            userNode.setProperty("emailVerificationCode", emailVerificationCode)
            Some(emailVerificationCode)
          }

          // Give user read permissions to common collectives
          val collectivesList = findNodesByLabelAndProperty(OwnerLabel.COLLECTIVE, "common", java.lang.Boolean.TRUE).toList
          if (!collectivesList.isEmpty) {
            collectivesList.foreach(collective => {
              userNode --> SecurityRelationship.CAN_READ --> collective;
            })
          }

          Right((userNode, emailVerificationCode))
        }
    }
  }

  protected def updateUser(userUUID: UUID, user: User): Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          result <- Right(updateUser(userNode, user)).right
        } yield userNode
    }
  }

  protected def updateUser(userNode: Node, user: User)(implicit neo4j: DatabaseService): Unit = {
    // Onboarding status
    if (user.preferences.isDefined && user.preferences.get.onboarded.isDefined) {
      userNode.setProperty("onboarded", user.preferences.get.onboarded.get);
    }

    // UI Preferences
    if (user.preferences.isDefined && user.preferences.get.ui.isDefined) {
      userNode.setProperty("ui", user.preferences.get.ui.get);
    }
  }

  protected def updateUserEmail(userUUID: UUID, email: String): Response[(Node, Boolean)] = {
    withTx {
      implicit neo4j =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          result <- Right(updateUserEmail(userNode, email)).right
        } yield (userNode, result)
    }
  }

  protected def updateUserEmail(userNode: Node, email: String)(implicit neo4j: DatabaseService): Boolean = {
    if (userNode.getProperty("email").asInstanceOf[String] != email) {
      userNode.setProperty("email", email)
      true
    } else {
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
          fail(INVALID_PARAMETER, ERR_USER_NO_USERS, "No users found with given email " + email)
        } else if (nodeIter.toList.size > 1) {

          nodeIter.toList.foreach(node => {
            println("User " + node.getProperty("email").asInstanceOf[String]
              + " has duplicate node "
              + UUIDUtils.getUUID(node.getProperty("uuid").asInstanceOf[String])
              + " with id " + node.getId())
          })

          fail(INTERNAL_SERVER_ERROR, ERR_USER_MORE_THAN_1_USERS, "Ḿore than one user found with given email " + email)
        } else
          Right(nodeIter.toList(0))
    }
  }

  protected def getUserNode(tokenNode: Node)(implicit neo4j: DatabaseService): Response[Node] = {
    val userFromToken: TraversalDescription =
      neo4j.gds.traversalDescription()
        .relationships(DynamicRelationshipType.withName(SecurityRelationship.IDS.name),
          Direction.OUTGOING)
        .depthFirst()
        .evaluator(Evaluators.excludeStartPosition())
        .evaluator(LabelEvaluator(scala.List(OwnerLabel.USER)))

    val traverser = userFromToken.traverse(tokenNode)
    val userNodeList = traverser.nodes().toArray

    if (userNodeList.length == 0) {
      fail(INTERNAL_SERVER_ERROR, ERR_USER_TOKEN_NO_USERS, "Token attached to no users")
    } else if (userNodeList.length > 1) {
      fail(INTERNAL_SERVER_ERROR, ERR_USER_TOKEN_MORE_THAN_1_USERS, "Token attached to more than one user")
    } else {
      Right(userNodeList.head)
    }
  }

  protected def getExtraUserLabel(signUpMode: SignUpMode): Option[Label] = {
    signUpMode match {
      case MODE_ADMIN => Some(UserLabel.ADMIN)
      case MODE_ALFA => Some(UserLabel.ALFA)
      case MODE_BETA => Some(UserLabel.BETA)
      case _ => None
    }
  }

  protected def dropIndexes(label: Label): Unit = {
    withTx {
      implicit neo4j =>
        val indexes = neo4j.gds.schema().getIndexes(label)
        if (!indexes.isEmpty) {
          indexes.foreach(index => index.drop())
        }
    }
  }

  protected def createNewIndex(label: Label, property: String): Unit = {
    withTx {
      implicit neo4j =>
        neo4j.gds.schema().indexFor(label).on(property).create()
    }
  }

  protected def addTransientUserProperties(userNode: Node, user: User)(implicit neo4j: DatabaseService): User = {
    val sharingRelationshipsList = sharingTraversalDescription.traverse(userNode).relationships().toList
    val sharedListRelationshipList = sharingRelationshipsList filter {relationship => {
      relationship.getEndNode.hasLabel(ItemLabel.LIST)
    }}
    val collectivesRelationshipList = sharingRelationshipsList filter {relationship => {
      relationship.getEndNode.hasLabel(OwnerLabel.COLLECTIVE)
    }}
    user.copy(preferences = getUserPreferences(userNode),
              collectives = getCollectiveAccess(collectivesRelationshipList),
              sharedLists = getSharedListAccess(sharedListRelationshipList))
  }

  protected def getUserPreferences(userNode: Node)(implicit neo4j: DatabaseService): Option[UserPreferences] = {
    if (userNode.hasProperty("onboarded") || userNode.hasProperty("ui")) {
      Some(UserPreferences(
        if (userNode.hasProperty("onboarded")) Some(userNode.getProperty("onboarded").asInstanceOf[String]) else None,
        if (userNode.hasProperty("ui")) Some(userNode.getProperty("ui").asInstanceOf[String]) else None))
    } else {
      None
    }
  }

  protected def getOwnerUUIDs: Response[scala.List[UUID]] = {
    withTx {
      implicit neo4j =>
        val ownerNodeList = findNodesByLabel(MainLabel.OWNER).toList
        val ownerUUIDList = ownerNodeList.map(ownerNode => {
          getUUID(ownerNode)
        })
        Right(ownerUUIDList)
    }
  }
  
  protected def destroyItem(deletedItem: Node)(implicit neo4j: DatabaseService);
  protected def destroyTokens(userNode: Node)(implicit neo4j: DatabaseService): Response[CountResult];
  
  protected def destroyUserNode(userNode: Node)(implicit neo4j: DatabaseService): Response[DestroyResult] = {
    // First delete tokens
    val destroyTokensResponse = destroyTokens(userNode)
    if (destroyTokensResponse.isLeft) return Left(destroyTokensResponse.left.get)
    
    // Then process relationships
    val relationships = userNode.getRelationships().toList
    val proposedByAgreementRelationships = relationships.filter(relationship => {
      if (relationship.getType.name == AgreementRelationship.PROPOSES.name()) true
      else false
    })
    val proposedToAgreementRelationships = relationships.filter(relationship => {
      if (relationship.getType.name == AgreementRelationship.IS_PROPOSED_TO.name()) true
      else false
    })
    val userUUID = getUUID(userNode)
    
    // Delete all relationships and also destroy items that the user owns
    relationships.foreach(relationship => {
      if (relationship.getType.name == SecurityRelationship.OWNS.name()){
        destroyItem(relationship.getEndNode())
      }else{
        relationship.delete()
      }
    })
    
    // Delete user
    userNode.delete()
    Right(DestroyResult(scala.List(userUUID)))
  }
  

  protected def deleteUserNode(userUUID: UUID): Response[Tuple2[Node, Long]] = {
    withTx {
      implicit neo =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          deletable <- validateUserDeletable(userNode).right
          deleted <- Right(deleteItem(userNode)).right
        } yield (userNode, deleted)
    }
  }

  protected def validateUserDeletable(userNode: Node)(implicit neo4j: DatabaseService): Response[Boolean] = {
    userNode.getRelationships().foreach(relationship => {
      if (relationship.getType().name == SecurityRelationship.IS_FOUNDER.name()) {
        return fail(INVALID_PARAMETER, ERR_USER_DELETE_WITH_COLLECTIVES, "Can't delete a user that has founded collections")
      }else if (relationship.getType().name == AgreementRelationship.PROPOSES.name()) {
        return fail(INVALID_PARAMETER, ERR_USER_DELETE_WITH_PROPOSED_AGREEMENTS, "Can't delete a user that has proposed agreements")
      }
    })
    Right(true)
  }

  protected def createAgreementNode(agreement: Agreement): Response[(Node, String, String, Node)] = {
    withTx {
      implicit neo4j =>
        for {
          proposedByUserNode <- getNode(agreement.proposedBy.get.uuid.get, OwnerLabel.USER).right
          proposedToUserNode <- getUserNode(agreement.proposedTo.get.email.get).right
          concerningNode <- getItemNode(agreement.proposedBy.get.uuid.get, agreement.targetItem.get.uuid, ItemLabel.LIST, false).right
          agreementNode <- createAgreementNode(agreement, proposedByUserNode, proposedToUserNode, concerningNode).right
        } yield (agreementNode,
                 concerningNode.getProperty("title").asInstanceOf[String],
                 proposedByUserNode.getProperty("email").asInstanceOf[String],
                 concerningNode)
    }
  }
  
  protected def createAgreementNode(agreement: Agreement, proposedByUserNode: Node, proposedToUserNode: Node, concerningNode: Node)(implicit neo4j: DatabaseService): Response[Node] = {
    if (proposedByUserNode.getId == proposedToUserNode.getId){
      return fail(INVALID_PARAMETER, ERR_USER_AGREEMENT_TO_SELF, "Can't share list to the same user")
    }
    
    val agreementsFromProposedBy: TraversalDescription =
    neo4j.gds.traversalDescription()
      .relationships(DynamicRelationshipType.withName(AgreementRelationship.PROPOSES.name),
        Direction.OUTGOING)
      .depthFirst()
      .evaluator(Evaluators.excludeStartPosition())
      .evaluator(LabelEvaluator(scala.List(MainLabel.AGREEMENT)))
    val previousAgreementToList = agreementsFromProposedBy.traverse(proposedByUserNode).nodes find (agreementNode => {
      val concerningExists = agreementNode.getRelationships.find(relationship => {
        relationship.getType.name == AgreementRelationship.CONCERNING.name && relationship.getEndNode.getId == concerningNode.getId
      }).isDefined
      val proposedToExists = agreementNode.getRelationships.find(relationship => {
        relationship.getType.name == AgreementRelationship.IS_PROPOSED_TO.name && relationship.getEndNode.getId == proposedToUserNode.getId
      }).isDefined
      concerningExists && proposedToExists
    })

    if (previousAgreementToList.isDefined){
      fail(INVALID_PARAMETER, ERR_USER_AGREEMENT_ALREADY_EXISTS, "There is already an agreement about this list to the given user")
    }else{
      val agreementNode = createNode(agreement, MainLabel.AGREEMENT, AgreementLabel.LIST_AGREEMENT) 
      proposedByUserNode --> AgreementRelationship.PROPOSES --> agreementNode 
      agreementNode --> AgreementRelationship.IS_PROPOSED_TO --> proposedToUserNode
      agreementNode --> AgreementRelationship.CONCERNING --> concerningNode
      Right(agreementNode)
    }
  }
  
  protected def changeAgreementAccessNode(userUUID: UUID, agreementUUID: UUID, access: Byte): Response[AgreementInformation] = {
    withTx {
      implicit neo4j =>
        for {
          agreementInfo <- getAgreementInformation(userUUID, agreementUUID).right
          relationship <- changeAgreementAccessNode(agreementInfo, access).right
        } yield agreementInfo
    }
  }
  
  def destroyAgreementNode(userUUID: UUID, agreementUUID: UUID): Response[(AgreementInformation, DestroyResult)] = {
    withTx {
      implicit neo4j =>   
        for {
          agreementInfo <- getAgreementInformation(userUUID, agreementUUID).right
          destroyResult <- Right(destroyAgreementNode(agreementInfo.agreement)).right
        } yield (agreementInfo, destroyResult)
    }
  }

  
  case class AgreementInformation(agreement: Node, agreementType: String, proposedBy: Node, concerning: Node, proposedTo: Option[Node], userIsCreator: Boolean, concerningTitle: String)
  
  protected def getAgreementInformation(userUUID: UUID, agreementUUID: UUID): Response[AgreementInformation] = {
    withTx {
      implicit neo4j =>
        for {
          agreementNode <- getNode(agreementUUID, MainLabel.AGREEMENT).right
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          result <- getAgreementInformation(agreementNode, userNode).right
        } yield result
    }    
  }
  
  protected def getAgreementInformation(agreementNode: Node, userNode: Node)(implicit neo4j: DatabaseService): Response[AgreementInformation] = {
    val proposedByRelationship = agreementNode.getRelationships.find(relationship => {
      relationship.getType.name == AgreementRelationship.PROPOSES.name
    })
    if (proposedByRelationship.isEmpty){
      return fail(INTERNAL_SERVER_ERROR, ERR_USER_CANT_FIND_AGREEMENT_PARTY, "Can't find user agreement was proposed by")
    }
    val proposedByUser = proposedByRelationship.get.getStartNode
    val userIsCreator = proposedByUser.getId == userNode.getId
    val agreementType = agreementNode.getProperty("agreementType").asInstanceOf[String]
    
    val concerningRelationship = agreementNode.getRelationships.find(relationship => {
      relationship.getType.name == AgreementRelationship.CONCERNING.name
    })
    if (concerningRelationship.isEmpty){
      return fail(INTERNAL_SERVER_ERROR, ERR_USER_CANT_FIND_AGREEMENT_PARTY, "Can't find node the agreement concerns")
    }
    val concerningNode = concerningRelationship.get.getEndNode
    
    val proposedToRelationship = agreementNode.getRelationships.find(relationship => {
      relationship.getType.name == AgreementRelationship.IS_PROPOSED_TO.name
    })
        
    val proposedToUser =
      if (proposedToRelationship.isDefined) Some(proposedToRelationship.get.getEndNode)
      else None
      
    if (!userIsCreator && (proposedToUser.isEmpty || proposedToUser.get.getId != userNode.getId)){
      return fail(INVALID_PARAMETER, ERR_USER_INVALID_AGREEMENT_PARTY, "User is not a party in the agreement")
    }
    
    Right(AgreementInformation(agreementNode, agreementType, proposedByUser, concerningNode, proposedToUser, userIsCreator, concerningNode.getProperty("title").asInstanceOf[String]))
  }
  
  protected def changeAgreementAccessNode(agreementInfo: AgreementInformation, access: Byte)(implicit neo4j: DatabaseService): Response[Option[Relationship]] = {
    if (access != SecurityContext.READ && access != SecurityContext.READ_WRITE){
      fail(INVALID_PARAMETER, ERR_USER_INVALID_ACCESS_VALUE, "List access value needs to be either 1 for read or 2 for write")      
    }else if (!agreementInfo.userIsCreator){
      fail(INVALID_PARAMETER, ERR_BASE_NO_ACCESS, "Only agreement creator can change agreement access")            
    }else{
      agreementInfo.agreement.setProperty("access", access)
      if (agreementInfo.agreement.hasProperty("accepted")){
        // Agreement has been accepted, need to change security relationships too
        setPermission(agreementInfo.concerning, agreementInfo.proposedTo.get, Some(access))
      }else{
        Right(None)
      }
    }
  }
  
  protected def sharingTraversalDescription(implicit neo4j: DatabaseService): TraversalDescription = {
    neo4j.gds.traversalDescription()
          .depthFirst()
          .relationships(DynamicRelationshipType.withName(SecurityRelationship.IS_FOUNDER.name), Direction.OUTGOING)
          .relationships(DynamicRelationshipType.withName(SecurityRelationship.CAN_READ.name), Direction.OUTGOING)
          .relationships(DynamicRelationshipType.withName(SecurityRelationship.CAN_READ_WRITE.name), Direction.OUTGOING)
          .evaluator(Evaluators.excludeStartPosition())
          .evaluator(LabelEvaluator(scala.List(ItemLabel.LIST, OwnerLabel.COLLECTIVE)))
          .evaluator(Evaluators.toDepth(1))
  }
  
  protected def getCollectiveAccess(relationshipList: scala.List[Relationship]): Option[Map[UUID,(String, Byte, Boolean)]] = {
    if (relationshipList.isEmpty) None
    else{
      val collectiveAccessMap = new HashMap[UUID,(String, Byte, Boolean)]
      relationshipList foreach (relationship => {
        val collective = relationship.getEndNode()
        val title = collective.getProperty("title").asInstanceOf[String]
        val uuid = getUUID(collective)
        val common = if(collective.hasProperty("common")) true else false
        relationship.getType().name() match {
          case SecurityRelationship.IS_FOUNDER.relationshipName => 
            collectiveAccessMap.put(uuid, (title, SecurityContext.FOUNDER, common))
          case SecurityRelationship.CAN_READ.relationshipName => {
            if (!collectiveAccessMap.contains(uuid))
              collectiveAccessMap.put(uuid, (title, SecurityContext.READ, common))
          }
          case SecurityRelationship.CAN_READ_WRITE.relationshipName => {
            if (collectiveAccessMap.contains(uuid))
              collectiveAccessMap.update(uuid, (title, SecurityContext.READ_WRITE, common))
            else
              collectiveAccessMap.put(uuid, (title, SecurityContext.READ_WRITE, common))
          }
        }
      })
      Some(collectiveAccessMap.toMap)
    }
  }
  
  protected def getSharedListAccess(relationshipList: scala.List[Relationship], foreignOwnerUUID: Option[UUID] = None)(implicit neo4j: DatabaseService): Option[Map[UUID,(String, Map[UUID, (String, Byte)])]] = {
    if (relationshipList.isEmpty){
      None
    }else{
      val sharedListAccessMap = new HashMap[UUID,(String, HashMap[UUID, (String, Byte)])]
      
      relationshipList foreach (relationship => {
        val sharedList = relationship.getEndNode()
        val title = sharedList.getProperty("title").asInstanceOf[String]
        
        val ownerNodeList = neo4j.gds.traversalDescription()
          .depthFirst()
          .relationships(DynamicRelationshipType.withName(SecurityRelationship.OWNS.name), Direction.INCOMING)
          .evaluator(Evaluators.excludeStartPosition())
          .evaluator(Evaluators.toDepth(1))
          .traverse(sharedList)
          .nodes()
          .toList
        if (ownerNodeList.size == 1){
          val ownerUUID = getUUID(ownerNodeList(0))
          if (foreignOwnerUUID.isEmpty || (ownerUUID == foreignOwnerUUID.get)){
            if (!sharedListAccessMap.contains(ownerUUID)){
              sharedListAccessMap.put(ownerUUID,
                  (ownerNodeList(0).getProperty("email").asInstanceOf[String], new HashMap[UUID, (String, Byte)]))
            }
            relationship.getType().name() match {
              case SecurityRelationship.CAN_READ.relationshipName => {                
                sharedListAccessMap.get(ownerUUID).get._2.put(getUUID(sharedList), (title, SecurityContext.READ))
              }
              case SecurityRelationship.CAN_READ_WRITE.relationshipName => {
                sharedListAccessMap.get(ownerUUID).get._2.put(getUUID(sharedList), (title, SecurityContext.READ_WRITE))
              }
            }
          }
        }
      })
      if (sharedListAccessMap.isEmpty){
        None
      }else{
        val immutableMainMap = sharedListAccessMap.toMap
        val resultingMap = immutableMainMap.map(kv => (kv._1,(kv._2._1, kv._2._2.toMap))).toMap
        Some(resultingMap)
      }
    }
  }
  
  protected def setPermission(targetNode: Node, userNode: Node, access: Option[Byte]) 
       (implicit neo4j: DatabaseService): Response[Option[Relationship]] = {    
    // Get existing relationship
    val existingRelationship = {
      val result = getSecurityRelationship(targetNode, userNode)
      if (result.isLeft) return result
      else{
        if (result.right.get.isDefined && 
            result.right.get.get.getType.name() == SecurityRelationship.IS_FOUNDER.relationshipName){
          return fail(INVALID_PARAMETER, ERR_USER_FOUNDER_PERMISSION, "Can not change permissions for founder")
        }
        result.right.get
      }
    }
    access match {
      case Some(SecurityContext.READ) => {
        if(existingRelationship.isDefined){
          if(existingRelationship.get.getType().name != SecurityRelationship.CAN_READ.name)
            existingRelationship.get.delete()
          else
            return Right(existingRelationship)
        }
        Right(Some(userNode --> SecurityRelationship.CAN_READ --> targetNode <))
      }
      case Some(SecurityContext.READ_WRITE) => 
        if(existingRelationship.isDefined){
          if(existingRelationship.get.getType().name != SecurityRelationship.CAN_READ_WRITE.name)
            existingRelationship.get.delete()
          else
            return Right(existingRelationship)          
        }
        Right(Some(userNode --> SecurityRelationship.CAN_READ_WRITE --> targetNode <))
      case None => {
        if(existingRelationship.isDefined){
          existingRelationship.get.delete()
        }
        Right(None)
      }
      case _ => 
        fail(INVALID_PARAMETER, ERR_USER_INVALID_ACCESS_VALUE, "Invalid access value: " + access)
    }
  }
  
  protected def getSecurityRelationship(targetNode: Node, userNode: Node)
      (implicit neo4j: DatabaseService): Response[Option[Relationship]] = {
    getRelationship(userNode, targetNode, SecurityRelationship.CAN_READ, SecurityRelationship.CAN_READ_WRITE, 
            SecurityRelationship.IS_FOUNDER)
  }
  
  protected def destroyAgreementNode(agreementNode: Node)(implicit neo4j: DatabaseService): DestroyResult = {
    // Need to find what it concerns
    val concerningResult = agreementNode.getRelationships.find(relationship => {
      relationship.getType.name == AgreementRelationship.CONCERNING.name
    })
    agreementNode.getRelationships.foreach(relationship => {
      if (relationship.getType.name == AgreementRelationship.IS_PROPOSED_TO.name && 
          concerningResult.isDefined && agreementNode.hasProperty("accepted")){
        // Remove permission to the original element
        setPermission(concerningResult.get.getEndNode, relationship.getEndNode, None)
      }
      relationship.delete
    })

    // Delete agreement
    val agreementUUID = getUUID(agreementNode)
    agreementNode.delete
    DestroyResult(scala.List(agreementUUID))
  }

  private def saveAgreementAcceptInformation(agreementNode: Node, acceptCode: Long, emailId: String)(implicit neo4j: DatabaseService){
    agreementNode.setProperty("acceptCode", acceptCode)
    agreementNode.setProperty("acceptEmailId", emailId)
  }
  
  protected def acceptAgreementNode(acceptCode: Long, proposedToEmail: String): Response[AgreementInformation] = {
    withTx {
      implicit neo4j =>
        for {
          proposedToNode <- getUserNode(proposedToEmail).right
          agreementNode <- getAgreementNodeForAcceptance(proposedToNode, acceptCode).right
          unit <- acceptAgreementNode(proposedToNode, agreementNode).right
          agreementInformation <- getAgreementInformation(agreementNode, proposedToNode).right
        } yield agreementInformation
    }
  }
  
  private def getAgreementNodeForAcceptance(proposedToNode: Node, acceptCode: Long)(implicit neo4j: DatabaseService): Response[Node] = {
    val agreementNodeResult = proposedToNode.getRelationships.find(relationship => {
      relationship.getType.name == AgreementRelationship.IS_PROPOSED_TO.name &&
      relationship.getStartNode.hasProperty("acceptCode") &&
      relationship.getStartNode.getProperty("acceptCode").asInstanceOf[Long] == acceptCode
    })
    if (agreementNodeResult.isEmpty){
      fail(INVALID_PARAMETER, ERR_USER_AGREEMENT_NOT_FOUND, "Can't find agreement with given code")
    }else if (agreementNodeResult.get.getStartNode.hasProperty("accepted")){      
      fail(INVALID_PARAMETER, ERR_USER_AGREEMENT_ACCEPTED, "Agreement already accepted")
    }else{
      Right(agreementNodeResult.get.getStartNode)
    }
  }
  
  private def acceptAgreementNode(proposedToNode: Node, agreementNode: Node)(implicit neo4j: DatabaseService): Response[Option[Relationship]] = {
    // Need to find what it concerns
    val concerningResult = agreementNode.getRelationships.find(relationship => {
      relationship.getType.name == AgreementRelationship.CONCERNING.name
    })
    
    if (concerningResult.isEmpty){
      fail(INTERNAL_SERVER_ERROR, ERR_USER_CANT_FIND_AGREEMENT_CONCERNING, "Can't the agreement target")
    }else{
      agreementNode.setProperty("accepted", System.currentTimeMillis)
      setPermission(concerningResult.get.getEndNode, proposedToNode, Some(agreementNode.getProperty("access").asInstanceOf[Byte]))
    }
  }
  
  protected def toAgreement(agreementInfo: AgreementInformation, showProposedBy: Boolean = false, skipCreatedAndModified: Boolean = false)(implicit neo4j: DatabaseService): Response[Agreement] = {
    for {
      agreement <- toCaseClass[Agreement](agreementInfo.agreement).right
      fullAgreement <- Right(addAgreementParty(agreement, agreementInfo, showProposedBy)).right
      returnAgreement <- Right(if (skipCreatedAndModified) fullAgreement.copy(modified=None, created=None) else fullAgreement).right
    } yield returnAgreement
  }

  private def addAgreementParty(agreement: Agreement, agreementInfo: AgreementInformation, showProposedBy: Boolean)(implicit neo4j: DatabaseService): Agreement = {
    return agreement.copy(
        proposedTo = Some(AgreementUser(Some(getUUID(agreementInfo.proposedTo.get)),
                                        Some(agreementInfo.proposedTo.get.getProperty("email").asInstanceOf[String]))),
        proposedBy = 
          if (showProposedBy)
            Some(AgreementUser(Some(getUUID(agreementInfo.proposedBy)),
                               Some(agreementInfo.proposedBy.getProperty("email").asInstanceOf[String])))
          else None)
  }

  
}