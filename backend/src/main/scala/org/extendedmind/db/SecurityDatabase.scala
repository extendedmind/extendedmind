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
          sc <- authenticate(email: String, attemptedPassword: String).right
          token <- Right(Token(sc.userUUID)).right
          saved <- Right(saveToken(sc.user, token, payload)).right
          sc <- Right(SecurityContext(
                      sc.userUUID,
                      sc.email,
                      sc.userType,
                      Some(Token.encryptToken(token)),
                      None)).right
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

  def authenticate(token: String): Response[SecurityContext] = {
    withTx{
      implicit neo4j => 
        for {
          token <- Token.decryptToken(token).right
          user <- getUserNode(token).right
          sc <- Right(getSecurityContext(user)).right
        } yield sc
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
      sc.email,
      sc.userType,
      Some(Token.encryptToken(token)),
      None)
  }

  protected def saveToken(userNode: Node, token: Token, payload: Option[AuthenticatePayload]) {
    withTx {
      implicit neo =>
        val tokenNode = createNode(MainLabel.TOKEN)
        setTokenProperties(tokenNode, token, payload);
        tokenNode --> SecurityRelationship.IDS --> userNode
    }
  }

  private def setTokenProperties(tokenNode: Node, token: Token, payload: Option[AuthenticatePayload]) {
    val currentTime = System.currentTimeMillis()
    tokenNode.setProperty("accessKey", token.accessKey)
    tokenNode.setProperty("expires", currentTime + TOKEN_DURATION)
    if (payload.isDefined && payload.get.rememberMe) {
      // Remember me has been clicked
      tokenNode.setProperty("replaceable", currentTime + TOKEN_REPLACEABLE)
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
    // Check password
    if (PasswordService.authenticate(attemptedPassword, getStoredPassword(user))) {
      Right(getSecurityContext(user))
    } else {
      fail(INVALID_PARAMETER, "Invalid password")
    }
  }

  private def getSecurityContext(user: Node): SecurityContext = {
    if (user.getLabels().asScala.find(p => p.name() == "ADMIN").isDefined)
      getSecurityContext(user, Token.ADMIN)
    else
      getSecurityContext(user, Token.NORMAL)
  }

  private def getSecurityContext(user: Node, userType: Byte): SecurityContext = {
    val sc: SecurityContext = SecurityContext(
      UUIDUtils.getUUID(user.getProperty("uuid").asInstanceOf[String]),
      user.getProperty("email").asInstanceOf[String],
      userType,
      None,
      None) // TODO: Owning entities, aggregates with True value = rw, False = r
    sc.user = user
    sc
  }
}