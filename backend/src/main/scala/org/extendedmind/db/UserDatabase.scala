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
  
  def putNewUser(user: User, password: String, signUpMode: SignUpMode): Response[SetResult] = {
    for{
      user <- createUser(user, password, getExtraUserLabel(signUpMode)).right
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
  
  def rebuildUserIndexes: Response[CountResult] = {
    dropIndexes(OwnerLabel.USER)
    createNewIndex(OwnerLabel.USER, "uuid")
    dropIndexes(OwnerLabel.COLLECTIVE)
    createNewIndex(OwnerLabel.COLLECTIVE, "uuid")
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
    val userFromToken: TraversalDescription = 
      Traversal.description()
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