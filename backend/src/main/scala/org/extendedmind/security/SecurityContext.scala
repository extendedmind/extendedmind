package org.extendedmind.security

import java.util.UUID

case class SecurityContext(userUUID: UUID, email: String, userType: Byte, owner: Map[String,Boolean])
