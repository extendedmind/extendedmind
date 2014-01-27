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

  def putNewNote(owner: Owner, note: Note): Response[SetResult] = {
    for {
      noteNode <- putNewExtendedItem(owner, note, ItemLabel.NOTE).right
      result <- Right(getSetResult(noteNode, true)).right
      unit <- Right(addToItemsIndex(owner, noteNode, result)).right
    } yield result
  }

  def putExistingNote(owner: Owner, noteUUID: UUID, note: Note): Response[SetResult] = {
    for {
      noteNode <- putExistingExtendedItem(owner, noteUUID, note, ItemLabel.NOTE).right
      result <- Right(getSetResult(noteNode, false)).right
      unit <- Right(updateItemsIndex(noteNode, result)).right
    } yield result
  }

  def getNote(owner: Owner, noteUUID: UUID): Response[Note] = {
    withTx {
      implicit neo =>
        for {
          noteNode <- getItemNode(owner, noteUUID, Some(ItemLabel.NOTE)).right
          note <- toNote(noteNode, owner).right
        } yield note
    }
  }
  
  def deleteNote(owner: Owner, noteUUID: UUID): Response[DeleteItemResult] = {
    for {
      deletedNoteNode <- deleteNoteNode(owner, noteUUID).right
      result <- Right(getDeleteItemResult(deletedNoteNode._1, deletedNoteNode._2)).right
      unit <- Right(updateItemsIndex(deletedNoteNode._1, result.result)).right
    } yield result
  }

  // PRIVATE

  override def toNote(noteNode: Node, owner: Owner)
               (implicit neo4j: DatabaseService): Response[Note] = {
    for {
      note <- toCaseClass[Note](noteNode).right
      completeNote <- addTransientNoteProperties(noteNode, owner, note).right
    } yield completeNote
  }

  protected def addTransientNoteProperties(noteNode: Node, owner: Owner, note: Note)
                (implicit neo4j: DatabaseService): Response[Note] = {
    for {
      parent <- getItemRelationship(noteNode, owner, ItemRelationship.HAS_PARENT, ItemLabel.LIST).right
      tags <- getTagRelationships(noteNode, owner).right
      note <- Right(note.copy(
        relationships = 
          (if (parent.isDefined || tags.isDefined)            
            Some(ExtendedItemRelationships(  
              parent = (if (parent.isEmpty) None else (Some(getUUID(parent.get.getEndNode())))),
              None,
              tags = (if (tags.isEmpty) None else (Some(getEndNodeUUIDList(tags.get))))))
           else None
          ))).right
    } yield note
  }

  
  protected def deleteNoteNode(owner: Owner, noteUUID: UUID): Response[Tuple2[Node, Long]] = {
    withTx {
      implicit neo =>
        for {
          itemNode <- getItemNode(owner, noteUUID, Some(ItemLabel.NOTE)).right
          deletable <- validateNoteDeletable(itemNode).right
          deleted <- Right(deleteItem(itemNode)).right
        } yield (itemNode, deleted)
    }
  }

  protected def validateNoteDeletable(noteNode: Node)(implicit neo4j: DatabaseService): Response[Boolean] = {
    if (noteNode.hasLabel(ItemParentLabel.AREA))
      fail(INVALID_PARAMETER, "can not delete area, only note")
    else
      Right(true)
  }  
}