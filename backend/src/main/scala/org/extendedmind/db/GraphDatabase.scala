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

trait GraphDatabase extends Neo4jWrapper {

  def putUser(user: User): User = {
    user
  }
  
  def getUsers(): List[User] = {
    List()
  }

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
    val user = getUserNode(email)
    if (user.isRight)
      validatePassword(user.right.get, attemptedPassword)
    else
      None
  }
  
  private def getStoredPassword(user: Node): Password = {
    Password(
      user.getProperty("passwordAlgorithm").asInstanceOf[String],
      user.getProperty("passwordIterations").asInstanceOf[Int],
      Base64.decodeBase64(user.getProperty("passwordHash").asInstanceOf[String]),
      user.getProperty("passwordSalt").asInstanceOf[Array[Byte]])
  }
  
  private def validatePassword(user: Node, attemptedPassword: String): Option[SecurityContext] = {
    // Check password
    if (PasswordService.authenticate(attemptedPassword, getStoredPassword(user)))
      Some(getSecurityContext(user))
    else
      None
  }
  
  private def getSecurityContext(user: Node): SecurityContext = {
    if (user.getLabels().asScala.find(p => p.name() == "ADMIN").isDefined)
      getSecurityContext(user, UserWrapper.ADMIN)
    else
      getSecurityContext(user, UserWrapper.NORMAL)
  }
  
  private def getSecurityContext(user: Node, userType: Byte): SecurityContext = {
    SecurityContext(
        UUIDUtils.getUUID(user.getProperty("uuid").asInstanceOf[String]), 
        user.getProperty("email").asInstanceOf[String], 
        userType, 
        None) // TODO: Owning entities, aggregates with True value = rw, False = r
  }
}