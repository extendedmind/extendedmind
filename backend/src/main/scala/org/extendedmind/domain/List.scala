package org.extendedmind.domain

import java.util.UUID
import org.extendedmind.SetResult
import Validators._

case class List(
      uuid: Option[UUID], modified: Option[Long], deleted: Option[Long], archived: Option[Long],
      title: String, 
      description: Option[String], 
      link: Option[String],
      completable: Option[Boolean],
      due: Option[String],
      assignee: Option[UUID],
      assigner: Option[UUID],
      visibility: Option[SharedItemVisibility],
      relationships: Option[ExtendedItemRelationships])
      extends ExtendedItem{
  require(validateTitle(title), "Title can not be more than " + TITLE_MAX_LENGTH + " characters")
  if (description.isDefined) require(validateDescription(description.get), 
      "Description can not be more than " + DESCRIPTION_MAX_LENGTH + " characters")
  if (due.isDefined) require(validateDateString(due.get), "Due date does not match pattern yyyy-MM-dd")
}

object List{
  def apply(title: String, description: Option[String],
		  	link: Option[String],
		  	completable: Option[Boolean],
		  	due: Option[String],
            relationships: Option[ExtendedItemRelationships]) 
        = new List(None, None, None, None,  title, description, 
                   link, completable, due, None, None, None, relationships)
}

case class ArchiveListResult(archived: Long, children: Option[scala.List[SetResult]], history: Tag, result: SetResult)