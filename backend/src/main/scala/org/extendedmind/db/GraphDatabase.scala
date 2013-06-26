package org.extendedmind.db

import org.neo4j.scala.Neo4jWrapper
import org.extendedmind.domain.User
import scala.collection.immutable.BitSet
import java.util.UUID
import org.neo4j.graphdb.Node
import scala.collection.JavaConverters._
import org.extendedmind.domain.UserWrapper

trait GraphDatabase extends Neo4jWrapper{

  def putUser(user: User): User = {
    user
  }
  
  def getUsers(): List[User] = {
    List()
  }

  def getUser(email: String): Either[List[String], User] = {
    withTx{
      implicit neo =>
    		val nodeIter = findNodesByLabelAndProperty(MainLabel.USER, "email", email)
    		if (nodeIter.toList.isEmpty){
    		  Left("No users found with given email " + email)
    		}else if (nodeIter.toList.size > 1){
    		  Left("Ḿore than one user found with given email " + email)    		  
    		}
    		println(nodeIter.toList.size)
    		val userNode = nodeIter.toList(0)
    		Right(UserWrapper(userNode.getProperty("uuid").asInstanceOf[String], 
    		    			 userNode.getProperty("email").asInstanceOf[String]))
    }
  }
  
  def getUser(uuid: UUID): Either[List[String], User] = {
    withTx{
      implicit neo =>
    		val nodeIter = findNodesByLabelAndProperty(MainLabel.USER, "uuid", uuid.toString())
    		if (nodeIter.isEmpty){
    		  Left("No users found with given UUID " + uuid.toString)
    		}else if (nodeIter.toList.size > 1){
    		  Left("Ḿore than one user found with given UUID " + uuid.toString)    		  
    		}
    		val userNode = nodeIter.head
    		Right(UserWrapper(userNode.getProperty("uuid").asInstanceOf[String], 
    		    			 userNode.getProperty("email").asInstanceOf[String]))
    }
  }
  
  /*  
  def authenticate(token: String): SecurityContext = {
    
    return SecurityContext(1,"",0, BitSet(1,2,3))
  }
  
  def authenticate(username: String, password: String): Token = {
    return BitSet(1,2,3)2
  }*/
}