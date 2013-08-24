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
      noteNode <- createNote(userUUID, note).right
      result <- getSetResult(noteNode, true).right
    }yield result
  }

  def putExistingNote(userUUID: UUID, noteUUID: UUID, note: Note): Response[SetResult] = {
    for{
      note <- updateNote(userUUID, noteUUID, note).right
      result <- getSetResult(note, false).right
    }yield result
  }
  
  // PRIVATE
  
  protected def createNote(userUUID: UUID, note: Note): Response[Node] = {
    withTx{
      implicit neo4j =>
        for{
          userNode <- getUserNode(userUUID).right
          noteNode <- createNote(userNode, note).right
        }yield noteNode
    }
  }
 
  protected def createNote(userNode: Node, note: Note)(implicit neo4j: DatabaseService): Response[Node] = {
    val noteNode = createNode(note, MainLabel.ITEM, ItemLabel.NOTE)
    // Attach task to the user
    userNode --> UserRelationship.OWNS --> noteNode
    Right(noteNode)
  }
  
  protected def updateNote(userUUID: UUID, noteUUID: UUID, note: Note): Response[Node] = {
    withTx{
      implicit neo4j =>
        for{
          userNode <- getUserNode(userUUID).right
          itemNode <- getItemNode(userNode, noteUUID).right
          itemNode <- updateNode(itemNode, note).right
        }yield itemNode
    }    
  }
}