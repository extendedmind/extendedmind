package org.extendedmind.db

import java.util.UUID
import scala.collection.JavaConversions.iterableAsScalaIterable
import org.extendedmind.Response._
import org.extendedmind._
import org.extendedmind.domain._
import org.neo4j.graphdb.Direction
import org.neo4j.graphdb.DynamicRelationshipType
import org.neo4j.graphdb.Node
import org.neo4j.graphdb.traversal.Evaluators
import org.neo4j.graphdb.traversal.TraversalDescription
import org.neo4j.kernel.Traversal
import org.neo4j.scala.DatabaseService
import scala.collection.mutable.ListBuffer

trait NoteDatabase extends AbstractGraphDatabase with ItemDatabase {

  // PUBLIC

  def putNewNote(userUUID: UUID, note: Note): Response[SetResult] = {
    for {
      noteNode <- putNewExtendedItem(userUUID, note, ItemLabel.NOTE).right
      result <- Right(getSetResult(noteNode, true)).right
    } yield result
  }

  def putExistingNote(userUUID: UUID, noteUUID: UUID, note: Note): Response[SetResult] = {
    for {
      noteNode <- putExistingExtendedItem(userUUID, noteUUID, note, ItemLabel.NOTE).right
      result <- Right(getSetResult(noteNode, false)).right
    } yield result
  }

  def getNote(userUUID: UUID, noteUUID: UUID): Response[Note] = {
    withTx {
      implicit neo =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          noteNode <- getItemNode(userNode, noteUUID, Some(ItemLabel.NOTE)).right
          note <- toNote(noteNode, userUUID).right
        } yield note
    }
  }

  // PRIVATE
  override def toNote(noteNode: Node, userUUID: UUID)
               (implicit neo4j: DatabaseService): Response[Note] = {
    for {
      note <- toCaseClass[Note](noteNode).right
      completeNote <- addTransientNoteProperties(noteNode, userUUID, note).right
    } yield completeNote
  }

  protected def addTransientNoteProperties(noteNode: Node, userUUID: UUID, note: Note)
                (implicit neo4j: DatabaseService): Response[Note] = {
    for {
      parents <- getParentRelationships(noteNode, userUUID).right
      note <- Right(note.copy(
        relationships = 
          (if (parents._1.isDefined || parents._2.isDefined)            
            Some(ExtendedItemRelationships(  
              parentTask = (if (parents._1.isEmpty) None else (Some(getUUID(parents._1.get.getEndNode())))),
              parentNote = (if (parents._2.isEmpty) None else (Some(getUUID(parents._2.get.getEndNode())))),
              None))
           else None
          ),
        area = (if (noteNode.hasLabel(ItemParentLabel.AREA)) Some(true) else None))).right
    } yield note
  }

}