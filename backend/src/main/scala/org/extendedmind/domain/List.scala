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
      archived: Option[Long],
      visibility: Option[SharedItemVisibility],
      relationships: Option[ExtendedItemRelationships])
      extends ExtendedItem{
  require(validateTitle(title), "Title can not be more than " + TITLE_MAX_LENGTH + " characters")
  if (description.isDefined) require(validateDescription(description.get), 
      "Description can not be more than " + DESCRIPTION_MAX_LENGTH + " characters")
}

object List{
  def apply(title: String, description: Option[String],
		  	link: Option[String],
		  	completable: Option[Boolean],
            visibility: Option[SharedItemVisibility],
            relationships: Option[ExtendedItemRelationships]) 
        = new List(None, None, None, title, description, 
                   link, completable, None, visibility, relationships)
}

case class CompleteListResult(completed: Long, history: Tag, result: SetResult)