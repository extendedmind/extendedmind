package org.extendedmind.db

import java.util.UUID
import scala.collection.JavaConverters.iterableAsScalaIterableConverter
import org.apache.commons.codec.binary.Base64
import org.extendedmind.domain.User
import org.extendedmind.domain.UserWrapper
import org.extendedmind.security.Password
import org.extendedmind.security.PasswordService
import org.extendedmind.security.SecurityContext
import org.extendedmind.security.UUIDUtils
import org.neo4j.graphdb.Node
import org.neo4j.scala.Neo4jWrapper
import org.extendedmind.security.SecurityContextWrapper
import org.extendedmind.security.Token
import org.extendedmind.Settings
import org.neo4j.graphdb.GraphDatabaseService
import org.neo4j.kernel.extension.KernelExtensionFactory
import org.neo4j.extension.uuid.UUIDKernelExtensionFactory

trait GraphDatabase extends Neo4jWrapper {

  def settings: Settings
  implicit val implSettings = settings

  // INITIALIZATION
  
  def kernelExtensions(): java.util.ArrayList[KernelExtensionFactory[_]] = {
    val extensions = new java.util.ArrayList[KernelExtensionFactory[_]](1); 
    extensions.add(new UUIDKernelExtensionFactory());
    extensions
  }
  
  def startServer(graphdb: GraphDatabaseService){
    
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
    withTx{
      implicit neo =>
    		val nodeIter = findNodesByLabelAndProperty(MainLabel.USER, "email", email)
    		if (nodeIter.toList.isEmpty){
    		  Left(List("No users found with given email " + email))
    		}else if (nodeIter.toList.size > 1){
    		  Left(List("Ḿore than one user found with given email " + email))    		  
    		}else
    		  Right(nodeIter.toList(0))
    }
  }
  
  private def getUserNode(uuid: UUID): Either[List[String], Node] = {
    withTx{
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
  
  // SECURITY
  
  def authenticate(token: String): Option[SecurityContext] = {
    return None
  }
  
  def authenticate(email: String, attemptedPassword: String): Option[SecurityContext] = {
    println("authenticate called")
    val user = getUserNode(email)
    if (user.isRight){
      println("Found user")
      validatePassword(user.right.get, attemptedPassword)
    }else{
      println(user.left.get)
      None
    }
  }
  
  private def getStoredPassword(user: Node): Password = {
    Password(
      user.getProperty("passwordAlgorithm").asInstanceOf[String],
      user.getProperty("passwordIterations").asInstanceOf[Int],
      Base64.decodeBase64(user.getProperty("passwordHash").asInstanceOf[String]),
      user.getProperty("passwordSalt").asInstanceOf[Array[Byte]])
  }
  
  private def validatePassword(user: Node, attemptedPassword: String): Option[SecurityContext] = {
    println("validatePassword called")
    // Check password
    if (PasswordService.authenticate(attemptedPassword, getStoredPassword(user))){
      // Generate Token
      val token = Token(UUIDUtils.getUUID(user.getProperty("uuid").asInstanceOf[String]))
      println("validatePassword returning token")
      Some(getSecurityContext(user, token))
    }else{
      println("validatePassword returning None")
      None
    }
  }
  
  private def getSecurityContext(user: Node, token: Token): SecurityContext = {
    if (user.getLabels().asScala.find(p => p.name() == "ADMIN").isDefined)
      getSecurityContext(user, token, UserWrapper.ADMIN)
    else
      getSecurityContext(user, token, UserWrapper.NORMAL)
  }
  
  private def getSecurityContext(user: Node, token: Token, userType: Byte): SecurityContext = {
    SecurityContextWrapper(
        UUIDUtils.getUUID(user.getProperty("uuid").asInstanceOf[String]), 
        user.getProperty("email").asInstanceOf[String], 
        userType, 
        Some(Token.encryptToken(token)),
        None) // TODO: Owning entities, aggregates with True value = rw, False = r
  }
}