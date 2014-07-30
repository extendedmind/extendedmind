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

trait UserDatabase extends AbstractGraphDatabase {

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

  def upgradeOwners: Response[CountResult] = {
    for {
      ownerUUIDs <- getOwnerUUIDs.right
      count <- upgradeOwners(ownerUUIDs).right
    } yield count
  }

  def upgradeOwner(ownerUUID: UUID): Response[SetResult] = {
    for {
      ownerNode <- upgradeOwnerNode(ownerUUID).right
      result <- Right(getSetResult(ownerNode, false)).right
    } yield result
  }

  def upgradeItems: Response[CountResult] = {
    for {
      ownerUUIDs <- getOwnerUUIDs.right
      count <- upgradeItems(ownerUUIDs).right
    } yield count
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

  // PRIVATE

  protected def createUser(user: User, plainPassword: String,
    userLabel: Option[Label] = None, emailVerified: Option[Long] = None): Response[(Node, Option[Long])] = {
    withTx {
      implicit neo4j =>
        if (findNodesByLabelAndProperty(OwnerLabel.USER, "email", user.email).toList.size > 0) {
          fail(INVALID_PARAMETER, "User already exists with given email " + user.email)
        } else {
          val userNode = createNode(user, MainLabel.OWNER, OwnerLabel.USER)
          if (userLabel.isDefined) userNode.addLabel(userLabel.get)
          setUserPassword(userNode, plainPassword)
          userNode.setProperty("email", user.email)
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
    if (user.preferences.isDefined && user.preferences.get.onboarded.isDefined && !userNode.hasProperty("onboarded")) {
      userNode.setProperty("onboarded", user.preferences.get.onboarded.get);
    } else if ((user.preferences.isEmpty || user.preferences.get.onboarded.isEmpty) && userNode.hasProperty("onboarded")) {
      userNode.removeProperty("onboarded");
    }

    // UI Preferences
    if (user.preferences.isDefined && user.preferences.get.ui.isDefined) {
      userNode.setProperty("ui", user.preferences.get.ui.get);
    } else if ((user.preferences.isEmpty || user.preferences.get.ui.isEmpty) && userNode.hasProperty("ui")) {
      userNode.removeProperty("ui");
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
          fail(INVALID_PARAMETER, "No users found with given email " + email)
        } else if (nodeIter.toList.size > 1) {

          nodeIter.toList.foreach(node => {
            println("User " + node.getProperty("email").asInstanceOf[String]
              + " has duplicate node "
              + UUIDUtils.getUUID(node.getProperty("uuid").asInstanceOf[String])
              + " with id " + node.getId())
          })

          fail(INTERNAL_SERVER_ERROR, "Ḿore than one user found with given email " + email)
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
      fail(INTERNAL_SERVER_ERROR, "Token attached to no users")
    } else if (userNodeList.length > 1) {
      fail(INTERNAL_SERVER_ERROR, "Token attached to more than one user")
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
    user.copy(preferences = getUserPreferences(userNode))
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
  
  protected def destroyInviteNode(inviteNode: Node)(implicit neo4j: DatabaseService): Response[DestroyResult];
  protected def destroyItem(deletedItem: Node)(implicit neo4j: DatabaseService);
  
  protected def destroyUserNode(userNode: Node)(implicit neo4j: DatabaseService): Response[DestroyResult] = {
    val relationships = userNode.getRelationships().toList
    val inviteRelationships = relationships.filter(relationship => {
      if (relationship.getType.name != SecurityRelationship.IS_ORIGIN.name()) true
      else false
    })
    val inviteNode = if (inviteRelationships.size == 1){
      Some(inviteRelationships(0).getStartNode())
    }else None
    val userUUID = getUUID(userNode)
    
    // Delete all relationships and also destroy items that the user owns
    relationships.foreach(relationship => {
      if (relationship.getType.name == SecurityRelationship.OWNS.name()){
        destroyItem(relationship.getEndNode())
      }
      relationship.delete()
    })
    
    // Delete user
    userNode.delete()
    val destroyResultList = scala.List(userUUID)
    
    // Delete invite as well
    if (inviteNode.isDefined){
      val destroyInviteResult = destroyInviteNode(inviteNode.get)
      if (destroyInviteResult.isLeft){
        Left(destroyInviteResult.left.get)
      }else{
        val joinedList = destroyResultList ++ destroyInviteResult.right.get.destroyed
        Right(DestroyResult(joinedList))
      }
    }else{
      Right(DestroyResult(destroyResultList))
    }
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
        return fail(INVALID_PARAMETER, "Can't delete a user that has founded collections")
      }else if (relationship.getType().name == SecurityRelationship.IS_ACCEPTER.name()){
        return fail(INVALID_PARAMETER, "Can't delete a user that has accepted invites")        
      }
    })
    Right(true)
  }

  protected def upgradeOwners(ownerUUIDs: scala.List[UUID]): Response[CountResult] = {
    ownerUUIDs.foreach(ownerUUID => {
      val upgradeResult = upgradeOwnerNode(ownerUUID)
      if (upgradeResult.isLeft) {
        return Left(upgradeResult.left.get)
      }
    })
    Right(CountResult(ownerUUIDs.size))
  }

  protected def upgradeOwnerNode(ownerUUID: UUID): Response[Node] = {
    withTx {
      implicit neo4j =>
        val ownerNodeResponse = getNode(ownerUUID, MainLabel.OWNER)
        if (ownerNodeResponse.isLeft)
          Left(ownerNodeResponse.left.get)
        else {
          val ownerNode = ownerNodeResponse.right.get
          if (ownerNode.hasProperty("created")) {
            println("owner has created: " + ownerNode.getProperty("created"))
          } else {
            println("setting created")
            ownerNode.setProperty("created", ownerNode.getProperty("modified").asInstanceOf[Long])
          }
          ownerNode.getRelationships().foreach(relationship => {
            if (relationship.getType().name == SecurityRelationship.IS_ORIGIN.name &&
              relationship.getStartNode().hasLabel(MainLabel.INVITE)) {
              println("found invite relationship")
              if (!relationship.getStartNode().hasProperty("accepted")) {
                // Give accepted
                println("setting accepted")
                relationship.getStartNode().setProperty("accepted", ownerNode.getProperty("modified").asInstanceOf[Long])
              }
            }
          })
          Right(ownerNode)
        }
    }
  }

  protected def upgradeItems(ownerUUIDs: scala.List[UUID]): Response[CountResult] = {
    var count: Long = 0
    ownerUUIDs.foreach(ownerUUID => {
      val upgradeResult = upgradeItemsForOwner(ownerUUID)
      if (upgradeResult.isLeft) {
        return Left(upgradeResult.left.get)
      } else {
        count += upgradeResult.right.get
      }
    })
    Right(CountResult(count))
  }

  protected def upgradeItemsForOwner(ownerUUID: UUID): Response[Long] = {
    withTx {
      implicit neo4j =>
        val ownerNodeResponse = getNode(ownerUUID, MainLabel.OWNER)
        if (ownerNodeResponse.isLeft)
          Left(ownerNodeResponse.left.get)
        else {
          val ownerNode = ownerNodeResponse.right.get
          var count: Long = 0
          ownerNode.getRelationships().foreach(ownerRelationship => {
            if (!ownerRelationship.hasProperty("created")) {
              ownerRelationship.setProperty("created", ownerRelationship.getProperty("modified").asInstanceOf[Long])
            }
            if (ownerRelationship.getType().name == SecurityRelationship.OWNS.name) {

              if (!ownerRelationship.getEndNode().hasProperty("created")) {
                ownerRelationship.getEndNode().setProperty("created", ownerRelationship.getEndNode().getProperty("modified").asInstanceOf[Long])
                count += 1
              }
              // Also update item relationships
              ownerRelationship.getEndNode().getRelationships().foreach(itemRelationship => {
                if (itemRelationship.getType().name == ItemRelationship.HAS_PARENT.name ||
                  itemRelationship.getType().name == ItemRelationship.HAS_TAG.name ||
                  itemRelationship.getType().name == ItemRelationship.HAS_ORIGIN.name) {
                  if (!itemRelationship.hasProperty("created")) {
                    itemRelationship.setProperty("created", itemRelationship.getProperty("modified").asInstanceOf[Long])
                  }
                }
              })
            }
          })
          Right(count)
        }
    }
  }
}