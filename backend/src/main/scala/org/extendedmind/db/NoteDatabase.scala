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

trait NoteDatabase extends AbstractGraphDatabase with ItemDatabase{

  // PUBLIC
  
  def putNewNote(userUUID: UUID, note: Note): Response[SetResult] = {
    for{
      noteNode <- putNewExtendedItem(userUUID, note, ItemLabel.NOTE).right
      result <- Right(getSetResult(noteNode, true)).right
    }yield result
  }

  def putExistingNote(userUUID: UUID, noteUUID: UUID, note: Note): Response[SetResult] = {
    for{
      noteNode <- putExistingExtendedItem(userUUID, noteUUID, note, ItemLabel.NOTE).right
      result <- Right(getSetResult(noteNode, false)).right
    }yield result
  }
  
  def getNote(userUUID: UUID, noteUUID: UUID): Response[Note] = {
    withTx{
      implicit neo =>
        for{
          userNode <- getUserNode(userUUID).right
          noteNode <- getItemNode(userNode, noteUUID, Some(ItemLabel.NOTE)).right
          note <- toCaseClass[Note](noteNode).right
        }yield note
    }
  }

}