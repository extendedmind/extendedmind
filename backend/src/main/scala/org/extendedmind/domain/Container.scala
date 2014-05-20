package org.extendedmind.domain

import java.util.UUID

trait Container {
  val uuid: Option[UUID]
  val created: Option[Long]
  val modified: Option[Long]
  val deleted: Option[Long]
}