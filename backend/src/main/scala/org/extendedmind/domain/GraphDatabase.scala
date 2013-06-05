package org.extendedmind.domain

import org.neo4j.scala.Neo4jWrapper

trait GraphDatabase extends Neo4jWrapper{
  
  def getUsers(): List[User] = {
    List()
  }

  def addUser(user: User): User = {
    User("test")
  }
}