package org.extendedmind.security

import java.util.UUID
import org.neo4j.graphdb.Node

case class SecurityContext(userUUID: UUID, email: String, userType: Byte, token: Option[String], 
                           owns: Option[Map[String,Boolean]]){
  @transient var user: Node = null
}
