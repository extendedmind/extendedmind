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
}

class NoteActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends NoteActions with Injectable {
  def db = inject[GraphDatabase]
}
