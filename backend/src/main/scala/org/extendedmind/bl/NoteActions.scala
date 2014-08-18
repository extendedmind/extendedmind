/**
 * Copyright (c) 2013-2014 Extended Mind Technologies Oy
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

package org.extendedmind.bl

import org.extendedmind.domain._
import org.extendedmind.db._
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.domain.Item
import java.util.UUID
import org.extendedmind._
import org.extendedmind.Response._
import akka.event.LoggingAdapter

trait NoteActions {

  def db: GraphDatabase;

  def putNewNote(owner: Owner, note: Note)(implicit log: LoggingAdapter): Response[SetResult] = {
    db.putNewNote(owner, note)
  }

  def putExistingNote(owner: Owner, noteUUID: UUID, note: Note)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("putExistingNote")
    db.putExistingNote(owner, noteUUID, note)
  }

  def getNote(owner: Owner, noteUUID: UUID)(implicit log: LoggingAdapter): Response[Note] = {
    log.info("getNote")
    db.getNote(owner, noteUUID)
  }
  
  def deleteNote(owner: Owner, noteUUID: UUID)(implicit log: LoggingAdapter): Response[DeleteItemResult] = {
    log.info("deleteNote")
    db.deleteNote(owner, noteUUID)
  }
  
  def undeleteNote(owner: Owner, noteUUID: UUID)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("undeleteNote")
    db.undeleteItem(owner, noteUUID, Some(ItemLabel.NOTE))
  }
  
  def favoriteNote(owner: Owner, noteUUID: UUID)(implicit log: LoggingAdapter): Response[FavoriteNoteResult] = {
    log.info("favoriteNote")
    db.favoriteNote(owner, noteUUID)
  }
  
  def unfavoriteNote(owner: Owner, noteUUID: UUID)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("unfavoriteNote")
    db.unfavoriteNote(owner, noteUUID)
  }
  
  
  def noteToTask(owner: Owner, noteUUID: UUID, note: Note)(implicit log: LoggingAdapter): Response[Task] = {
    log.info("noteToTask")
    db.noteToTask(owner, noteUUID, note)
  }
  
  def noteToList(owner: Owner, noteUUID: UUID, note: Note)(implicit log: LoggingAdapter): Response[List] = {
    log.info("noteToList")
    db.noteToList(owner, noteUUID, note)
  }
}

class NoteActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends NoteActions with Injectable {
  def db = inject[GraphDatabase]
}
