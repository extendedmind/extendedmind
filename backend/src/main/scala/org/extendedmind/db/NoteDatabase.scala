/**
 * Copyright (c) 2013-2015 Extended Mind Technologies Oy
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

package org.extendedmind.db

import java.util.UUID
import scala.collection.JavaConversions.iterableAsScalaIterable
import org.extendedmind.Response._
import org.extendedmind._
import org.extendedmind.domain._
import org.extendedmind.security._
import org.extendedmind.security.Authorization._
import org.neo4j.graphdb.Direction
import org.neo4j.graphdb.DynamicRelationshipType
import org.neo4j.graphdb.Node
import org.neo4j.graphdb.traversal.Evaluators
import org.neo4j.graphdb.traversal.TraversalDescription
import org.neo4j.kernel.Traversal
import org.neo4j.scala.DatabaseService
import scala.collection.mutable.ListBuffer
import org.neo4j.graphdb.Relationship

trait NoteDatabase extends AbstractGraphDatabase with ItemDatabase {

  // PUBLIC

  def getNoteAccessRight(owner: Owner, note: Note): Option[Byte] = {
    if (owner.isLimitedAccess){
      // Need to use list access rights
      getSharedListAccessRight(owner.sharedLists.get, note.relationships)
    }else{
      Some(SecurityContext.FOUNDER)
    }
  }

  def putNewNote(owner: Owner, note: Note): Response[SetResult] = {
    for {
      noteResult <- putNewExtendedItem(owner, note, ItemLabel.NOTE).right
      result <- Right(getSetResult(noteResult._1, true, noteResult._2)).right
      unit <- Right(addToItemsIndex(owner, noteResult._1, result)).right
    } yield result
  }

  def putNewLimitedNote(owner: Owner, limitedNote: LimitedNote): Response[SetResult] = {
    for {
      noteResult <- putNewLimitedExtendedItem(owner, limitedNote, ItemLabel.NOTE).right
      result <- Right(getSetResult(noteResult._1, true, noteResult._2)).right
      unit <- Right(addToItemsIndex(owner, noteResult._1, result)).right
    } yield result
  }

  def putExistingNote(owner: Owner, noteUUID: UUID, note: Note): Response[SetResult] = {
    for {
      noteResult <- putExistingNoteNode(owner, noteUUID, note).right
      result <- Right(getSetResult(noteResult._1, false, noteResult._2)).right
      unit <- Right(updateItemsIndex(noteResult._1, result)).right
    } yield result
  }

  def putExistingLimitedNote(owner: Owner, noteUUID: UUID, limitedNote: LimitedNote): Response[SetResult] = {
    for {
      noteResult <- putExistingLimitedExtendedItem(owner, noteUUID, limitedNote, ItemLabel.NOTE).right
      result <- Right(getSetResult(noteResult._1, false, noteResult._2)).right
      unit <- Right(updateItemsIndex(noteResult._1, result)).right
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
      noteNode <- validateExtendedItemModifiable(owner, noteUUID, ItemLabel.NOTE).right
      deletedNoteNode <- deleteNoteNode(owner, noteNode).right
      result <- Right(getDeleteItemResult(deletedNoteNode._1, deletedNoteNode._2)).right
      unit <- Right(updateItemsIndex(deletedNoteNode._1, result.result)).right
    } yield result
  }

  def undeleteNote(owner: Owner, noteUUID: UUID): Response[SetResult] = {
    for {
      noteNode <- validateExtendedItemModifiable(owner, noteUUID, ItemLabel.NOTE).right
      undeletedNoteNode <- undeleteNoteNode(owner, noteNode).right
      result <- Right(getSetResult(undeletedNoteNode, false)).right
      unit <- Right(updateItemsIndex(undeletedNoteNode, result)).right
    } yield result
  }

  def favoriteNote(owner: Owner, noteUUID: UUID): Response[FavoriteNoteResult] = {
    for {
      favoriteInfo <- favoriteNoteNode(owner, noteUUID).right
      result <- Right(FavoriteNoteResult(favoriteInfo._2, getSetResult(favoriteInfo._1, false))).right
      unit <- Right(updateItemsIndex(favoriteInfo._1, result.result)).right
    } yield result
  }

  def unfavoriteNote(owner: Owner, noteUUID: UUID): Response[SetResult] = {
    for {
      noteNode <- unfavoriteNoteNode(owner, noteUUID).right
      result <- Right(getSetResult(noteNode, false)).right
      unit <- Right(updateItemsIndex(noteNode, result)).right
    } yield result
  }

  def noteToTask(owner: Owner, noteUUID: UUID, note: Note): Response[Task] = {
    for {
      convertResult <- convertNoteToTask(owner, noteUUID, note).right
      result <- Right(getSetResult(convertResult._1, false)).right
      unit <- Right(updateItemsIndex(convertResult._1, result)).right
    } yield (convertResult._2.copy(modified = Some(result.modified)))
  }

  def noteToList(owner: Owner, noteUUID: UUID, note: Note): Response[List] = {
    for {
      convertResult <- convertNoteToList(owner, noteUUID, note).right
      result <- Right(getSetResult(convertResult._1, false)).right
      unit <- Right(updateItemsIndex(convertResult._1, result)).right
    } yield (convertResult._2.copy(modified = Some(result.modified)))
  }

  def publishNote(owner: Owner, noteUUID: UUID, format: String, path: Option[String]): Response[PublishNoteResult] = {
    for {
      publishResult <- publishNoteNode(owner, noteUUID, format, path).right
      result <- Right(PublishNoteResult(publishResult._2, publishResult._3, getSetResult(publishResult._1, false))).right
      unit <- Right(updateItemsIndex(publishResult._1, result.result)).right
    } yield result
  }

  def unpublishNote(owner: Owner, noteUUID: UUID): Response[SetResult] = {
    for {
      noteNode <- unpublishNoteNode(owner, noteUUID).right
      result <- Right(getSetResult(noteNode, false)).right
      unit <- Right(updateItemsIndex(noteNode, result)).right
    } yield result
  }

  // PRIVATE

  override def toNote(noteNode: Node, owner: Owner, tagRelationships: Option[Option[scala.List[Relationship]]] = None, skipParent: Boolean = false)
               (implicit neo4j: DatabaseService): Response[Note] = {
    for {
      note <- toCaseClass[Note](noteNode).right
      completeNote <- addTransientNoteProperties(noteNode, owner, note, tagRelationships, skipParent).right
    } yield completeNote
  }

  protected def addTransientNoteProperties(noteNode: Node, owner: Owner, note: Note, tagRelationships: Option[Option[scala.List[Relationship]]], skipParent: Boolean)
                (implicit neo4j: DatabaseService): Response[Note] = {
    for {
      parent <- Right(if (skipParent) None else getItemRelationship(noteNode, owner, ItemRelationship.HAS_PARENT, ItemLabel.LIST)).right
      tags <- (if (tagRelationships.isDefined) Right(tagRelationships.get)
              else getTagRelationships(noteNode, owner)).right
      note <- Right(note.copy(
        visibility =
          (if (noteNode.hasProperty("published"))
            Some(SharedItemVisibility(
                 Some(noteNode.getProperty("published").asInstanceOf[Long]),
                 if (noteNode.hasProperty("draft")) Some(noteNode.getProperty("draft").asInstanceOf[Long]) else None,
                 Some(noteNode.getProperty("path").asInstanceOf[String]),
                 None))
           else None),
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

  protected def putExistingNoteNode(owner: Owner, noteUUID: UUID, note: Note): Response[(Node, Option[Long])] = {
    withTx {
      implicit neo4j =>
        for {
          noteNode <- getItemNode(owner, noteUUID, exactLabelMatch = false).right
          noteNode <- updateItemNode(noteNode,
              note.copy(
                format = if (noteNode.hasProperty("published") && noteNode.hasProperty("format") && note.format.isEmpty)
                           Some(noteNode.getProperty("format").asInstanceOf[String])
                         else note.format),
              Some(ItemLabel.NOTE), None, None, note.modified).right
          archived <- setParentNode(noteNode, owner, note.parent, skipParentHistoryTag=false).right
          tagNodes <- setTagNodes(noteNode, owner, note).right
        } yield (noteNode, archived)
    }
  }


  protected def deleteNoteNode(owner: Owner, noteNode: Node): Response[Tuple2[Node, Long]] = {
    withTx {
      implicit neo =>
        for {
          deleted <- Right(deleteItem(noteNode)).right
        } yield (noteNode, deleted)
    }
  }

  protected def undeleteNoteNode(owner: Owner, noteNode: Node): Response[Node] = {
    withTx {
      implicit neo =>
        for {
          success <- Right(undeleteItem(noteNode)).right
        } yield noteNode
    }
  }

  protected def favoriteNoteNode(owner: Owner, noteUUID: UUID): Response[(Node, Long)] = {
    withTx {
      implicit neo4j =>
        for {
          noteNode <- getItemNode(owner, noteUUID, Some(ItemLabel.NOTE)).right
          favorited <- Right(favoriteNoteNode(noteNode)).right
        } yield (noteNode, favorited)
    }
  }

  protected def favoriteNoteNode(noteNode: Node)(implicit neo4j: DatabaseService): Long = {
    val currentTime = System.currentTimeMillis()
    noteNode.setProperty("favorited", currentTime)
    currentTime
  }

  protected def unfavoriteNoteNode(owner: Owner, noteUUID: UUID): Response[Node] = {
    withTx {
      implicit neo =>
        for {
          noteNode <- getItemNode(owner, noteUUID, Some(ItemLabel.NOTE)).right
          result <- Right(unfavoriteNoteNode(noteNode)).right
        } yield noteNode
    }
  }

  protected def unfavoriteNoteNode(noteNode: Node)(implicit neo4j: DatabaseService): Unit = {
    if (noteNode.hasProperty("favorited")) noteNode.removeProperty("favorited")
  }

  protected def convertNoteToTask(owner: Owner, noteUUID: UUID, note: Note): Response[(Node, Task)] = {
    withTx {
      implicit neo4j =>
        for {
          noteResult <- putExistingExtendedItem(owner, noteUUID, note, ItemLabel.NOTE).right
          taskNode <- Right(setLabel(noteResult._1, Some(MainLabel.ITEM), Some(ItemLabel.TASK), Some(scala.List(ItemLabel.NOTE)))).right
          result <- moveContentToDescription(taskNode).right
          task <- toTask(taskNode, owner).right
        } yield (taskNode, task)
    }
  }

  protected def convertNoteToList(owner: Owner, noteUUID: UUID, note: Note): Response[(Node, List)] = {
    withTx {
      implicit neo4j =>
        for {
          noteResult <- putExistingExtendedItem(owner, noteUUID, note, ItemLabel.NOTE).right
          listNode <- Right(setLabel(noteResult._1, Some(MainLabel.ITEM), Some(ItemLabel.LIST), Some(scala.List(ItemLabel.NOTE)))).right
          result <- moveContentToDescription(listNode).right
          list <- toList(listNode, owner).right
        } yield (listNode, list)
    }
  }

  protected def publishNoteNode(owner: Owner, noteUUID: UUID, format: String, path: Option[String]): Response[(Node, Long, Option[Long])] = {
    withTx {
      implicit neo4j =>
        for {
          ownerNodes <- getOwnerNodes(owner).right
          noteNode <- getItemNode(owner, noteUUID, Some(ItemLabel.NOTE)).right
          publishResult <- publishNoteNode(ownerNodes, noteNode, format, path).right
        } yield (noteNode, publishResult._1, publishResult._2)
    }
  }

  protected def publishNoteNode(ownerNodes: OwnerNodes, noteNode: Node, format: String, path: Option[String]): Response[(Long, Option[Long])] = {
    withTx {
      implicit neo4j =>
        val ownerNode = if (ownerNodes.foreignOwner.isDefined) ownerNodes.foreignOwner.get else ownerNodes.user
        if (!ownerNode.hasProperty("handle")){
          fail(INVALID_PARAMETER, ERR_NOTE_NO_HANDLE, "Can not publish because owner does not have a handle")
        }else{
          val handle = ownerNode.getProperty("handle").asInstanceOf[String]

          // Use note uuid as path if it is not set
          val currentTime = System.currentTimeMillis()
          val draft = if (path.isDefined){
            val pathResult = getItemNodeByPath(ownerNode, path.get, includeDeleted=true)
            if (pathResult.isRight){
              return fail(INVALID_PARAMETER, ERR_NOTE_PATH_IN_USE, "Can not publish because given path is already in use")
            }else{
              noteNode.setProperty("path", path.get)
            }
            // Path was set, remove draft property if it's there
            if (noteNode.hasProperty("draft")) noteNode.removeProperty("draft")
            None
          }else{
            noteNode.setProperty("path", getUUID(noteNode).toString())
            // Also set note to be a draft
            noteNode.setProperty("draft", currentTime)
            Some(currentTime)
          }

          // Set format
          noteNode.setProperty("format", format)

          // Set published timestamp
          noteNode.setProperty("published", currentTime)
          Right((currentTime, draft))
        }
    }
  }

  protected def unpublishNoteNode(owner: Owner, noteUUID: UUID): Response[Node] = {
    withTx {
      implicit neo =>
        for {
          noteNode <- getItemNode(owner, noteUUID, Some(ItemLabel.NOTE)).right
          result <- Right(unpublishNoteNode(noteNode)).right
        } yield noteNode
    }
  }

  protected def unpublishNoteNode(noteNode: Node)(implicit neo4j: DatabaseService): Unit = {
    if (noteNode.hasProperty("published")) noteNode.removeProperty("published")
    if (noteNode.hasProperty("draft")) noteNode.removeProperty("draft")
    if (noteNode.hasProperty("path")) noteNode.removeProperty("path")
  }

}