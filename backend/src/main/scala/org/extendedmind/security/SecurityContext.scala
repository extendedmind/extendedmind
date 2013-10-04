package org.extendedmind.security

import java.util.UUID
import org.neo4j.graphdb.Node

case class SecurityContext(userUUID: UUID, email: String, userType: Byte, token: Option[String], 
                           collectives: Option[Map[UUID,(String, Byte)]]){
  // Tweak that helps skip one database call when creating a token
  @transient var user: Node = null
}

object SecurityContext{
  val CREATOR: Byte = 0
  val READ: Byte = 1
  val READ_WRITE: Byte = 2
}
