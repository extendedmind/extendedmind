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

trait UserDatabase extends AbstractGraphDatabase {

  // PUBLIC

  def putNewUser(user: User, password: String): Response[SetResult] = {
    for{
      user <- createUser(user, password).right
      result <- getSetResult(user, true).right
    }yield result
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

  // PRIVATE

  protected def createUser(user: User, plainPassword: String, userLabel: Option[Label] = None): Response[Node] = {
    withTx{
      implicit neo4j =>
        val userNode = createNode(user, MainLabel.USER)
        if (userLabel.isDefined) userNode.addLabel(userLabel.get)
        val salt = PasswordService.generateSalt
        val encryptedPassword = PasswordService.getEncryptedPassword(
          plainPassword, salt, PasswordService.ALGORITHM, PasswordService.ITERATIONS)
        userNode.setProperty("passwordAlgorithm", encryptedPassword.algorithm)
        userNode.setProperty("passwordIterations", encryptedPassword.iterations)
        userNode.setProperty("passwordHash", Base64.encodeBase64String(encryptedPassword.passwordHash))
        userNode.setProperty("passwordSalt", encryptedPassword.salt)
        userNode.setProperty("email", user.email)
        Right(userNode)
    }
  }
  
  protected def getUser(uuid: UUID): Response[User] = {
    withTx{
      implicit neo =>
        for{
          userNode <- getUserNode(uuid).right
          user <- toCaseClass[User](userNode).right
        }yield user
    }
  }

  protected def getUserNode(email: String): Response[Node] = {
    withTx {
      implicit neo =>
        val nodeIter = findNodesByLabelAndProperty(MainLabel.USER, "email", email)
        if (nodeIter.toList.isEmpty) {
          fail(INVALID_PARAMETER, "No users found with given email " + email)
        } else if (nodeIter.toList.size > 1) {
          fail(INTERNAL_SERVER_ERROR, "Ḿore than one user found with given email " + email)
        } else
          Right(nodeIter.toList(0))
    }
  }

  protected def getUserNode(uuid: UUID): Response[Node] = {
    withTx {
      implicit neo =>
        val nodeIter = findNodesByLabelAndProperty(MainLabel.USER, "uuid", UUIDUtils.getTrimmedBase64UUID(uuid))
        if (nodeIter.toList.isEmpty)
          fail(INVALID_PARAMETER, "No users found with given UUID " + uuid.toString)
        else if (nodeIter.toList.size > 1)
          fail(INTERNAL_SERVER_ERROR, "Ḿore than one user found with given UUID " + uuid.toString)
        else
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
          .relationships(DynamicRelationshipType.withName(UserRelationship.FOR_USER.name), 
                         Direction.OUTGOING)
          .breadthFirst()
          .evaluator(Evaluators.excludeStartPosition())
          .evaluator(LabelEvaluator(MainLabel.USER))
          
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

  protected def getUserNode(token: Token): Response[Node] = {
    withTx {
      implicit neo =>
        for {
          tokenNode <- getTokenNode(token).right
          userNode <- getUserNode(tokenNode).right
        }yield userNode
    }
  }
}