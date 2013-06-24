package org.extendedmind.db

import org.neo4j.scala.Neo4jWrapper
import org.extendedmind.domain.User
import scala.collection.immutable.BitSet

trait GraphDatabase extends Neo4jWrapper{
  
  
  def getUsers(): List[User] = {
    List()
  }

  def addUser(user: User): User = {
    User("test")
  }
  /*  
  def authenticate(token: String): SecurityContext = {
    
    return SecurityContext(1,"",0, BitSet(1,2,3))
  }
  
  def authenticate(username: String, password: String): Token = {
    return BitSet(1,2,3)
  }*/
}