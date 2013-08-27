package org.extendedmind.bl

import org.extendedmind.domain._
import org.extendedmind.db._
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.search.ElasticSearchIndex
import org.extendedmind.search.SearchIndex
import org.extendedmind.domain.Item
import java.util.UUID
import org.extendedmind._
import org.extendedmind.Response._
import spray.util.LoggingContext

trait NoteActions{

  def db: GraphDatabase;
  def si: SearchIndex;
  
  def putNewNote(userUUID: UUID, note: Note)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putNewNote: user " + userUUID)
    db.putNewNote(userUUID, note)
  }
  
  def putExistingNote(userUUID: UUID, noteUUID: UUID, note: Note)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putExistingNote: user " + userUUID + ", note " + noteUUID)
    db.putExistingNote(userUUID, noteUUID, note)
  }
    
  def getNote(userUUID: UUID, noteUUID: UUID)(implicit log: LoggingContext): Response[Note] = {
    log.info("getNote: user " + userUUID + ", note " + noteUUID)
    db.getNote(userUUID, noteUUID)
  }
}

class NoteActionsImpl(implicit val settings: Settings, implicit val inj: Injector) 
		extends NoteActions with Injectable{
  def db = inject[GraphDatabase]
  def si = inject[SearchIndex]
}
