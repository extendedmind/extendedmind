package org.extendedmind.domain

import java.util.UUID

case class User(uuid: Option[String], email: String)

object UserWrapper {
  def apply(uuid: UUID, email: String) = new User(Some(uuid.toString.replace("-", "")), email)    
  def apply(uuid: String, email: String) = new User(Some(uuid), email)
}