package org.extendedmind.db

import java.util.UUID
import scala.collection.JavaConverters._
import scala.collection.JavaConversions._
import org.apache.commons.codec.binary.Base64
import org.extendedmind.domain.User
import org.extendedmind.domain.UserWrapper
import org.extendedmind.security.Password
import org.extendedmind.security.PasswordService
import org.extendedmind.security.SecurityContext
import org.extendedmind.security.UUIDUtils
import org.neo4j.graphdb.Node
import org.neo4j.scala.Neo4jWrapper
import org.extendedmind.security.Token
import org.extendedmind.Settings
import org.neo4j.graphdb.GraphDatabaseService
import org.neo4j.kernel.extension.KernelExtensionFactory
import org.neo4j.extension.uuid.UUIDKernelExtensionFactory
import org.neo4j.extension.timestamp.TimestampKernelExtensionFactory
import org.neo4j.server.configuration.ServerConfigurator
import org.neo4j.server.configuration.Configurator
import org.neo4j.server.WrappingNeoServerBootstrapper
import org.neo4j.kernel.GraphDatabaseAPI
import org.extendedmind.security.AuthenticatePayload
import org.extendedmind.security.Token
import org.neo4j.graphdb.Traverser
import org.neo4j.graphdb.TraversalPosition
import org.neo4j.graphdb.ReturnableEvaluator
import org.neo4j.graphdb.DynamicRelationshipType
import org.neo4j.graphdb.Direction
import org.extendedmind.security.TokenExpiredException

trait GraphDatabase extends Neo4jWrapper {

  // Token is valid for twelve hours
  val TOKEN_DURATION: Long = 12 * 60 * 60 * 1000
  // If rememberMe is set, the token can be replaced for 7 days
  val TOKEN_REPLACEABLE: Long = 7 * 24 * 60 * 60 * 1000

  def settings: Settings
  implicit val implSettings = settings

  // INITIALIZATION

  def kernelExtensions(): java.util.ArrayList[KernelExtensionFactory[_]] = {
    val extensions = new java.util.ArrayList[KernelExtensionFactory[_]](2);
    extensions.add(new UUIDKernelExtensionFactory());
    extensions.add(new TimestampKernelExtensionFactory());
    extensions
  }

  def startServer() {
    if (settings.startNeo4jServer) {
      val config: ServerConfigurator = new ServerConfigurator(ds.gds.asInstanceOf[GraphDatabaseAPI]);
      config.configuration().setProperty(
        Configurator.WEBSERVER_PORT_PROPERTY_KEY, settings.neo4jServerPort);
      val srv: WrappingNeoServerBootstrapper =
        new WrappingNeoServerBootstrapper(ds.gds.asInstanceOf[GraphDatabaseAPI], config);
      srv.start();
    }
  }

  // USER METHODS

  def getUser(email: String): Either[List[String], User] = {
    val userNode = getUserNode(email)
    getUser(userNode)
  }

  def getUser(uuid: UUID): Either[List[String], User] = {
    val userNode = getUserNode(uuid)
    getUser(userNode)
  }

  private def getUser(userNode: Either[List[String], Node]): Either[List[String], User] = {
    if (userNode.isLeft)
      Left(userNode.left.get)
    else
      Right(getUser(userNode.right.get))
  }

  private def getUser(userNode: Node): User = {
    UserWrapper(userNode.getProperty("uuid").asInstanceOf[String],
      userNode.getProperty("email").asInstanceOf[String])
  }

  private def getUserNode(email: String): Either[List[String], Node] = {
    withTx {
      implicit neo =>
        val nodeIter = findNodesByLabelAndProperty(MainLabel.USER, "email", email)
        if (nodeIter.toList.isEmpty) {
          Left(List("No users found with given email " + email))
        } else if (nodeIter.toList.size > 1) {
          Left(List("Ḿore than one user found with given email " + email))
        } else
          Right(nodeIter.toList(0))
    }
  }

  private def getUserNode(uuid: UUID): Either[List[String], Node] = {
    withTx {
      implicit neo =>
        val nodeIter = findNodesByLabelAndProperty(MainLabel.USER, "uuid", uuid.toString())
        if (nodeIter.toList.isEmpty)
          Left(List("No users found with given UUID " + uuid.toString))
        else if (nodeIter.toList.size > 1)
          Left(List("Ḿore than one user found with given UUID " + uuid.toString))
        else
          Right(nodeIter.toList(0))
    }
  }

  private def getTokenNode(token: Token): Either[List[String], Node] = {
    withTx {
      implicit neo =>
        val nodeIter = findNodesByLabelAndProperty(MainLabel.TOKEN, "accessKey", token.accessKey: java.lang.Long)
        if (nodeIter.toList.isEmpty)
          Left(List("No tokens found with given token"))
        else if (nodeIter.toList.size > 1)
          Left(List("Ḿore than one token found with given token"))
        else {
          Right(nodeIter.toList(0))
        }
    }
  }

  private def getUserNode(tokenNode: Node): Either[List[String], Node] = {
    withTx {
      implicit neo =>
        // Check that token is still valid
        val expires = tokenNode.getProperty("expires").asInstanceOf[Long]
        if (System.currentTimeMillis() > expires) {
          throw new TokenExpiredException("Token has expired")
        }

        val traverser =
          tokenNode.traverse(
            Traverser.Order.BREADTH_FIRST,
            (tp: TraversalPosition) => false,
            ReturnableEvaluator.ALL_BUT_START_NODE,
            DynamicRelationshipType.withName(UserRelationship.FOR_USER.name),
            Direction.OUTGOING)
        val userNodeList = traverser.getAllNodes()
        if (userNodeList.size() == 0) {
          Left(List("Token attached to no users"))
        } else if (userNodeList.size() > 1) {
          Left(List("Token attached more than one user"))
        } else {
          Right(userNodeList.head)
        }
    }
  }

  private def getUserNode(token: Token): Either[List[String], Node] = {
    withTx {
      implicit neo =>
        val tokenNode = getTokenNode(token)
        if (tokenNode.isRight) {
          return getUserNode(tokenNode.right.get)
        } else {
          Left(List("Error getting token node"))
        }
    }
  }

  // SECURITY

  def generateToken(email: String, attemptedPassword: String, payload: Option[AuthenticatePayload]): Either[List[String], SecurityContext] = {
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

  private def validateTokenReplacable(tokenNode: Node, currentTime: Long): Either[List[String], Node] = {
    if (tokenNode.hasProperty("replaceable")) {
      val replaceable = tokenNode.getProperty("replaceable").asInstanceOf[Long];
      if (currentTime < replaceable) {
        Right(tokenNode)
      } else Left(List("Token no longer replaceable"))
    } else Left(List("Token not replaceable"))
  }

  private def createNewAccessKey(tokenNode: Node, sc: SecurityContext, payload: Option[AuthenticatePayload]): SecurityContext = {
    // Make new token and set properties to the token node
    val token = Token(sc.userUUID)
    withTx {
      implicit neo =>
        setTokenProperties(tokenNode, token, payload)
    }
    SecurityContext(
      sc.userUUID,
      sc.email,
      sc.userType,
      Some(Token.encryptToken(token)),
      None)
  }

  def swapToken(oldToken: String, payload: Option[AuthenticatePayload]): Either[List[String], SecurityContext] = {
    val currentTime = System.currentTimeMillis()
    for {
      token <- Token.decryptToken(oldToken).right
      tokenNode <- getTokenNode(token).right
      tokenNode <- validateTokenReplacable(tokenNode, currentTime).right
      userNode <- getUserNode(tokenNode).right
      sc <- getSecurityContext(userNode).right
      sc <- Right(createNewAccessKey(tokenNode, sc, payload)).right
    } yield sc
  }

  def authenticate(email: String, attemptedPassword: String): Either[List[String], SecurityContext] = {
    for {
      user <- getUserNode(email).right
      sc <- validatePassword(user, attemptedPassword).right
    } yield sc
  }

  def authenticate(token: String): Either[List[String], SecurityContext] = {
    for {
      token <- Token.decryptToken(token).right
      user <- getUserNode(token).right
      sc <- getSecurityContext(user).right
    } yield sc
  }

  protected def saveToken(userNode: Node, token: Token, payload: Option[AuthenticatePayload]) {
    withTx {
      implicit neo =>
        val tokenNode = createNode(MainLabel.TOKEN)
        setTokenProperties(tokenNode, token, payload);
        tokenNode --> UserRelationship.FOR_USER --> userNode
        Some(true)
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

  private def validatePassword(user: Node, attemptedPassword: String): Either[List[String], SecurityContext] = {
    // Check password
    if (PasswordService.authenticate(attemptedPassword, getStoredPassword(user))) {
      for {
        sc <- getSecurityContext(user).right
      } yield sc
    } else {
      Left(List("Invalid password"))
    }
  }

  private def getSecurityContext(user: Node): Either[List[String], SecurityContext] = {
    if (user.getLabels().asScala.find(p => p.name() == "ADMIN").isDefined)
      Right(getSecurityContext(user, UserWrapper.ADMIN))
    else
      Right(getSecurityContext(user, UserWrapper.NORMAL))
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