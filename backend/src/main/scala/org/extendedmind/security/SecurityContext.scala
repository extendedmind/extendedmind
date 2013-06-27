package org.extendedmind.security

import java.util.UUID

case class SecurityContext(userUUID: String, email: String, userType: Byte, token: Option[String], owns: Option[Map[String,Boolean]])

object SecurityContextWrapper{
  def apply(userUUID: UUID, email: String, userType: Byte, token: Option[String], owns: Option[Map[String,Boolean]]) = 
    new SecurityContext(userUUID.toString(), email, userType, token, owns)
}