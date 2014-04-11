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
    for{
      userResult <- createUser(user, password, getExtraUserLabel(signUpMode)).right
      result <- Right(getSetResult(userResult._1, true)).right
    }yield (result, userResult._2)
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
          completeUser <- Right(addTransientUserProperties(userNode, user)).right
        }yield completeUser
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
  
  protected def createUser(user: User, plainPassword: String,
		  				   userLabel: Option[Label] = None, emailVerified: Option[Long] = None): Response[(Node, Option[Long])] = {
    withTx{
      implicit neo4j =>
        val userNode = createNode(user, MainLabel.OWNER, OwnerLabel.USER)
        if (userLabel.isDefined) userNode.addLabel(userLabel.get)
        setUserPassword(userNode, plainPassword)
        userNode.setProperty("email", user.email)
        if (user.cohort.isDefined) userNode.setProperty("cohort", user.cohort.get)
        
        val emailVerificationCode = if (emailVerified.isDefined){
	      // When the user accepts invite using a code sent to her email, 
	      // that means that the email is also verified
	      userNode.setProperty("emailVerified", emailVerified.get)
	      None
	    }else {
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
    if (user.preferences.isDefined && user.preferences.get.onboarded.isDefined && !userNode.hasProperty("onboarded")){
      userNode.setProperty("onboarded", user.preferences.get.onboarded.get);
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
    if (userNode.getProperty("email").asInstanceOf[String] != email){
      userNode.setProperty("email", email)
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
  
  protected def addTransientUserProperties(userNode: Node, user: User)
                (implicit neo4j: DatabaseService): User = {
    if (userNode.hasProperty("onboarded")){
      user.copy(preferences = Some(UserPreferences(Some(userNode.getProperty("onboarded").asInstanceOf[String])))) 
    }else{
      user
    }
  }
  
}