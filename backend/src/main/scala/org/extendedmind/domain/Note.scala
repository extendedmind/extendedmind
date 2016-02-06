/**
 * Copyright (c) 2013-2016 Extended Mind Technologies Oy
 *
 * This file is part of Extended Mind.
 *
 * Extended Mind is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

package org.extendedmind.domain

import java.util.UUID
import Validators._
import org.extendedmind.SetResult


// List of FormatTypes
object FormatType extends Enumeration {
  type FormatType = Value
  val MARKDOWN = Value("md")
  val MADOKO = Value("madoko")
  val BIBTEX = Value("bibtex")
}

case class Note(uuid: Option[UUID],
                id: Option[String], ui: Option[String],
                created: Option[Long], modified: Option[Long], deleted: Option[Long], archived: Option[Long],
                title: String, description: Option[String],
                link: Option[String],
                content: Option[String],
                format: Option[String],
                favorited: Option[Long],
                revision: Option[Long],
                visibility: Option[SharedItemVisibility],
                relationships: Option[ExtendedItemRelationships])
           extends ExtendedItem{
  if (id.isDefined) require(validateLength(id.get, 100), "id can not be more than 100 characters")
  if (ui.isDefined) require(validateLength(ui.get, 10000), "UI preferences max length is 10000")
  require(validateTitle(title), "Title can not be more than " + TITLE_MAX_LENGTH + " characters")
  if (description.isDefined) require(validateDescription(description.get),
      "Description can not be more than " + DESCRIPTION_MAX_LENGTH + " characters")
  if (link.isDefined) require(validateLength(link.get, 2000), "Link can not be more than 2000 characters")
  if (content.isDefined) require(validateLength(content.get, 1000000), "Content can not be more than 1000000 characters")
  if (format.isDefined) require(
      try {
        val formatType = FormatType.withName(format.get)
        true
      }catch {
        case _:Throwable => false
      },
      "Expected 'md', 'madoko' or 'bibtex' but got " + format.get)

}

object Note{
  def apply(title: String, description: Option[String],
            link: Option[String],
            content: Option[String],
            format: Option[String],
            favorited: Option[Long],
            relationships: Option[ExtendedItemRelationships])
        = new Note(None, None, None, None, None, None, None, title, description, link, content, format, favorited,
                   None, None, relationships)

  def apply(limitedNote: LimitedNote)
        = new Note(limitedNote.uuid, limitedNote.id, limitedNote.ui, limitedNote.created, limitedNote.modified,
                    limitedNote.deleted, None,
                    limitedNote.title, limitedNote.description, limitedNote.link, limitedNote.content, limitedNote.format,
                    None, None, None,
                    Some(ExtendedItemRelationships(
                        limitedNote.relationships.parent, limitedNote.relationships.origin,
                        None, None, None, None)))
}

case class LimitedNote(uuid: Option[UUID],
                id: Option[String], ui: Option[String],
                created: Option[Long], modified: Option[Long], deleted: Option[Long],
                title: String, description: Option[String],
                link: Option[String],
                content: Option[String],
                format: Option[String],
                relationships: LimitedExtendedItemRelationships)
                extends LimitedExtendedItem {
  if (id.isDefined) require(validateLength(id.get, 100), "Id can not be more than 100 characters")
  if (ui.isDefined) require(validateLength(ui.get, 10000), "UI preferences max length is 10000")
  require(validateTitle(title), "Title can not be more than " + TITLE_MAX_LENGTH + " characters")
  if (description.isDefined) require(validateDescription(description.get),
      "Description can not be more than " + DESCRIPTION_MAX_LENGTH + " characters")
  if (link.isDefined) require(validateLength(link.get, 2000), "Link can not be more than 2000 characters")
  if (content.isDefined) require(validateLength(content.get, 1000000), "Content can not be more than 1000000 characters")
  if (format.isDefined) require(
      try {
        val formatType = FormatType.withName(format.get)
        true
      }catch {
        case _:Throwable => false
      },
      "Expected 'md' but got " + format.get)
}

object LimitedNote{
  def apply(note: Note)
        = new LimitedNote(note.uuid, note.id, note.ui, note.created, note.modified, note.deleted,
                          note.title, note.description, note.link, note.content, note.format,
                          LimitedExtendedItemRelationships(note.relationships.get.parent,note.relationships.get.origin))
}

case class FavoriteNoteResult(favorited: Long, result: SetResult)

case class PublishPayload(format: String, path: String){
  require(
    try {
      val formatType = FormatType.withName(format)
      true
    }catch {
      case _:Throwable => false
    },
    "Expected 'md', 'madoko' or 'bibtex' but got " + format)
  require(validateLength(path, Validators.TITLE_MAX_LENGTH), "Path can not be more than " + Validators.TITLE_MAX_LENGTH + " characters")
  require(path.matches("""^[0-9a-z-]+$"""),
     "Path can only contain numbers, lower case letters and dashes")
}

case class PreviewPayload(format: String){
  require(
    try {
      val formatType = FormatType.withName(format)
      true
    }catch {
      case _:Throwable => false
    },
    "Expected 'md', 'madoko' or 'bibtex' but got " + format)
}

case class PublishNoteResult(published: Long, result: SetResult)

case class PreviewNoteResult(preview: Long, previewExpires: Long, result: SetResult)