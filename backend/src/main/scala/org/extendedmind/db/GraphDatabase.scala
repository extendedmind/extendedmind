package org.extendedmind.db

import java.util.UUID
import scala.collection.JavaConverters._
import scala.collection.JavaConversions._
import org.apache.commons.codec.binary.Base64
import org.extendedmind._
import org.extendedmind.Response._
import org.extendedmind.domain._
import org.extendedmind.security._
import org.neo4j.graphdb.Node
import org.neo4j.scala.Neo4jWrapper
import org.neo4j.graphdb.GraphDatabaseService
import org.neo4j.kernel.extension.KernelExtensionFactory
import org.neo4j.extension.uuid.UUIDKernelExtensionFactory
import org.neo4j.extension.timestamp.TimestampKernelExtensionFactory
import org.neo4j.server.configuration.ServerConfigurator
import org.neo4j.server.configuration.Configurator
import org.neo4j.server.WrappingNeoServerBootstrapper
import org.neo4j.kernel.GraphDatabaseAPI
import org.neo4j.graphdb._

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

  def getUser(email: String): Response[User] = {
    withTx{
      implicit neo =>
        for{
          userNode <- getUserNode(email).right
          user <- Right(getUser(userNode)).right
        }yield user
    }
  }

  def getUser(uuid: UUID): Response[User] = {
    withTx{
      implicit neo =>
        for{
          userNode <- getUserNode(uuid).right
          user <- Right(getUser(userNode)).right
        }yield user
    }
  }

  private def getUser(userNode: Node): User = {
    UserWrapper(userNode.getProperty("uuid").asInstanceOf[String],
      userNode.getProperty("email").asInstanceOf[String])
  }

  private def getUserNode(email: String): Response[Node] = {
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

  private def getUserNode(uuid: UUID): Response[Node] = {
    withTx {
      implicit neo =>
        val nodeIter = findNodesByLabelAndProperty(MainLabel.USER, "uuid", uuid.toString())
        if (nodeIter.toList.isEmpty)
          fail(INVALID_PARAMETER, "No users found with given UUID " + uuid.toString)
        else if (nodeIter.toList.size > 1)
          fail(INTERNAL_SERVER_ERROR, "Ḿore than one user found with given UUID " + uuid.toString)
        else
          Right(nodeIter.toList(0))
    }
  }

  private def getTokenNode(token: Token): Response[Node] = {
    withTx {
      implicit neo =>
        val nodeIter = findNodesByLabelAndProperty(MainLabel.TOKEN, "accessKey", token.accessKey: java.lang.Long)
        if (nodeIter.toList.isEmpty)
          fail(INVALID_PARAMETER, "No tokens found with given token")
        else if (nodeIter.toList.size > 1)
          fail(INTERNAL_SERVER_ERROR, "Ḿore than one token found with given token")
        else {
          Right(nodeIter.toList(0))
        }
    }
  }

  private def getUserNode(tokenNode: Node): Response[Node] = {
    withTx {
      implicit neo =>
        // Check that token is still valid
        val expires = tokenNode.getProperty("expires").asInstanceOf[Long]
        if (System.currentTimeMillis() > expires) {
          fail(TOKEN_EXPIRED, "Token has expired")
        }else{
          val traverser =
            tokenNode.traverse(
              Traverser.Order.BREADTH_FIRST,
              (tp: TraversalPosition) => false,
              ReturnableEvaluator.ALL_BUT_START_NODE,
              DynamicRelationshipType.withName(UserRelationship.FOR_USER.name),
              Direction.OUTGOING)
          val userNodeList = traverser.getAllNodes()
          if (userNodeList.size() == 0) {
            fail(INTERNAL_SERVER_ERROR, "Token attached to no users")
          } else if (userNodeList.size() > 1) {
            fail(INTERNAL_SERVER_ERROR, "Token attached more than one user")
          } else {
            Right(userNodeList.head)
          }
        }
    }
  }

  private def getUserNode(token: Token): Response[Node] = {
    withTx {
      implicit neo =>
        for {
          tokenNode <- getTokenNode(token).right
          userNode <- getUserNode(tokenNode).right
        }yield userNode
    }
  }

  // SECURITY

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

  private def validateTokenReplacable(tokenNode: Node, currentTime: Long): Response[Node] = {
    if (tokenNode.hasProperty("replaceable")) {
      val replaceable = tokenNode.getProperty("replaceable").asInstanceOf[Long];
      if (currentTime < replaceable) {
        Right(tokenNode)
      } else fail(TOKEN_EXPIRED, "Token no longer replaceable")
    } else fail(INVALID_PARAMETER, "Token not replaceable")
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
      getSecurityContext(user, UserWrapper.ADMIN)
    else
      getSecurityContext(user, UserWrapper.NORMAL)
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