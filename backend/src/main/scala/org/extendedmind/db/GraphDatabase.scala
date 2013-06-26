package org.extendedmind.db

import org.neo4j.scala.Neo4jWrapper
import org.extendedmind.domain.User
import scala.collection.immutable.BitSet
import java.util.UUID
import org.neo4j.graphdb.Node
import scala.collection.JavaConverters._

trait GraphDatabase extends Neo4jWrapper{
  
  def getUsers(): List[User] = {
    List()
  }

  def setUUID(node: Node) = {
    if (node.getPropertyKeys().asScala.find(p => p != "uuid")){
      
    }
    
    val uuidString = node.getProperty("uuid").asInstanceOf[String]
	  
	  val uuid = UUID.randomUUID()
	  timo.addLabel(MainLabel.USER)
	  timo.setProperty("uuid", uuid.toString().replace("-", ""))
	  uuid
  }
  
  def getUser(email: String): Either[List[String], User] = {
    withTx{
      implicit neo =>
    		val nodeIter = findNodesByLabelAndProperty(MainLabel.USER, "email", email)
    		if (nodeIter.isEmpty){
    		  Left("No users found with given email " + email)
    		}else if (nodeIter.toList.size > 1){
    		  Left("Ḿore than one user found with given email " + email)    		  
    		}
    		val userNode = nodeIter.head
    		Right(User(Some(UUID.fromString(userNode.getProperty("uuid").asInstanceOf[String])), 
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
    		Right(User(Some(UUID.fromString(userNode.getProperty("uuid").asInstanceOf[String])), 
    		    			 userNode.getProperty("email").asInstanceOf[String]))
    }
  }
  
  /*  
  def authenticate(token: String): SecurityContext = {
    
    return SecurityContext(1,"",0, BitSet(1,2,3))
  }
  
  def authenticate(username: String, password: String): Token = {
    return BitSet(1,2,3)
  }*/
}