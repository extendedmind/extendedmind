package org.extendedmind.security

import java.util.UUID

case class SecurityContext(userUUID: UUID, email: String, userType: Byte, owns: Option[Map[String,Boolean]])
