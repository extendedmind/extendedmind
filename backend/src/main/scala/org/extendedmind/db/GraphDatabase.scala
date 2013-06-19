package org.extendedmind.db

import org.neo4j.scala.Neo4jWrapper
import org.extendedmind.domain.User

trait GraphDatabase extends Neo4jWrapper{
  
  def getUsers(): List[User] = {
    List()
  }

  def addUser(user: User): User = {
    User("test")
  }
}