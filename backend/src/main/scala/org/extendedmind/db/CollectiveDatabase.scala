/**
 * Copyright (c) 2013-2017 Extended Mind Technologies Oy
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
import org.neo4j.graphdb.traversal.Evaluation
import org.neo4j.graphdb.Relationship
import akka.event.LoggingAdapter
import org.neo4j.graphdb.event.TransactionEventHandler

trait CollectiveDatabase extends UserDatabase {

  // PUBLIC

  def putNewCollective(founderUUID: UUID, collective: Collective): Response[SetResult] = {
    for{
      collectiveResult <- createCollective(founderUUID, collective, false).right
    } yield collectiveResult._1
  }

  def putExistingCollective(collectiveUUID: UUID, collective: Collective): Response[SetResult] = {
    for {
      result <- putExistingCollectiveNode(collectiveUUID, collective).right
    } yield result
  }

  def getCollective(collectiveUUID: UUID, securityContext: SecurityContext): Response[Collective] = {
    withTx {
      implicit neo =>
        val collectiveAccess = securityContext.collectives.get.get(collectiveUUID).get._2
        val commonCollective = securityContext.collectives.get.get(collectiveUUID).get._3
        for {
          collectiveNode <- getNode(collectiveUUID, OwnerLabel.COLLECTIVE).right
          collective <- getCollectiveNode(collectiveNode,
            skipCreator = if (collectiveAccess == SecurityContext.READ) true else false,
            skipAccess = if (collectiveAccess == SecurityContext.READ || commonCollective) true else false,
            skipAccessRelationship = None,
            skipPreferences = false
          ).right
        } yield (
            if (collectiveAccess == SecurityContext.READ)
              collective.copy(apiKey=None, inboxId=None, created=None, modified=None)
            else if (collectiveAccess == SecurityContext.READ_WRITE)
              collective.copy(apiKey=None)
            else collective)
    }
  }

  def setCollectiveUserPermission(collectiveUUID: UUID, founderUUID: UUID, userUUID: UUID, access: Option[Byte]):
        Response[SetResult] = {
    for {
      result <- setCollectiveUserPermissionNode(collectiveUUID, founderUUID, userUUID, access).right
    } yield result
  }

  // PRIVATE

  protected def getCollectiveNode(collectiveNode: Node, skipCreator: Boolean, skipAccess: Boolean, skipAccessRelationship: Option[Relationship], skipPreferences: Boolean)(implicit neo4j: DatabaseService): Response[Collective] = {
    for {
      collective <- toCaseClass[Collective](collectiveNode).right
      completeCollective <- Right(addTransientCollectiveProperties(collectiveNode, collective, skipCreator, skipAccess, skipAccessRelationship, skipPreferences)).right
    } yield completeCollective
  }

  protected def createCollective(founderUUID: UUID, collective: Collective, commonCollective: Boolean): Response[(SetResult, Node)] = {
    withTx{
      implicit neo4j =>
        for {
          founderNode <- getNode(founderUUID, OwnerLabel.USER).right
          collectiveResult <- createCollectiveNode(founderNode, collective, commonCollective).right
        } yield collectiveResult
    }
  }

  protected def createCollectiveNode(founderNode: Node, collective: Collective, commonCollective: Boolean)
               (implicit neo4j: DatabaseService): Response[(SetResult, Node)] = {
    val collectiveNode = createNode(collective.copy(inboxId=None, apiKey=None, handle=None, content=None, format=None, displayName=None, preferences=None), MainLabel.OWNER, OwnerLabel.COLLECTIVE)
    founderNode --> SecurityRelationship.IS_FOUNDER --> collectiveNode;
    collectiveNode.setProperty("inboxId", generateUniqueInboxId())
    collectiveNode.setProperty("apiKey", Random.generateRandomUniqueString())

    if (commonCollective){
      collectiveNode.setProperty("common", true)
      // Give all existing users read access to to common collective
      val userIterator = findNodesByLabel(OwnerLabel.USER);
      userIterator.foreach(user => {
        if (user != founderNode)
          user --> SecurityRelationship.CAN_READ --> collectiveNode;
      })
    }

    // Onboarding status
    if (collective.preferences.isDefined && collective.preferences.get.onboarded.isDefined) {
      collectiveNode.setProperty("onboarded", collective.preferences.get.onboarded.get);
    }

    // UI Preferences
    if (collective.preferences.isDefined && collective.preferences.get.ui.isDefined) {
      collectiveNode.setProperty("ui", collective.preferences.get.ui.get);
    }

    var updatePublicModified = false

    if (collective.displayName.isDefined){
      collectiveNode.setProperty("displayName", collective.displayName.get)
      updatePublicModified = true
    }

    // Only set content if format is also defined
    if (collective.content.isDefined && collective.format.isDefined){
      collectiveNode.setProperty("content", collective.content.get)
      collectiveNode.setProperty("format", collective.format.get)
      updatePublicModified = true
    }

    // Set handle
    val handleResult = setOwnerHandle(collectiveNode, collective.handle)
    if (handleResult.isRight){
      if (handleResult.right.get._1) updatePublicModified = true
      val result = setNodeCreated(collectiveNode)
      if (updatePublicModified) collectiveNode.setProperty("publicModified", result.modified)
      Right((result, collectiveNode))
    }else{
      Left(handleResult.left.get)
    }
  }

  protected def putExistingCollectiveNode(collectiveUUID: UUID, collective: Collective):
        Response[SetResult] = {
    withTx {
      implicit neo4j =>
        for {
          collectiveNode <- getNode(collectiveUUID, OwnerLabel.COLLECTIVE).right
          result <- updateCollective(collectiveNode, collective).right
        } yield result
    }
  }

  protected def updateCollective(collectiveNode: Node, collective: Collective)(implicit neo4j: DatabaseService): Response[SetResult] = {

    // Onboarding status
    if (collective.preferences.isDefined && collective.preferences.get.onboarded.isDefined) {
      collectiveNode.setProperty("onboarded", collective.preferences.get.onboarded.get);
    }

    // UI Preferences
    if (collective.preferences.isDefined && collective.preferences.get.ui.isDefined) {
      collectiveNode.setProperty("ui", collective.preferences.get.ui.get);
    }

    var updatePublicModified = false

    // Public UI modification
    if (collective.preferences.isDefined && collective.preferences.get.publicUi.isDefined) {
      if (!collectiveNode.hasProperty("publicUi") ||
          collectiveNode.getProperty("publicUi").asInstanceOf[String] != collective.preferences.get.publicUi.get) {
        collectiveNode.setProperty("publicUi", collective.preferences.get.publicUi.get);
        updatePublicModified = true
      }
    }

    // Description
    if (collective.description.isDefined) {
      collectiveNode.setProperty("description", collective.description.get);
    }else if (collectiveNode.hasProperty("description")){
      collectiveNode.removeProperty("description");
    }

    // Display name
    if (collective.displayName.isDefined){
      if (!collectiveNode.hasProperty("displayName") ||
         collectiveNode.getProperty("displayName").asInstanceOf[String] != collective.displayName.get){
        collectiveNode.setProperty("displayName", collective.displayName.get);
        updatePublicModified = true
      }
    }else if (collectiveNode.hasProperty("displayName")){
      collectiveNode.removeProperty("displayName");
      updatePublicModified = true
    }

    // Content and format update
    if (collective.content.isDefined && collective.format.isDefined){
      if (!collectiveNode.hasProperty("content") ||
          collectiveNode.getProperty("content").asInstanceOf[String] != collective.content.get){
        collectiveNode.setProperty("content", collective.content.get);
        updatePublicModified = true
      }
      if (!collectiveNode.hasProperty("format") ||
          collectiveNode.getProperty("format").asInstanceOf[String] != collective.format.get){
        collectiveNode.setProperty("format", collective.format.get);
        updatePublicModified = true
      }
    }else if (collectiveNode.hasProperty("content") || collectiveNode.hasProperty("format")){
      if (collectiveNode.hasProperty("content")) collectiveNode.removeProperty("content")
      if (collectiveNode.hasProperty("format")) collectiveNode.removeProperty("format")
      updatePublicModified = true
    }

    // Update handle
    val handleResult = setOwnerHandle(collectiveNode, collective.handle)
    if (handleResult.isRight){
      if (handleResult.right.get._1) updatePublicModified = true
      val result = updateNodeModified(collectiveNode)
      if (updatePublicModified) collectiveNode.setProperty("publicModified", result.modified)
      Right(result)
    }else{
      Left(handleResult.left.get)
    }
  }

  protected def setCollectiveUserPermissionNode(collectiveUUID: UUID, founderUUID: UUID, userUUID: UUID, access: Option[Byte]):
      Response[SetResult] = {
    withTx {
      implicit neo4j =>
        for {
          collectiveNode <- getFoundedCollective(collectiveUUID, founderUUID).right
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          relationship <- setPermission(collectiveNode, userNode, access).right
          result <- Right(updateNodeModified(collectiveNode)).right
        } yield result
    }
  }

  protected def getFoundedCollective(collectiveUUID: UUID, founderUUID: UUID)
        (implicit neo4j: DatabaseService): Response[Node] = {
    val collectiveNode = getNode(collectiveUUID, OwnerLabel.COLLECTIVE)
    if (collectiveNode.isLeft) return collectiveNode

    val founderFromCollective: TraversalDescription = {
        neo4j.gds.traversalDescription()
          .relationships(DynamicRelationshipType.withName(SecurityRelationship.IS_FOUNDER.name),
            Direction.INCOMING)
          .depthFirst()
          .evaluator(Evaluators.excludeStartPosition())
          .evaluator(PropertyEvaluator(
            OwnerLabel.COLLECTIVE, "deleted",
            foundEvaluation=Evaluation.EXCLUDE_AND_PRUNE,
            notFoundEvaluation=Evaluation.INCLUDE_AND_CONTINUE))
    }
    val traverser = founderFromCollective.traverse(collectiveNode.right.get)
    val collectiveNodeList = traverser.nodes().toList
    if (collectiveNodeList.length == 0) {
      fail(INTERNAL_SERVER_ERROR, ERR_COLLECTIVE_NO_FOUNDER, "Collective " + collectiveUUID + " has no founder")
    } else if (collectiveNodeList.length > 1) {
      fail(INTERNAL_SERVER_ERROR, ERR_COLLECTIVE_MORE_THAN_1_FOUNDER, "More than one founder found for collective with UUID " + collectiveUUID)
    } else {
      val founder = collectiveNodeList.head
      if (getUUID(founder) != founderUUID){
        fail(INVALID_PARAMETER, ERR_COLLECTIVE_WRONG_FOUNDER, "Collective " + collectiveUUID + " is not founded by user "
            + founderUUID)
      }else{
        Right(collectiveNode.right.get)
      }
    }
  }

  protected def addTransientCollectiveProperties(collectiveNode: Node, collective: Collective, skipCreator:Boolean, skipAccess: Boolean, skipAccessRelationship: Option[Relationship], skipPreferences: Boolean)(implicit neo4j: DatabaseService): Collective = {
    val shortId = {
      if (collectiveNode.hasProperty("sid"))
        Some(IdUtils.getShortIdAsString(collectiveNode.getProperty("sid").asInstanceOf[Long]))
      else None
    }

    if (skipAccess && skipCreator){
      // No need to add anything except shortId
      collective.copy(shortId = shortId)
    }else{
      val usersFromCollective: TraversalDescription = incomingSharingTraversalDescription
      val traverser = usersFromCollective.traverse(collectiveNode)
      val collectiveAccessRelationships = usersFromCollective.traverse(collectiveNode).relationships().toList

      // Find creator
      val creatorUUID: Option[UUID] = {
        if (skipCreator){
          None
        }else{
          val creatorRelationship = collectiveAccessRelationships.find(relationship => relationship.getType().name() == SecurityRelationship.IS_FOUNDER.name())
          creatorRelationship.flatMap(creatorRelationship => Some(getUUID(creatorRelationship.getStartNode)))
        }
      }
      val collectiveAccessList: Option[scala.List[(UUID, String, Byte)]] = {
        if (skipAccess){
          None
        }else{
          // Possibly filter out relationship to skip
          val filteredCollectiveAccessRelationships = collectiveAccessRelationships.
              filter(relationship => skipAccessRelationship.isEmpty || skipAccessRelationship.get != relationship)
          getAccessForCollective(filteredCollectiveAccessRelationships)
        }
      }

      collective.copy(shortId = shortId, access = collectiveAccessList, creator=creatorUUID, preferences = getOwnerPreferences(collectiveNode))
    }
  }

  protected def initializeDatabase(
                   transactionEventHandlers: java.util.ArrayList[TransactionEventHandler[_]],
                   overrideCommonCollective: Option[Collective],
                   overrideAdminUser: Option[User],
                   overrideAdminUserPassword: Option[String]): (DatabaseStatus, Option[UUID], Option[UUID]) = {

    val initializeResult =
      withTx {
        implicit neo4j =>
          // Add transaction event handlers here
          transactionEventHandlers.foreach(eventHandler => neo4j.gds.registerTransactionEventHandler(eventHandler))

          initializeDatabaseInTx(overrideCommonCollective: Option[Collective],
                   overrideAdminUser: Option[User],
                   overrideAdminUserPassword: Option[String])
      }
    withTx {
      implicit neo4j =>
        (initializeResult._1,
            initializeResult._2.flatMap(collectiveNode => Some(getUUID(collectiveNode))),
            initializeResult._3.flatMap(userNode => Some(getUUID(userNode))))
    }
  }

  protected def initializeDatabaseInTx(overrideCommonCollective: Option[Collective] = None,
                   overrideAdminUser: Option[User] = None,
                   overrideAdminUserPassword: Option[String] = None)(implicit neo4j: DatabaseService): (DatabaseStatus, Option[Node], Option[Node]) = {
    val available = neo4j.gds.isAvailable(1000)
    if (available){
      // Try to get the info node
      val infoNodeOption: Option[Node] = {
        val infoNodes = findNodesByLabel(MainLabel.INFO).toList
        if (infoNodes.size == 1){
          Some(infoNodes(0))
        }else if (infoNodes.isEmpty){
          None
        }else {
          println("More than one (" + infoNodes.size + ") info nodes found")
          return (DB_ERROR, None, None)
        }
      }

      if (infoNodeOption.isEmpty){
        // Info node needs to possibly be created, see if this is the first load with no common collective
        val commonCollectiveList = findNodesByLabelAndProperty(OwnerLabel.COLLECTIVE, "common", java.lang.Boolean.TRUE).toList
        if (commonCollectiveList.isEmpty){
          // Database seems to be empty, this might be because this is a new HA slave
          if (settings.operationMode == HA_BOOTSTRAP ||
              settings.operationMode == HA){
            // So this is high availability empty database
            println("No common collective, but HA enabled. Assuming new slave.")
            return (DB_NEW_SLAVE, None, None)
          }else {
            // Single server mode, no common collective nor user, check if this is the first time this is started
            if (overrideCommonCollective.isEmpty && settings.commonCollectiveTitle.isEmpty ||
                overrideAdminUser.isEmpty && settings.adminUserEmail.isEmpty ||
                overrideAdminUserPassword.isEmpty && settings.adminUserPassword.isEmpty){
              println("ERROR: To initialize a new database please provide the following parameters:\n" +
                       "  -Dextendedmind.commonCollectiveTitle=\"[name for your service]\"\n" +
                       "  -Dextendedmind.adminUserEmail=\"[your email]\"\n" +
                       "  -Dextendedmind.adminUserPassword=\"[your password]\"\n")
              return (DB_ERROR, None, None)
            }else{
              println("Initializing database...")
              val commonCollective =
                if (overrideCommonCollective.isDefined) overrideCommonCollective.get
                else Collective(settings.commonCollectiveTitle.get, None, None, None, None, None, None)
              if (!Validators.validateTitle(commonCollective.title.get)){
                println("ERROR: Invalid common collective title")
                return (DB_ERROR, None, None)
              }

              val adminUser =
                if (overrideAdminUser.isDefined) overrideAdminUser.get
                else User(settings.adminUserEmail.get, None, None, None, None, None, None)
              if (!Validators.validateEmailAddress(adminUser.email.get)){
                println("ERROR: Invalid admin user email address")
                return (DB_ERROR, None, None)
              }
              val adminUserPassword =
                if (overrideAdminUserPassword.isDefined) overrideAdminUserPassword.get
                else settings.adminUserPassword.get
              if (!Validators.validatePassword(adminUserPassword)){
                println("ERROR: Invalid admin user password, password must be more than 7 and less than 100 characters long.")
                return (DB_ERROR, None, None)
              }

              val adminUserNode =
                createUser(adminUser, adminUserPassword, Some(UserLabel.ADMIN),
                                         None, overrideEmailVerified=Some(System.currentTimeMillis)).right.get._4
              val commonCollectiveNode =
                createCollectiveNode(adminUserNode, commonCollective, true).right.get._2
              val infoNode = createNode(MainLabel.INFO)
              infoNode --> SecurityRelationship.IS_ORIGIN --> commonCollectiveNode;
              infoNode --> SecurityRelationship.IS_ORIGIN --> adminUserNode;
              println("...database initialization ready.")
              return (DB_READY, Some(commonCollectiveNode), Some(adminUserNode))
            }
          }
        }else if (commonCollectiveList.size == 1){
          val commonCollective = commonCollectiveList(0)
          // Common collective found, but no info node, migrate to new database structure
          // TODO: Remove this code when database is migrated to post v1.9.13
          println("Migrating to post 1.9.13 structure...")
          val adminUsers = findNodesByLabel(UserLabel.ADMIN).toList
          if (adminUsers.isEmpty){
            println("ERROR: No admin users found")
            return (DB_ERROR, None, None)
          }
          val firstAdminUser = adminUsers.reduceLeft((u1: Node, u2:Node) => if (u1.getId < u2.getId) u1 else u2)
          val infoNode = createNode(MainLabel.INFO)
          infoNode --> SecurityRelationship.IS_ORIGIN --> commonCollective;
          infoNode --> SecurityRelationship.IS_ORIGIN --> firstAdminUser;
          println("..migration ready, attached INFO node to " +
                    firstAdminUser.getProperty("email").asInstanceOf[String] + " and common collective " +
                    commonCollective.getProperty("title").asInstanceOf[String])
        }else{
          println("ERROR: More than one (" + commonCollectiveList.size + ") common collective node found")
          return (DB_ERROR, None, None)
        }
      }
    }
    (DB_READY, None, None)
  }

}
