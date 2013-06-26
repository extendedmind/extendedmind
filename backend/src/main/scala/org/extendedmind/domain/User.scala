package org.extendedmind.domain

import java.util.UUID

case class User(uuid: Option[UUID], email: String)