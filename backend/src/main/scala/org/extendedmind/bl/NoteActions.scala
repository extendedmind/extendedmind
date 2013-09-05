package org.extendedmind.bl

import org.extendedmind.domain._
import org.extendedmind.db._
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.domain.Item
import java.util.UUID
import org.extendedmind._
import org.extendedmind.Response._
import spray.util.LoggingContext

trait NoteActions {

  def db: GraphDatabase;

  def putNewNote(userUUID: UUID, note: Note)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putNewNote: user {}", userUUID)
    db.putNewNote(userUUID, note)
  }

  def putExistingNote(userUUID: UUID, noteUUID: UUID, note: Note)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putExistingNote: user {}, note {}", userUUID, noteUUID)
    db.putExistingNote(userUUID, noteUUID, note)
  }

  def getNote(userUUID: UUID, noteUUID: UUID)(implicit log: LoggingContext): Response[Note] = {
    log.info("getNote: user {}, note {}", userUUID, noteUUID)
    db.getNote(userUUID, noteUUID)
  }
}

class NoteActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends NoteActions with Injectable {
  def db = inject[GraphDatabase]
}
