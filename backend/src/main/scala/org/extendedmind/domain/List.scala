package org.extendedmind.domain

import java.util.UUID
import org.extendedmind.SetResult
import Validators._

case class List(
      uuid: Option[UUID], modified: Option[Long], deleted: Option[Long],
      title: String, 
      description: Option[String], 
      link: Option[String],
      completable: Option[Boolean],
      completed: Option[Long],
      visibility: Option[SharedItemVisibility],
      parent: Option[UUID])
      extends ShareableItem{
  require(validateTitle(title), "Title can not be more than " + TITLE_MAX_LENGTH + " characters")
  if (description.isDefined) require(validateDescription(description.get), 
      "Description can not be more than " + DESCRIPTION_MAX_LENGTH + " characters")
}

object List{
  def apply(title: String, description: Option[String],
		  	link: Option[String],
		  	completable: Option[Boolean],
            visibility: Option[SharedItemVisibility],
            parent: Option[UUID]) 
        = new List(None, None, None, title, description, 
                   link, completable, None, visibility, parent)
}

case class CompleteListResult(completed: Long, history: Tag, result: SetResult)