package org.extendedmind.domain

import java.util.UUID
import Validators._

case class Collective(uuid: Option[UUID], modified: Option[Long], deleted: Option[Long],  
                title: String, description: Option[String], creator: UUID)
           extends Container {
  require(validateLength(title, 64), "Title can not be more than 64 characters")
  if (description.isDefined) require(validateLength(description.get, 256), "Description can not be more than 256 characters")
}
