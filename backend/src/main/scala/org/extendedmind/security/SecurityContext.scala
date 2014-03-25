package org.extendedmind.security

import java.util.UUID
import org.neo4j.graphdb.Node

case class SecurityContext(userUUID: UUID, 
						   userType: Byte,
						   cohort: Option[Int],
						   token: Option[String],
						   authenticated: Option[Long],
						   expires: Option[Long],
						   replaceable: Option[Long],
                           collectives: Option[Map[UUID,(String, Byte, Boolean)]]){
  // Tweak that helps skip one database call when creating a token
  @transient var user: Node = null
}

object SecurityContext{
  val FOUNDER: Byte = 0
  val READ: Byte = 1
  val READ_WRITE: Byte = 2
}
