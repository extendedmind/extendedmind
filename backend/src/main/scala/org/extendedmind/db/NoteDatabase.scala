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

  // Preview is visible for one hour
  val PREVIEW_VALIDITY: Long = 3600000l

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
      unit <- Right(evaluateNoteRevision(note, noteResult._1, noteResult._3)).right
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
          noteNode <- getItemNode(getOwnerUUID(owner), noteUUID, Some(ItemLabel.NOTE)).right
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
      noteResult <- unfavoriteNoteNode(owner, noteUUID).right
      result <- Right(getSetResult(noteResult._1, false)).right
      unit <- Right(updateItemsIndex(noteResult._1, result)).right
    } yield result
  }

  def noteToTask(owner: Owner, noteUUID: UUID, note: Note): Response[Task] = {
    for {
      convertResult <- convertNoteToTask(owner, noteUUID, note).right
      unit <- Right(evaluateTaskRevision(convertResult._2, convertResult._1, convertResult._3, force=true)).right
      result <- Right(getSetResult(convertResult._1, false)).right
      unit <- Right(updateItemsIndex(convertResult._1, result)).right
    } yield (convertResult._2.copy(modified = Some(result.modified)))
  }

  def noteToList(owner: Owner, noteUUID: UUID, note: Note): Response[List] = {
    for {
      convertResult <- convertNoteToList(owner, noteUUID, note).right
      unit <- Right(evaluateListRevision(convertResult._2, convertResult._1, convertResult._3, force=true)).right
      result <- Right(getSetResult(convertResult._1, false)).right
      unit <- Right(updateItemsIndex(convertResult._1, result)).right
    } yield (convertResult._2.copy(modified = Some(result.modified)))
  }

  def previewNote(owner: Owner, noteUUID: UUID, format: String): Response[PreviewNoteResult] = {
    for {
      previewResult <- previewNoteNode(owner, noteUUID, format).right
      result <- Right(PreviewNoteResult(previewResult._2, previewResult._3, getSetResult(previewResult._1, false))).right
      unit <- Right(updateItemsIndex(previewResult._1, result.result)).right
    } yield result
  }

  def publishNote(owner: Owner, noteUUID: UUID, format: String, path: String): Response[PublishNoteResult] = {
    for {
      publishResult <- publishNoteNode(owner, noteUUID, format, path).right
      result <- Right(PublishNoteResult(publishResult._2, getSetResult(publishResult._1, false))).right
      unit <- Right(updateItemsIndex(publishResult._1, result.result)).right
    } yield result
  }

  def unpublishNote(owner: Owner, noteUUID: UUID): Response[SetResult] = {
    for {
      noteResult <- unpublishNoteNode(owner, noteUUID).right
      result <- Right(getSetResult(noteResult._1, false)).right
      unit <- Right(updateItemsIndex(noteResult._1, result)).right
    } yield result
  }

  // PRIVATE

  override def toNote(noteNode: Node, owner: Owner, tagRelationships: Option[Option[TagRelationships]] = None, skipParent: Boolean = false)
               (implicit neo4j: DatabaseService): Response[Note] = {
    for {
      note <- toCaseClass[Note](noteNode).right
      ownerNodes <- getOwnerNodes(owner).right
      completeNote <- addTransientNoteProperties(noteNode, ownerNodes, note, tagRelationships, skipParent).right
    } yield completeNote
  }

  protected def toNote(noteNode: Node, ownerNodes: OwnerNodes, skipParent: Boolean)
               (implicit neo4j: DatabaseService): Response[Note] = {
    for {
      note <- toCaseClass[Note](noteNode).right
      completeNote <- addTransientNoteProperties(noteNode, ownerNodes, note, None, skipParent).right
    } yield completeNote
  }

  protected def addTransientNoteProperties(
                    noteNode: Node, ownerNodes: OwnerNodes, note: Note,
                    tagRelationships: Option[Option[TagRelationships]], skipParent: Boolean)
                (implicit neo4j: DatabaseService): Response[Note] = {
    for {
      parentRel <- Right(if (skipParent) None else getItemRelationship(noteNode, ownerNodes, ItemRelationship.HAS_PARENT, ItemLabel.LIST)).right
      assigneeRel <- Right(getAssigneeRelationship(noteNode)).right
      tagsRels <- (if (tagRelationships.isDefined) Right(tagRelationships.get)
              else getTagRelationships(noteNode, ownerNodes)).right
      note <- Right(note.copy(
        visibility =
          (if (noteNode.hasProperty("published") && !noteNode.hasProperty("unpublished"))
            Some(SharedItemVisibility(
                 Some(noteNode.getProperty("published").asInstanceOf[Long]),
                 Some(noteNode.getProperty("path").asInstanceOf[String]),
                 if (noteNode.hasProperty("preview")) Some(noteNode.getProperty("preview").asInstanceOf[Long]) else None,
                 if (noteNode.hasProperty("previewExpires")) Some(noteNode.getProperty("previewExpires").asInstanceOf[Long]) else None,
                 None))
           else None),
        relationships =
          (if (parentRel.isDefined || assigneeRel.isDefined || tagsRels.isDefined)
            Some(ExtendedItemRelationships(
              parent = parentRel.flatMap(parentRel => Some(getUUID(parentRel.getEndNode))),
              origin = None,
              assignee = assigneeRel.flatMap(assigneeRel => {
                if (ownerNodes.foreignOwner.isEmpty && getUUID(assigneeRel.getEndNode) == getUUID(ownerNodes.user)) None
                else Some(getUUID(assigneeRel.getEndNode))
              }),
              assigner = assigneeRel.flatMap(assigneeRel => Some(UUIDUtils.getUUID(assigneeRel.getProperty("assigner").asInstanceOf[String]))),
              tags = tagsRels.flatMap(tagsRels => if (tagsRels.ownerTags.isDefined) Some(getEndNodeUUIDList(tagsRels.ownerTags.get)) else None),
              collectiveTags = tagsRels.flatMap(tagsRels => getCollectiveTagEndNodeUUIDList(tagsRels.collectiveTags))))
           else None
          ))).right
    } yield note
  }

  protected def putExistingNoteNode(owner: Owner, noteUUID: UUID, note: Note): Response[(Node, Option[Long], OwnerNodes)] = {
    withTx {
      implicit neo4j =>
        for {
          ownerNodes <- getOwnerNodes(owner).right
          noteNode <- getItemNode(getOwnerUUID(owner), noteUUID, exactLabelMatch = false).right
          noteNode <- updateItemNode(noteNode,
              note.copy(
                format = if (noteNode.hasProperty("published") && noteNode.hasProperty("format") && note.format.isEmpty)
                           Some(noteNode.getProperty("format").asInstanceOf[String])
                         else note.format),
              Some(ItemLabel.NOTE), None, None, note.modified).right
          archived <- setParentNode(noteNode, ownerNodes, note.parent, skipParentHistoryTag=false).right
          tagNodes <- setTagNodes(noteNode, ownerNodes, note).right
          result <- setAssigneeRelationship(noteNode, ownerNodes, note).right
        } yield (noteNode, archived, ownerNodes)
    }
  }

  protected def deleteNoteNode(owner: Owner, noteNode: Node): Response[Tuple2[Node, Long]] = {
    withTx {
      implicit neo =>
        for {
          // Unpublish if published
          unit <- Right(unpublishNoteNode(noteNode)).right
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

  protected def favoriteNoteNode(owner: Owner, noteUUID: UUID): Response[(Node, Long, OwnerNodes)] = {
    withTx {
      implicit neo4j =>
        for {
          ownerNodes <- getOwnerNodes(owner).right
          noteNode <- getItemNode(getOwnerUUID(owner), noteUUID, Some(ItemLabel.NOTE)).right
          favorited <- Right(favoriteNoteNode(noteNode)).right
        } yield (noteNode, favorited, ownerNodes)
    }
  }

  protected def favoriteNoteNode(noteNode: Node)(implicit neo4j: DatabaseService): Long = {
    val currentTime = System.currentTimeMillis()
    noteNode.setProperty("favorited", currentTime)
    currentTime
  }

  protected def unfavoriteNoteNode(owner: Owner, noteUUID: UUID): Response[(Node, OwnerNodes)] = {
    withTx {
      implicit neo =>
        for {
          ownerNodes <- getOwnerNodes(owner).right
          noteNode <- getItemNode(getOwnerUUID(owner), noteUUID, Some(ItemLabel.NOTE)).right
          result <- Right(unfavoriteNoteNode(noteNode)).right
        } yield (noteNode, ownerNodes)
    }
  }

  protected def unfavoriteNoteNode(noteNode: Node)(implicit neo4j: DatabaseService): Unit = {
    if (noteNode.hasProperty("favorited")) noteNode.removeProperty("favorited")
  }

  protected def convertNoteToTask(owner: Owner, noteUUID: UUID, note: Note): Response[(Node, Task, OwnerNodes)] = {
    withTx {
      implicit neo4j =>
        for {
          noteResult <- putExistingExtendedItem(owner, noteUUID, note, ItemLabel.NOTE).right
          result <- validateNoteConvertable(noteResult._1).right
          taskNode <- Right(setLabel(noteResult._1, Some(MainLabel.ITEM), Some(ItemLabel.TASK), Some(scala.List(ItemLabel.NOTE)))).right
          result <- moveContentToDescription(taskNode).right
          task <- toTask(taskNode, owner).right
        } yield (taskNode, task, noteResult._3)
    }
  }

  protected def convertNoteToList(owner: Owner, noteUUID: UUID, note: Note): Response[(Node, List, OwnerNodes)] = {
    withTx {
      implicit neo4j =>
        for {
          noteResult <- putExistingExtendedItem(owner, noteUUID, note, ItemLabel.NOTE).right
          result <- validateNoteConvertable(noteResult._1).right
          listNode <- Right(setLabel(noteResult._1, Some(MainLabel.ITEM), Some(ItemLabel.LIST), Some(scala.List(ItemLabel.NOTE)))).right
          result <- moveContentToDescription(listNode).right
          list <- toList(listNode, owner).right
        } yield (listNode, list, noteResult._3)
    }
  }

  protected def previewNoteNode(owner: Owner, noteUUID: UUID, format: String): Response[(Node, Long, Long)] = {
    withTx {
      implicit neo4j =>
        for {
          noteNode <- getItemNode(getOwnerUUID(owner), noteUUID, Some(ItemLabel.NOTE)).right
          previewResult <- previewNoteNode(noteNode, format).right
        } yield (noteNode, previewResult._1, previewResult._2)
    }
  }

  protected def previewNoteNode(noteNode: Node, format: String): Response[(Long, Long)] = {
    withTx {
      implicit neo4j =>
        // Set format
        noteNode.setProperty("format", format)

        // Set preview code random long
        val previewCode = Random.generateRandomUnsignedLong
        noteNode.setProperty("preview", previewCode)

        // Set preview expires timestamp
        val previewExpires = System.currentTimeMillis() + PREVIEW_VALIDITY
        noteNode.setProperty("previewExpires", previewExpires)

        Right((previewCode, previewExpires))
    }
  }

  protected def publishNoteNode(owner: Owner, noteUUID: UUID, format: String, path: String): Response[(Node, Long, OwnerNodes)] = {
    withTx {
      implicit neo4j =>
        for {
          ownerNodes <- getOwnerNodes(owner).right
          noteNode <- getItemNode(getOwnerUUID(owner), noteUUID, Some(ItemLabel.NOTE)).right
          published <- publishNoteNode(ownerNodes, noteNode, format, path).right
        } yield (noteNode, published, ownerNodes)
    }
  }

  protected def publishNoteNode(ownerNodes: OwnerNodes, noteNode: Node, format: String, path: String): Response[Long] = {
    withTx {
      implicit neo4j =>
        val ownerNode = if (ownerNodes.foreignOwner.isDefined) ownerNodes.foreignOwner.get else ownerNodes.user
        if (!ownerNode.hasProperty("handle")){
          fail(INVALID_PARAMETER, ERR_NOTE_NO_HANDLE, "Can not publish because owner does not have a handle")
        }else{
          val handle = ownerNode.getProperty("handle").asInstanceOf[String]

          val pathResult = getPublicItemRevisionNodeByPath(getUUID(ownerNode), path)
          if (pathResult.isRight){
            val publishedNodeRevision = pathResult.right.get
            if (publishedNodeRevision.getRelationships.find(relationship =>
                relationship.getType.name == ItemRelationship.HAS_REVISION.name &&
                relationship.getEndNode != noteNode).isDefined){
              return fail(INVALID_PARAMETER, ERR_NOTE_PATH_IN_USE,
                  "Can not publish because given path is already in use with a different item")
            }
            // Republishing the same node with the same path
          }

          val previouslyPublishedRevisionRelationship =
            getPublishedExtendedItemRevisionRelationship(noteNode, includeUnpublished = true)
          if (previouslyPublishedRevisionRelationship.isDefined){
            // Previously published (and possibly unpublished), remove it from the index
            val previouslyPublishedRevisionNode = previouslyPublishedRevisionRelationship.get.getEndNode
            val publicRevisionIndex = neo4j.gds.index().forNodes("public")
            publicRevisionIndex.remove(previouslyPublishedRevisionNode)
            // Remove either published or unpublished timestamp
            if (previouslyPublishedRevisionNode.hasProperty("published"))
              previouslyPublishedRevisionNode.removeProperty("published")
            if (previouslyPublishedRevisionNode.hasProperty("unpublished"))
              previouslyPublishedRevisionNode.removeProperty("unpublished")
          }

          // Create a revision and mark it published
          val latestRevisionRel = getLatestExtendedItemRevisionRelationship(noteNode)
          val newRevisionNumber =
            if (latestRevisionRel.isDefined)
              latestRevisionRel.get.getEndNode.getProperty("number").asInstanceOf[Long] + 1
            else 1
          for{
            note <- toNote(noteNode, ownerNodes, skipParent = true).right
            noteBytes <- Right(pickleNote(note)).right
            noteRevisionNode <- Right(createLatestRevisionNode(noteNode, ownerNodes, ItemLabel.NOTE, noteBytes, newRevisionNumber, base = true)).right
            published <- Right(setNotePublished(getUUID(ownerNode), noteNode, noteRevisionNode, note.modified.get, format, path)).right
          } yield published
        }
    }
  }

  protected def setNotePublished(ownerUUID: UUID, noteNode: Node, noteRevisionNode: Node, noteModified: Long, format: String, path: String)(implicit neo4j: DatabaseService): Long = {
    val currentTime = System.currentTimeMillis()
    noteNode.setProperty("path", path)

    // Set format
    noteNode.setProperty("format", format)

    // Set same published timestamp to both revision and note
    noteNode.setProperty("published", currentTime)
    noteRevisionNode.setProperty("published", currentTime)

    // Add revision to public revision index
    val publicRevisionIndex = neo4j.gds.index().forNodes("public")
    publicRevisionIndex.add(noteRevisionNode, "owner", UUIDUtils.getTrimmedBase64UUIDForLucene(ownerUUID))
    publicRevisionIndex.add(noteRevisionNode, "path", path)
    publicRevisionIndex.add(noteRevisionNode, "modified", noteModified)
    currentTime
  }

  protected def unpublishNoteNode(owner: Owner, noteUUID: UUID): Response[(Node, OwnerNodes)] = {
    withTx {
      implicit neo =>
        for {
          ownerNodes <- getOwnerNodes(owner).right
          noteNode <- getItemNode(getOwnerUUID(owner), noteUUID, Some(ItemLabel.NOTE)).right
          result <- Right(unpublishNoteNode(noteNode)).right
        } yield (noteNode, ownerNodes)
    }
  }

  protected def unpublishNoteNode(noteNode: Node)(implicit neo4j: DatabaseService): Unit = {
    if (noteNode.hasProperty("published")){
      noteNode.removeProperty("published")
      if (noteNode.hasProperty("path")) noteNode.removeProperty("path")
      // Remove publish info also from the revision
      val publishedRevision = getPublishedExtendedItemRevisionRelationship(noteNode)
      if (publishedRevision.isDefined){
        val noteRevisionNode = publishedRevision.get.getEndNode
        noteRevisionNode.removeProperty("published")

        // Add an unpublished timestamp to the revision node, and not remove it from the index
        // quite yet. NOTE: unpublished is not needed in the note as the unpublished information
        // is only used when getting modified public items. Unpublished revisions are purged from
        // the index at specific intervals, see AdminActions.tick().
        val currentTime = System.currentTimeMillis
        noteRevisionNode.setProperty("unpublished", currentTime);
      }
    }
  }

  protected def validateNoteConvertable(noteNode: Node)(implicit neo4j: DatabaseService): Response[Unit] = {
    // Can't convert note that has been published
    if (noteNode.hasProperty("published"))
      fail(INVALID_PARAMETER, ERR_NOTE_CONVERT_PUBLISHED, "Can not convert a note that has been published")
    else
      Right()
  }

  protected def evaluateNoteRevision(note: Note, noteNode: Node, ownerNodes: OwnerNodes, force: Boolean = false) = {
    withTx {
      implicit neo4j =>
        evaluateNeedForRevision(noteNode, ownerNodes, force).fold(
          // No need to do anything if latest revision relationship is new enough
        )(latestRevisionRel => {
          val noteBytes = pickleNote(getNoteForPickling(note))
          createExtendedItemRevision(noteNode, ownerNodes, ItemLabel.NOTE, noteBytes, latestRevisionRel)
        })
    }
  }

  private def getNoteForPickling(note: Note): Note = {
    // Create a revision containing only the fields that can be set using putExistingNote
    note.copy(
      modified = None,
      archived = None,
      deleted = None,
      favorited = None,
      visibility = None,
      relationships =
        if (note.relationships.isDefined)
          Some(note.relationships.get.copy(
              assigner = None,
              origin = None))
        else None)
  }

  protected def noteToPublicItem(ownerNode: Node, noteNode: Node, displayOwner: String)(implicit neo4j: DatabaseService): Response[PublicItem] = {
    val owner = Owner(getUUID(ownerNode), None).copy(isFakeUser = true)
    for {
      tagRels <- getTagRelationships(noteNode, OwnerNodes(ownerNode, None)).right
      note <- toNote(noteNode, owner, tagRelationships=Some(tagRels), skipParent=true).right
      tagsResult <- getTagsWithParents(tagRels, owner, noUi=true).right
      assignee <- Right(getAssignee(noteNode)).right
    } yield PublicItem(displayOwner, stripNonPublicFieldsFromNote(note),
        tagsResult._1,
        tagsResult._2,
        assignee)
  }

  protected def noteRevisionToPublicItem(ownerNode: Node, noteRevisionNode: Node, displayOwner: String)(implicit neo4j: DatabaseService): Response[PublicItem] = {
    val owner = Owner(getUUID(ownerNode), None).copy(isFakeUser = true)
    val published = noteRevisionNode.getProperty("published").asInstanceOf[Long]
    val revisionRelationship = noteRevisionNode.getRelationships().find (relationship => relationship.getType.name == ItemRelationship.HAS_REVISION.name)
    if (revisionRelationship.isEmpty)
      return fail(INTERNAL_SERVER_ERROR, ERR_ITEM_NO_REVISION_RELATIONSHIP, "Note revision does not have a master")
    if (!revisionRelationship.get.getStartNode.hasProperty("path"))
      return fail(INTERNAL_SERVER_ERROR, ERR_NOTE_NO_PATH, "Published note is missing path")
    val path = revisionRelationship.get.getStartNode.getProperty("path").asInstanceOf[String]

    for {
      unprocessedNote <- unpickleNote(noteRevisionNode.getProperty("data").asInstanceOf[Array[Byte]]).right
      note <- Right(validateNote(ownerNode, stripNonPublicFieldsFromNote(unprocessedNote))).right
      tagsResult <- getExtendedItemTagsWithParents(note, owner, noUi=true).right
      assignee <- getAssignee(note).right
    } yield PublicItem(displayOwner,
        note.copy(visibility = Some(SharedItemVisibility(Some(published),Some(path), None, None, None))),
        tagsResult._1,
        tagsResult._2,
        assignee)
  }

  protected def stripNonPublicFieldsFromNote(note: Note): Note ={
    note.copy(archived=None, favorited=None, ui=None, relationships = {
      if (note.relationships.isDefined){
        val rels = note.relationships.get
        if (rels.assigner.isDefined || rels.tags.isDefined || rels.collectiveTags.isDefined)
          Some(rels.copy(parent = None, origin = None, assignee = None))
        else None
      }else None
    })
  }

  protected def validateNote(ownerNode: Node, note: Note)(implicit neo4j: DatabaseService): Note = {
    val ownerUUID = getUUID(ownerNode)
    note.copy(relationships =
      if (note.relationships.isDefined){
        val relationships = note.relationships.get
        val parent = relationships.parent.flatMap(parent => validateParent(ownerUUID, parent))
        val origin = relationships.origin.flatMap(origin => validateOrigin(ownerUUID, origin))
        val assignee = relationships.assignee.flatMap(assignee => validateUser(assignee))
        val assigner = relationships.assigner.flatMap(assigner => validateUser(assigner))
        val tags = relationships.tags.flatMap(tags => validateTags(ownerUUID, tags))
        val collectiveTags = relationships.collectiveTags.flatMap(collectiveTags => validateCollectiveTags(ownerNode, collectiveTags))

        if (parent.isDefined || origin.isDefined || assignee.isDefined || assigner.isDefined ||
            tags.isDefined || collectiveTags.isDefined)
          Some(ExtendedItemRelationships(parent, origin,
              assignee, assigner, tags, collectiveTags))
        else None
      }else None)
  }

}