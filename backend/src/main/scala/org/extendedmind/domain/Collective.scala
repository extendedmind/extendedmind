package org.extendedmind.domain

import java.util.UUID
import Validators._

case class Collective(uuid: Option[UUID], modified: Option[Long], deleted: Option[Long],  
                title: String, description: Option[String], creator: Option[UUID], common: Option[Boolean])
           extends Container {
  require(validateTitle(title), "Title can not be more than " + TITLE_MAX_LENGTH + " characters")
  if (description.isDefined) require(validateDescription(description.get), 
      "Description can not be more than " + DESCRIPTION_MAX_LENGTH + " characters")
}

object Collective{
  def apply(title: String, description: Option[String]) 
        = new Collective(None, None, None, title, description, None, None)
}