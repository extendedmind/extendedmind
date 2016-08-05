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
import org.apache.commons.codec.binary.Base64
import org.extendedmind._
import org.extendedmind.Response._
import org.extendedmind.domain._
import org.extendedmind.security._
import org.neo4j.graphdb.Direction
import org.neo4j.graphdb.RelationshipType
import org.neo4j.graphdb.Node
import org.neo4j.graphdb.traversal.Evaluators
import org.neo4j.graphdb.traversal.TraversalDescription
import org.neo4j.scala.DatabaseService
import scala.collection.mutable.ListBuffer
import org.neo4j.graphdb.Relationship
import spray.util.LoggingContext
import scala.collection.mutable.HashMap
import org.neo4j.graphdb.traversal.Evaluation

trait UserDatabase extends AbstractGraphDatabase {

  // User that has been deleted over one minute ago is is destroyed
  val USER_DESTROY_TRESHOLD: Long = 60000l

  // METHODS THAT NEED TO BE OVERRIDDEN

  def updateItemsIndex(itemNode: Node, setResult: SetResult): Unit

  // PUBLICs

  def putNewUser(user: User, password: String, signUpMode: SignUpMode, inviteCode: Option[Long]): Response[(SetResult, Option[Long], Option[String])] = {
    for {
      unit <- validateEmailUniqueness(user.email.get).right
      inviteNode <- getInviteNodeOption(user.email.get, inviteCode).right
      userResult <- createUser(user, password, getExtraUserLabel(signUpMode), inviteNode).right
      result <- Right(getSetResult(userResult._1, true)).right
    } yield (result, userResult._2, userResult._3)
  }

  def patchExistingUser(userUUID: UUID, user: User): Response[PatchUserResponse] = {
    for {
      userResult <- updateUser(userUUID, user).right
      result <- Right(getSetResult(userResult._1, false)).right
    } yield PatchUserResponse(userResult._2, result)
  }

  def changeUserEmail(userUUID: UUID, email: String): Response[(SetResult, Option[Long])] = {
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

  def getUsers(): Response[Users] = {
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

  def getFullUser(userNode: Node): Response[User] = {
    withTx {
      implicit neo =>
        for {
          user <- toCaseClass[User](userNode).right
          completeUser <- addTransientUserProperties(userNode, user, fullCollectives=true).right
        } yield completeUser
    }
  }

  def getUserEmailVerificationInfo(uuid: UUID): Response[(String, Long)] = {
    withTx {
      implicit neo4j =>
        for {
          userNode <- getNode(uuid, OwnerLabel.USER).right
          verificationInfo <- getUserEmailVerificationInfo(userNode).right
        } yield verificationInfo
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

  def destroyDeletedOwners: Response[CountResult] = {
    for {
      ownerUUIDs <- getDeletedOwnerUUIDs.right
      count <- destroyDeletedOwners(ownerUUIDs).right
    } yield count
  }

  def destroyUser(userUUID: UUID): Response[DestroyResult] = {
    withTx {
      implicit neo4j =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER, acceptDeleted=true).right
          deletable <- validateUserDeletable(userNode).right
          result <- destroyUserNode(userNode).right
        } yield result
    }
  }

  def getAgreement(userUUID: UUID, agreementUUID: UUID): Response[(Agreement, String, String)] = {
    withTx {
      implicit neo =>
        for {
          agreementInfo <- getAgreementInformation(userUUID, agreementUUID).right
          agreement <- toAgreement(agreementInfo, showProposedBy=true).right
        } yield (agreement, agreementInfo.concerningTitle, agreementInfo.proposedByDisplayName)
    }
  }

  case class AgreementResult(result: SetResult, concerningTitle: String, proposedByEmail: String, proposedByDisplayName: String)
  def putNewAgreement(agreement: Agreement): Response[AgreementResult] = {
    for {
      agreementResult <- createAgreementNode(agreement).right
      result <- Right(getSetResult(agreementResult.agreementNode, true)).right
      unit <- Right(if (agreement.agreementType == "list") // Update items index with new list modified
                      updateItemsIndex(agreementResult.concerningNode, getSetResult(agreementResult.concerningNode, false))).right
    } yield (AgreementResult(result, agreementResult.concerningTitle, agreementResult.proposedByEmail, agreementResult.proposedByDisplayName))
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

  def getOwnerStatistics(uuid: UUID): Response[NodeStatistics] = {
    for {
      ownerNode <- getNode(uuid, MainLabel.OWNER).right
      stats <- Right(getOwnerStatistics(ownerNode)).right
    } yield stats
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

  def setOwnerProperty(uuid: UUID, key: String, stringValue: Option[String], longValue: Option[Long]): Response[SetResult] = {
    for {
      ownerNode <- getNode(uuid, MainLabel.OWNER).right
      unit <- Right(setNodeProperty(ownerNode, key: String, stringValue: Option[String], longValue: Option[Long])).right
      result <- Right(getSetResult(ownerNode, false)).right
    } yield result
  }

  // PRIVATE

  protected def createUser(user: User, plainPassword: String,
    userLabel: Option[Label], inviteNode: Option[Node] = None, overrideEmailVerified: Option[Long] = None): Response[(Node, Option[Long], Option[String])] = {
    withTx {
      implicit neo4j =>

        // Create a user node
        val userNode = createNode(user.copy(handle = None, content = None, format = None, displayName = None), MainLabel.OWNER, OwnerLabel.USER)
        if (userLabel.isDefined) userNode.addLabel(userLabel.get)
        setUserPassword(userNode, plainPassword)
        userNode.setProperty("email", user.email.get)
        if (user.cohort.isDefined) userNode.setProperty("cohort", user.cohort.get)
        userNode.setProperty("inboxId", generateUniqueInboxId())

        val emailVerificationCode = if (inviteNode.isDefined){
          // When the user accepts invite using a code sent to her email,
          // that means that the email is also verified
          userNode.setProperty("emailVerified", System.currentTimeMillis)
          acceptInviteNode(inviteNode.get, userNode)
          None
        } else if (overrideEmailVerified.isDefined) {
          userNode.setProperty("emailVerified", overrideEmailVerified.get)
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

        var updatePublicModified = false
        if (user.displayName.isDefined){
          userNode.setProperty("displayName", user.displayName.get)
          updatePublicModified = true
        }

        // Only set content if format is also defined
        if (user.content.isDefined && user.format.isDefined){
          userNode.setProperty("content", user.content.get)
          userNode.setProperty("format", user.format.get)
          updatePublicModified = true
        }

        val handleResult = setOwnerHandle(userNode, user.handle)
        if (handleResult.isRight){
          if (handleResult.right.get._1) updatePublicModified = true
          if (updatePublicModified) userNode.setProperty("publicModified", System.currentTimeMillis)

          Right((userNode, emailVerificationCode, handleResult.right.get._2))
        }else{
          Left(handleResult.left.get)
        }
    }
  }

  protected def updateUser(userUUID: UUID, user: User): Response[(Node, Option[String])] = {
    withTx {
      implicit neo4j =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          shortId <- updateUser(userNode, user).right
        } yield (userNode, shortId)
    }
  }

  protected def updateUser(userNode: Node, user: User)(implicit neo4j: DatabaseService): Response[Option[String]] = {
    // Onboarding status
    if (user.preferences.isDefined && user.preferences.get.onboarded.isDefined) {
      userNode.setProperty("onboarded", user.preferences.get.onboarded.get);
    }

    // UI Preferences
    if (user.preferences.isDefined && user.preferences.get.ui.isDefined) {
      userNode.setProperty("ui", user.preferences.get.ui.get);
    }

    var updatePublicModified = false
    // Display name
    if (user.displayName.isDefined){
      if(!userNode.hasProperty("displayName") ||
         userNode.getProperty("displayName").asInstanceOf[String] != user.displayName.get) {
        userNode.setProperty("displayName", user.displayName.get);
        updatePublicModified = true
      }
    }else if (userNode.hasProperty("displayName")){
      userNode.removeProperty("displayName");
      updatePublicModified = true
    }

    // Content and format update
    if (user.content.isDefined && user.format.isDefined) {
      if (!userNode.hasProperty("content") ||
          userNode.getProperty("content").asInstanceOf[String] != user.content.get){
        userNode.setProperty("content", user.content.get);
        updatePublicModified = true
      }
      if (!userNode.hasProperty("format") ||
          userNode.getProperty("format").asInstanceOf[String] != user.format.get){
        userNode.setProperty("format", user.format.get);
        updatePublicModified = true
      }
    }else if (userNode.hasProperty("content") || userNode.hasProperty("format")){
      if (userNode.hasProperty("content")) userNode.removeProperty("content")
      if (userNode.hasProperty("format")) userNode.removeProperty("format")
      updatePublicModified = true
    }

    // Update handle
    val handleResult = setOwnerHandle(userNode, user.handle)
    if (handleResult.isRight){
      if (handleResult.right.get._1) updatePublicModified = true
      if (updatePublicModified) userNode.setProperty("publicModified", System.currentTimeMillis)
      Right(handleResult.right.get._2)
    }else{
      Left(handleResult.left.get)
    }
  }

  protected def updateUserEmail(userUUID: UUID, email: String): Response[(Node, Option[Long])] = {
    withTx {
      implicit neo4j =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          verificationCode <- Right(updateUserEmail(userNode, email)).right
        } yield (userNode, verificationCode)
    }
  }

  protected def updateUserEmail(userNode: Node, email: String)(implicit neo4j: DatabaseService): Option[Long] = {
    if (userNode.getProperty("email").asInstanceOf[String] != email) {
      userNode.setProperty("email", email)
      if (userNode.hasProperty("emailVerified")) userNode.removeProperty("emailVerified")
      val emailVerificationCode = Random.generateRandomUnsignedLong
      userNode.setProperty("emailVerificationCode", emailVerificationCode)
      Some(emailVerificationCode)
    } else {
      None
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
        val nodeList = findNodesByLabelAndProperty(OwnerLabel.USER, "email", email).toList
        if (nodeList.isEmpty) {
          fail(INVALID_PARAMETER, ERR_USER_NO_USERS, "No users found with given email " + email)
        } else if (nodeList.size > 1) {

          nodeList.foreach(node => {
            println("User " + node.getProperty("email").asInstanceOf[String]
              + " has duplicate node "
              + IdUtils.getUUID(node.getProperty("uuid").asInstanceOf[String])
              + " with id " + node.getId())
          })

          fail(INTERNAL_SERVER_ERROR, ERR_USER_MORE_THAN_1_USERS, "Ḿore than one user found with given email " + email)
        } else
          Right(nodeList(0))
    }
  }

  protected def getUserNode(tokenNode: Node)(implicit neo4j: DatabaseService): Response[Node] = {
    val userFromToken: TraversalDescription =
      neo4j.gds.traversalDescription()
        .relationships(RelationshipType.withName(SecurityRelationship.IDS.name),
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
      case MODE_NORMAL => Some(UserLabel.NORMAL)
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

  protected def addTransientUserProperties(userNode: Node, user: User, fullCollectives: Boolean)(implicit neo4j: DatabaseService): Response[User] = {
    val sharingRelationshipsList = sharingTraversalDescription.traverse(userNode).relationships().toList
    val sharedListRelationshipList = sharingRelationshipsList filter {relationship => {
      relationship.getEndNode.hasLabel(ItemLabel.LIST)
    }}
    val collectivesRelationshipList = sharingRelationshipsList filter {relationship => {
      relationship.getEndNode.hasLabel(OwnerLabel.COLLECTIVE)
    }}
    val limitedCollectives = getCollectiveAccess(collectivesRelationshipList)

    val shortId =
      if (userNode.hasProperty("sid"))
        Some(IdUtils.getShortIdAsString(userNode.getProperty("sid").asInstanceOf[Long]))
      else None

    val collectiveAccessResponse = getFullCollectiveAccess(collectivesRelationshipList)
    if (collectiveAccessResponse.isLeft) return Left(collectiveAccessResponse.left.get)
    Right(user.copy(
              shortId = shortId,
              preferences = getOwnerPreferences(userNode),
              collectives = collectiveAccessResponse.right.get,
              sharedLists = getSharedListAccess(sharedListRelationshipList)))
  }

  protected def getOwnerPreferences(userNode: Node)(implicit neo4j: DatabaseService): Option[OwnerPreferences] = {
    if (userNode.hasProperty("onboarded") || userNode.hasProperty("ui")) {
      Some(OwnerPreferences(
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

  protected def getDeletedOwnerUUIDs: Response[scala.List[UUID]] = {
    withTx {
      implicit neo4j =>
        val ownerNodeList = findNodesByLabel(MainLabel.OWNER).toList
        val deletedOwnerBuffer = new ListBuffer[UUID]
        ownerNodeList.foreach(ownerNode => {
          if (ownerNode.hasProperty("deleted"))
            deletedOwnerBuffer.append(getUUID(ownerNode))
        })
        Right(deletedOwnerBuffer.toList)
    }
  }

  protected def getUserEmailVerificationInfo(userNode: Node)(implicit neo4j: DatabaseService): Response[(String, Long)] = {
    if (userNode.hasProperty("emailVerified")){
      fail(INVALID_PARAMETER, ERR_USER_EMAIL_ALREADY_VERIFIED, "email has already been verified")
    }else{
      if (!userNode.hasProperty("emailVerificationCode")){
        userNode.setProperty("emailVerificationCode", Random.generateRandomUnsignedLong)
      }
      Right(userNode.getProperty("email").asInstanceOf[String], userNode.getProperty("emailVerificationCode").asInstanceOf[Long])
    }
  }

  protected def destroyDeletedOwners(ownerUUIDs: scala.List[UUID]): Response[CountResult] = {
    val currentTimestamp = System.currentTimeMillis
    val destroyCount = ownerUUIDs.count(ownerUUID => {
      val destroyResult = destroyDeletedOwner(ownerUUID, currentTimestamp)
      if (destroyResult.isLeft) {
        return Left(destroyResult.left.get)
      }else{
        destroyResult.right.get
      }
    })
    Right(CountResult(destroyCount))
  }

  protected def destroyDeletedOwner(ownerUUID: UUID, currentTimestamp: Long): Response[Boolean] = {
    withTx {
      implicit neo4j =>
        val ownerNodeResponse = getNode(ownerUUID, MainLabel.OWNER, acceptDeleted=true)
        if (ownerNodeResponse.isLeft)
          Left(ownerNodeResponse.left.get)
        else {
          val ownerNode = ownerNodeResponse.right.get
          if (ownerNode.hasLabel(OwnerLabel.USER)){
            if (ownerNode.hasProperty("deleted") &&
                ownerNode.getProperty("deleted").asInstanceOf[Long] < (currentTimestamp - USER_DESTROY_TRESHOLD)){
              val destroyResult = destroyUserNode(ownerNode)
              if (destroyResult.isLeft) Left(destroyResult.left.get)
              else Right(true)
            }else{
              Right(false)
            }
          }else{
            // TODO: Collective destroying
            Right(false)
          }
        }
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

  case class CreateAgreementResult(agreementNode: Node, concerningTitle: String, proposedByEmail: String, proposedByDisplayName: String, concerningNode: Node)
  protected def createAgreementNode(agreement: Agreement): Response[CreateAgreementResult] = {
    withTx {
      implicit neo4j =>
        for {
          proposedByUserNode <- getNode(agreement.proposedBy.get.uuid.get, OwnerLabel.USER).right
          proposedByDisplayName <- Right(getDisplayOwner(proposedByUserNode)).right
          proposedToUserNode <- getUserNode(agreement.proposedTo.get.email.get).right
          concerningNode <- getItemNode(agreement.proposedBy.get.uuid.get, agreement.targetItem.get.uuid, ItemLabel.LIST, false).right
          agreementNode <- createAgreementNode(agreement, proposedByUserNode, proposedToUserNode, concerningNode).right
        } yield (CreateAgreementResult(agreementNode,
                 concerningNode.getProperty("title").asInstanceOf[String],
                 proposedByUserNode.getProperty("email").asInstanceOf[String],
                 proposedByDisplayName,
                 concerningNode))
    }
  }

  protected def createAgreementNode(agreement: Agreement, proposedByUserNode: Node, proposedToUserNode: Node, concerningNode: Node)(implicit neo4j: DatabaseService): Response[Node] = {
    if (proposedByUserNode.getId == proposedToUserNode.getId){
      return fail(INVALID_PARAMETER, ERR_USER_AGREEMENT_TO_SELF, "Can't share list to the same user")
    }

    val agreementsFromProposedBy: TraversalDescription =
    neo4j.gds.traversalDescription()
      .relationships(RelationshipType.withName(AgreementRelationship.PROPOSES.name),
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
          destroyResult <- Right(destroyAgreementNode(agreementInfo)).right
        } yield (agreementInfo, destroyResult)
    }
  }

  case class AgreementInformation(agreement: Node, agreementType: String, proposedBy: Node, proposedByDisplayName: String, concerning: Node, proposedTo: Option[Node], userIsCreator: Boolean, concerningTitle: String)

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

    val proposedByDisplayName = getDisplayOwner(proposedByUser)

    Right(AgreementInformation(agreementNode, agreementType, proposedByUser, proposedByDisplayName, concerningNode, proposedToUser, userIsCreator, concerningNode.getProperty("title").asInstanceOf[String]))
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
          .relationships(RelationshipType.withName(SecurityRelationship.IS_FOUNDER.name), Direction.OUTGOING)
          .relationships(RelationshipType.withName(SecurityRelationship.CAN_READ.name), Direction.OUTGOING)
          .relationships(RelationshipType.withName(SecurityRelationship.CAN_READ_WRITE.name), Direction.OUTGOING)
          .evaluator(Evaluators.excludeStartPosition())
          .evaluator(LabelEvaluator(scala.List(ItemLabel.LIST, OwnerLabel.COLLECTIVE)))
          .evaluator(Evaluators.toDepth(1))
  }

  protected def incomingSharingTraversalDescription(implicit neo4j: DatabaseService): TraversalDescription = {
    neo4j.gds.traversalDescription()
          .relationships(RelationshipType.withName(SecurityRelationship.IS_FOUNDER.name), Direction.INCOMING)
          .relationships(RelationshipType.withName(SecurityRelationship.CAN_READ.name), Direction.INCOMING)
          .relationships(RelationshipType.withName(SecurityRelationship.CAN_READ_WRITE.name), Direction.INCOMING)
          .depthFirst()
          .evaluator(Evaluators.excludeStartPosition())
          .evaluator(Evaluators.toDepth(1))
          .evaluator(PropertyEvaluator(
            OwnerLabel.USER, "deleted",
            foundEvaluation=Evaluation.EXCLUDE_AND_PRUNE,
            notFoundEvaluation=Evaluation.INCLUDE_AND_CONTINUE))
  }

  protected def getCollectiveAccess(relationshipList: scala.List[Relationship])(implicit neo4j: DatabaseService): Option[Map[UUID,(String, Byte, Boolean, Option[String])]] = {
    if (relationshipList.isEmpty) None
    else{
      val collectiveAccessMap = new HashMap[UUID,(String, Byte, Boolean, Option[String])]
      relationshipList foreach (relationship => {
        val collective = relationship.getEndNode()
        val title = collective.getProperty("title").asInstanceOf[String]
        val uuid = getUUID(collective)
        val common = if(collective.hasProperty("common")) true else false
        val handle = if(collective.hasProperty("handle"))
                       Some(collective.getProperty("handle").asInstanceOf[String])
                     else None
        relationship.getType().name() match {
          case SecurityRelationship.IS_FOUNDER.relationshipName =>
            collectiveAccessMap.put(uuid, (title, SecurityContext.FOUNDER, common, handle))
          case SecurityRelationship.CAN_READ.relationshipName => {
            if (!collectiveAccessMap.contains(uuid))
              collectiveAccessMap.put(uuid, (title, SecurityContext.READ, common, handle))
          }
          case SecurityRelationship.CAN_READ_WRITE.relationshipName => {
            if (collectiveAccessMap.contains(uuid))
              collectiveAccessMap.update(uuid, (title, SecurityContext.READ_WRITE, common, handle))
            else
              collectiveAccessMap.put(uuid, (title, SecurityContext.READ_WRITE, common, handle))
          }
        }
      })
      Some(collectiveAccessMap.toMap)
    }
  }

  protected def getFullCollectiveAccess(relationshipList: scala.List[Relationship])(implicit neo4j: DatabaseService): Response[Option[Map[UUID,(String, Byte, Boolean, Option[Collective])]]] = {
    if (relationshipList.isEmpty) Right(None)
    else{
      val collectiveAccessMap = new HashMap[UUID,(String, Byte, Boolean, Option[Collective])]
      relationshipList foreach (relationship => {
        val collectiveNode = relationship.getEndNode()
        val common = if (!collectiveNode.hasProperty("common")) false
                     else collectiveNode.getProperty("common").asInstanceOf[Boolean]
        val relationshipType = relationship.getType().name()
        val collectiveResponse =
          if (relationshipType == SecurityRelationship.CAN_READ.relationshipName || common){
            if (relationshipType == SecurityRelationship.CAN_READ.relationshipName && common)
              getCollectiveNode(collectiveNode, skipCreator=true, skipAccess=true, skipAccessRelationship=None, skipPreferences=true)
            else
              getCollectiveNode(collectiveNode, skipCreator=true, skipAccess=true, skipAccessRelationship=None, skipPreferences=false)
          }else{
            getCollectiveNode(collectiveNode, skipCreator=true, skipAccess=false, skipAccessRelationship=Some(relationship), skipPreferences=false)
          }
        if (collectiveResponse.isLeft) return Left(collectiveResponse.left.get)
        val collective = collectiveResponse.right.get
        val uuid = collective.uuid.get
        val title = collective.title.get
        val trimmedCollective = collective.copy(uuid=None, title=None, content=None, format=None, creator=None, apiKey=None, common=None, created=None, modified=None)
        relationship.getType().name() match {
          case SecurityRelationship.IS_FOUNDER.relationshipName =>
            collectiveAccessMap.put(uuid, (title, SecurityContext.FOUNDER, common, Some(trimmedCollective)))
          case SecurityRelationship.CAN_READ.relationshipName => {
            if (!collectiveAccessMap.contains(uuid))
              collectiveAccessMap.put(uuid, (title, SecurityContext.READ, common,
                  Some(trimmedCollective.copy(inboxId=None))))
          }
          case SecurityRelationship.CAN_READ_WRITE.relationshipName => {
            if (collectiveAccessMap.contains(uuid))
              collectiveAccessMap.update(uuid, (title, SecurityContext.READ_WRITE, common, Some(trimmedCollective)))
            else
              collectiveAccessMap.put(uuid, (title, SecurityContext.READ_WRITE, common, Some(trimmedCollective)))
          }
        }
      })
      Right(Some(collectiveAccessMap.toMap))
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
          .relationships(RelationshipType.withName(SecurityRelationship.OWNS.name), Direction.INCOMING)
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

  protected def getAccessForCollective(relationshipList: scala.List[Relationship])(implicit neo4j: DatabaseService): Option[scala.List[(UUID, String, Byte)]] = {
    if (relationshipList.isEmpty) None
    else{
      val userAccessMap = new ListBuffer[(UUID, String, Byte)]
      relationshipList foreach (relationship => {
        val userNode = relationship.getStartNode()
        val displayName = getDisplayOwner(userNode)
        val userUUID = getUUID(userNode)
        relationship.getType().name() match {
          case SecurityRelationship.IS_FOUNDER.relationshipName =>
            userAccessMap.append((userUUID, displayName, SecurityContext.FOUNDER))
          case SecurityRelationship.CAN_READ.relationshipName => {
            userAccessMap.append((userUUID, displayName, SecurityContext.READ))
          }
          case SecurityRelationship.CAN_READ_WRITE.relationshipName => {
            userAccessMap.append((userUUID, displayName, SecurityContext.READ_WRITE))
          }
        }
      })
      Some(userAccessMap.toList)
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
          if(existingRelationship.get.getType().name != SecurityRelationship.CAN_READ.name){
            existingRelationship.get.delete()
          }else{
            return Right(existingRelationship)
          }
        }
        Right(Some(userNode --> SecurityRelationship.CAN_READ --> targetNode <))
      }
      case Some(SecurityContext.READ_WRITE) =>
        if(existingRelationship.isDefined){
          if(existingRelationship.get.getType().name != SecurityRelationship.CAN_READ_WRITE.name){
            existingRelationship.get.delete()
          }else
            return Right(existingRelationship)
        }
        Right(Some(userNode --> SecurityRelationship.CAN_READ_WRITE --> targetNode <))
      case None => {
        if(existingRelationship.isDefined){
          if (targetNode.hasLabel(OwnerLabel.COLLECTIVE)){
            // Removing permission to collective, remove assignees as well
            removeCollectiveAssigneeRelationships(targetNode, userNode)
            val response = removeCollectiveTagRelationships(targetNode, userNode)
            if (response.isLeft) return Left(response.left.get)
          }
          // Make sure modified value for end node is always changed also when permission is removed
          existingRelationship.get.getEndNode.setProperty("modified", System.currentTimeMillis)
          existingRelationship.get.delete()
        }
        Right(None)
      }
      case _ =>
        fail(INVALID_PARAMETER, ERR_USER_INVALID_ACCESS_VALUE, "Invalid access value: " + access)
    }
  }

  // Child needs to implement this method
  protected def removeCollectiveAssigneeRelationships(collectiveNode: Node, userNode: Node)(implicit neo4j: DatabaseService): Unit;
  protected def removeCollectiveTagRelationships(collectiveNode: Node, userNode: Node)(implicit neo4j: DatabaseService): Response[Unit];

  protected def getSecurityRelationship(targetNode: Node, userNode: Node)
      (implicit neo4j: DatabaseService): Response[Option[Relationship]] = {
    getRelationship(userNode, targetNode, SecurityRelationship.CAN_READ, SecurityRelationship.CAN_READ_WRITE,
            SecurityRelationship.IS_FOUNDER)
  }

  protected def destroyAgreementNode(agreementInfo: AgreementInformation)(implicit neo4j: DatabaseService): DestroyResult = {

    // First: remove permission
    if (agreementInfo.agreement.hasProperty("accepted")){
      // Remove permission to the original element
      setPermission(agreementInfo.concerning, agreementInfo.proposedTo.get, None)
    }

    // Second, delete all relationships to the agreement
    agreementInfo.agreement.getRelationships.foreach(relationship => {
      relationship.delete
    })

    // Delete agreement
    val agreementUUID = getUUID(agreementInfo.agreement)
    agreementInfo.agreement.delete
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
      fail(INTERNAL_SERVER_ERROR, ERR_USER_CANT_FIND_AGREEMENT_CONCERNING, "Can't find the agreement target")
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

  protected def generateUniqueInboxId()(implicit neo4j: DatabaseService): String = {
    var inboxId: String = null
    do {
      inboxId = Random.generateRandomUniqueString(characterLimit = 8)
      if (!findNodesByLabelAndProperty(MainLabel.OWNER, "inboxId", inboxId).toList.isEmpty){
        // Already found an owner with this inboxId, create another
        inboxId = null
      }
    }while(inboxId == null)
    inboxId
  }

  protected def getOwnerStatistics(ownerNode: Node): NodeStatistics = {
    withTx {
      implicit neo4j =>
        val ownerProperties: scala.List[(String, Long)] = {
          ownerNode.getPropertyKeys.toList.map(key => {
            // we know that all user properties are Long, Int, Boolean, or String
            if (key == "created" || key == "modified" || key == "deleted" ||
                key == "passwordResetCode" || key == "passwordResetCodeExpires" ||
                key == "emailVerified" || key == "emailVerificationCode"){
              (key, ownerNode.getProperty(key).asInstanceOf[Long])
            }else if (key == "cohort"){
              (key, ownerNode.getProperty(key).asInstanceOf[Int].toLong)
            }else if (key == "common"){
              val common = ownerNode.getProperty(key).asInstanceOf[Boolean]
              (key, if (common) 1l else 0l)
            }else if (key.startsWith("password")){
              (key, -1l)
            }else{
              (key, ownerNode.getProperty(key).asInstanceOf[String].length.asInstanceOf[Long])
            }
          })
        }
        val ownerLabels = ownerNode.getLabels.toList.map(label => {
          label.name
        })
        NodeStatistics(ownerProperties, ownerLabels)
    }
  }

  protected def validateHandleUniqueness(handle: Option[String])(implicit neo4j: DatabaseService): Response[Boolean] = {
    if (handle.isEmpty){
      Right(false)
    }else{
      val userNodeList = findNodesByLabelAndProperty(MainLabel.OWNER, "handle", handle.get).toList
      if (!userNodeList.isEmpty){
        return fail(INVALID_PARAMETER, ERR_BASE_HANDLE_EXISTS, "Owner already exists with given handle: " + handle.get)
      }
      Right(true)
    }
  }

  protected def setOwnerHandle(ownerNode: Node, handle: Option[String])(implicit neo4j: DatabaseService): Response[(Boolean, Option[String])] = {
    if (handle.isDefined){
      if (ownerNode.hasProperty("handle")) {
        // Process change of handle
        val previousHandle = ownerNode.getProperty("handle").asInstanceOf[String]
        if (previousHandle != handle.get){
          // Attempting to change handle
          setOwnerHandleValue(ownerNode, handle.get)
        }else{
          Right((false, None))
        }
      }else{
        // Setting handle to owner for the first time
        setOwnerHandleValue(ownerNode, handle.get)
      }
    }else if (ownerNode.hasProperty("handle")){
      if (hasPublicItemRevisionNodes(getUUID(ownerNode))){
        fail(INVALID_PARAMETER, ERR_BASE_CAN_NOT_REMOVE_PUBLISHED_HANDLE, "Can not remove handle from an owner that has published items")
      }else{
        val previousHandle = ownerNode.getProperty("handle").asInstanceOf[String]
        ownerNode.removeProperty("handle")
        Right((true, None))
      }
    }else{
      Right((false, None))
    }
  }

  protected def hasPublicItemRevisionNodes(ownerUUID: UUID)(implicit neo4j: DatabaseService): Boolean;

  protected def setOwnerHandleValue(ownerNode: Node, handle: String)(implicit neo4j: DatabaseService): Response[(Boolean, Option[String])] = {
    val validateResult = validateHandleUniqueness(Some(handle))
    if (validateResult.isRight){
      // Also create a short id when handle is set, if it is not set before
      val shortId =
        if (!ownerNode.hasProperty("sid")){
          val shortIdAsLong = generateShortId
          ownerNode.setProperty("sid", shortIdAsLong)
          Some(IdUtils.getShortIdAsString(shortIdAsLong))
        }else{
          None
        }
      ownerNode.setProperty("handle", handle)
      Right((true, shortId))
    } else{
      Left(validateResult.left.get)
    }
  }

  protected def getDisplayOwner(ownerNode: Node)(implicit neo4j: DatabaseService): String = {
    if (ownerNode.hasProperty("displayName")) ownerNode.getProperty("displayName").asInstanceOf[String]
    else if (ownerNode.hasProperty("title")) ownerNode.getProperty("title").asInstanceOf[String]
    else ownerNode.getProperty("email").asInstanceOf[String]
  }

  // Abstract invite methods
  protected def getInviteNodeOption(email: String, inviteCode: Option[Long]): Response[Option[Node]];
  protected def acceptInviteNode(inviteNode: Node, userNode: Node)(implicit neo4j: DatabaseService): Unit;

  // Abstract collective methods
  protected def getCollectiveNode(collectiveNode: Node, skipCreator: Boolean, skipAccess: Boolean, skipAccessRelationship: Option[Relationship], skipPreferences: Boolean)(implicit neo4j: DatabaseService): Response[Collective];
}