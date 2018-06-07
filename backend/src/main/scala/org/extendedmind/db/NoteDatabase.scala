/**
 * Copyright (c) 2013-2017 Extended Mind Technologies Oy
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
import org.neo4j.graphdb.RelationshipType
import org.neo4j.graphdb.Node
import org.neo4j.graphdb.traversal.Evaluators
import org.neo4j.graphdb.traversal.TraversalDescription
import org.neo4j.index.lucene.ValueContext
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
      unit <- Right(addToItemsIndex(owner, noteResult._1, noteResult._2)).right
    } yield noteResult._2
  }

  def putNewLimitedNote(owner: Owner, limitedNote: LimitedNote): Response[SetResult] = {
    for {
      noteResult <- putNewLimitedExtendedItem(owner, limitedNote, ItemLabel.NOTE).right
      unit <- Right(addToItemsIndex(owner, noteResult._1, noteResult._2)).right
    } yield noteResult._2
  }

  def putExistingNote(owner: Owner, noteUUID: UUID, note: Note): Response[SetResult] = {
    for {
      noteResult <- putExistingNoteNode(owner, noteUUID, note).right
      revision <- Right(evaluateNoteRevision(note, noteResult._1, noteResult._3)).right
      result <- Right(noteResult._2.copy(revision = revision)).right
      unit <- Right(updateItemsIndex(noteResult._1, result)).right
    } yield result
  }

  def putExistingLimitedNote(owner: Owner, noteUUID: UUID, limitedNote: LimitedNote): Response[SetResult] = {
    for {
      noteResult <- putExistingLimitedExtendedItem(owner, noteUUID, limitedNote, ItemLabel.NOTE).right
      revision <- Right(evaluateNoteRevision(Note(limitedNote), noteResult._1, noteResult._3)).right
      result <- Right(noteResult._2.copy(revision = revision)).right
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
      deleteNoteResult <- deleteNoteNode(owner, noteNode).right
      unit <- Right(updateItemsIndex(deleteNoteResult._1, deleteNoteResult._2.result)).right
    } yield deleteNoteResult._2
  }

  def undeleteNote(owner: Owner, noteUUID: UUID): Response[SetResult] = {
    for {
      noteNode <- validateExtendedItemModifiable(owner, noteUUID, ItemLabel.NOTE).right
      undeletedResult <- undeleteNoteNode(owner, noteNode).right
      unit <- Right(updateItemsIndex(undeletedResult._1, undeletedResult._2)).right
    } yield undeletedResult._2
  }

  def favoriteNote(owner: Owner, noteUUID: UUID): Response[FavoriteNoteResult] = {
    for {
      favoriteInfo <- favoriteNoteNode(owner, noteUUID).right
      unit <- Right(updateItemsIndex(favoriteInfo._1, favoriteInfo._2.result)).right
    } yield favoriteInfo._2
  }

  def unfavoriteNote(owner: Owner, noteUUID: UUID): Response[SetResult] = {
    for {
      noteResult <- unfavoriteNoteNode(owner, noteUUID).right
      unit <- Right(updateItemsIndex(noteResult._1, noteResult._2)).right
    } yield noteResult._2
  }

  def noteToTask(owner: Owner, noteUUID: UUID, note: Note): Response[Task] = {
    for {
      convertResult <- convertNoteToTask(owner, noteUUID, note).right
      revision <- Right(evaluateTaskRevision(convertResult._3, convertResult._1, convertResult._4, force=true)).right
      unit <- Right(updateItemsIndex(convertResult._1, convertResult._2)).right
    } yield (convertResult._3.copy(revision = revision))
  }

  def noteToList(owner: Owner, noteUUID: UUID, note: Note): Response[List] = {
    for {
      convertResult <- convertNoteToList(owner, noteUUID, note).right
      revision <- Right(evaluateListRevision(convertResult._3, convertResult._1, convertResult._4, force=true)).right
      unit <- Right(updateItemsIndex(convertResult._1, convertResult._2)).right
    } yield (convertResult._3.copy(revision = revision))
  }

  def previewNote(owner: Owner, noteUUID: UUID, format: String): Response[PreviewNoteResult] = {
    for {
      previewResult <- previewNoteNode(owner, noteUUID, format).right
      unit <- Right(updateItemsIndex(previewResult._1, previewResult._2.result)).right
    } yield previewResult._2
  }

  def publishNote(owner: Owner, noteUUID: UUID, format: String, path: String, licence: Option[String], index: Boolean, publicUi: Option[String], overridePublished: Option[Long]): Response[PublishNoteResult] = {
    withTx {
      implicit neo4j =>
        for {
          ownerNodes <- getOwnerNodes(owner).right
          noteNode <- getItemNode(getOwnerUUID(owner), noteUUID, Some(ItemLabel.NOTE)).right
          publishResult <- publishNoteNode(ownerNodes, noteNode, format, path, licence, index, publicUi, overridePublished).right
          // Add revision to public revision index
          modified <- Right(addToPublicIndex(publishResult._1, getOwnerUUID(owner), publishResult._4, path, index)).right
          result <- Right(updateNodeModified(publishResult._1)).right
          publishNoteResult <- Right(PublishNoteResult(publishResult._2, modified, publishResult._3, IdUtils.getShortIdAsString(publishResult._4), result)).right
          unit <- Right(updateItemsIndex(publishResult._1, result)).right
        } yield publishNoteResult
    }
  }

  def unpublishNote(owner: Owner, noteUUID: UUID): Response[SetResult] = {
    withTx {
      implicit neo =>
        for {
          ownerNodes <- getOwnerNodes(owner).right
          noteNode <- getItemNode(getOwnerUUID(owner), noteUUID, Some(ItemLabel.NOTE)).right
          unit <- Right(unpublishNoteNode(noteNode)).right
          result <- Right(updateNodeModified(noteNode)).right
          unit <- Right(updateItemsIndex(noteNode, result)).right
        } yield result
    }
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
      latestRevisionRel <- Right(getLatestExtendedItemRevisionRelationship(noteNode)).right
      publishedRevisionRel <- Right(getPublishedExtendedItemRevisionRelationship(noteNode)).right
      tagsRels <- (if (tagRelationships.isDefined) Right(tagRelationships.get)
              else getTagRelationships(noteNode, ownerNodes)).right
      note <- Right(note.copy(
        creator = getItemCreatorUUID(noteNode),
        revision = latestRevisionRel.flatMap(latestRevisionRel => Some(latestRevisionRel.getEndNode.getProperty("number").asInstanceOf[Long])),
        visibility =
          (if (noteNode.hasProperty("preview") || noteNode.hasProperty("path"))
            Some(SharedItemVisibility(
                 if (publishedRevisionRel.isDefined && publishedRevisionRel.get.getEndNode.hasProperty("published")) Some(publishedRevisionRel.get.getEndNode.getProperty("published").asInstanceOf[Long]) else None,
                 if (noteNode.hasProperty("path")) Some(noteNode.getProperty("path").asInstanceOf[String]) else None,
                 if (noteNode.hasProperty("licence")) Some(noteNode.getProperty("licence").asInstanceOf[String]) else None,
                 if (noteNode.hasProperty("indexed")) Some(noteNode.getProperty("indexed").asInstanceOf[Long]) else None,
                 if (publishedRevisionRel.isDefined && publishedRevisionRel.get.getEndNode.hasProperty("number")) Some(publishedRevisionRel.get.getEndNode.getProperty("number").asInstanceOf[Long]) else None,
                 if (publishedRevisionRel.isDefined && noteNode.hasProperty("sid")) Some(IdUtils.getShortIdAsString(noteNode.getProperty("sid").asInstanceOf[Long])) else None,
                 if (noteNode.hasProperty("publicUi")) Some(noteNode.getProperty("publicUi").asInstanceOf[String]) else None,
                 None, // TODO: Reviewing
                 if (noteNode.hasProperty("preview")) Some(noteNode.getProperty("preview").asInstanceOf[Long].toHexString) else None,
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
              assigner = assigneeRel.flatMap(assigneeRel => Some(IdUtils.getUUID(assigneeRel.getProperty("assigner").asInstanceOf[String]))),
              tags = tagsRels.flatMap(tagsRels => if (tagsRels.ownerTags.isDefined) Some(getEndNodeUUIDList(tagsRels.ownerTags.get)) else None),
              collectiveTags = tagsRels.flatMap(tagsRels => getCollectiveTagEndNodeUUIDList(tagsRels.collectiveTags))))
           else None
          ))).right
    } yield note
  }

  protected def putExistingNoteNode(owner: Owner, noteUUID: UUID, note: Note): Response[(Node, SetResult, OwnerNodes)] = {
    withTx {
      implicit neo4j =>
        for {
          ownerNodes <- getOwnerNodes(owner).right
          noteNode <- getItemNode(getOwnerUUID(owner), noteUUID, exactLabelMatch = false).right
          noteResult <- updateItemNode(noteNode, note,
              Some(ItemLabel.NOTE), None, None, note.modified).right
          archived <- setParentNode(noteResult._1, ownerNodes, note.parent, skipParentHistoryTag=false).right
          tagNodes <- setTagNodes(noteResult._1, ownerNodes, note).right
          result <- setAssigneeRelationship(noteResult._1, ownerNodes, note).right
        } yield (noteNode, noteResult._2.copy(archived = archived), ownerNodes)
    }
  }

  protected def deleteNoteNode(owner: Owner, noteNode: Node): Response[(Node, DeleteItemResult)] = {
    withTx {
      implicit neo =>
        for {
          // Unpublish if published
          unit <- Right(unpublishNoteNode(noteNode)).right
          deleted <- Right(deleteItem(noteNode)).right
        } yield (noteNode, deleted)
    }
  }

  protected def undeleteNoteNode(owner: Owner, noteNode: Node): Response[(Node, SetResult)] = {
    withTx {
      implicit neo =>
        for {
          result <- Right(undeleteItem(noteNode)).right
        } yield (noteNode, result)
    }
  }

  protected def favoriteNoteNode(owner: Owner, noteUUID: UUID): Response[(Node, FavoriteNoteResult, OwnerNodes)] = {
    withTx {
      implicit neo4j =>
        for {
          ownerNodes <- getOwnerNodes(owner).right
          noteNode <- getItemNode(getOwnerUUID(owner), noteUUID, Some(ItemLabel.NOTE)).right
          result <- Right(favoriteNoteNode(noteNode)).right
        } yield (noteNode, result, ownerNodes)
    }
  }

  protected def favoriteNoteNode(noteNode: Node)(implicit neo4j: DatabaseService): FavoriteNoteResult = {
    val result = updateNodeModified(noteNode)
    if (!noteNode.hasProperty("favorited")) {
      noteNode.setProperty("favorited", result.modified)
      FavoriteNoteResult(result.modified, result)
    } else {
      FavoriteNoteResult(noteNode.getProperty("favorited").asInstanceOf[Long], result)
    }
  }

  protected def unfavoriteNoteNode(owner: Owner, noteUUID: UUID): Response[(Node, SetResult, OwnerNodes)] = {
    withTx {
      implicit neo =>
        for {
          ownerNodes <- getOwnerNodes(owner).right
          noteNode <- getItemNode(getOwnerUUID(owner), noteUUID, Some(ItemLabel.NOTE)).right
          result <- Right(unfavoriteNoteNode(noteNode)).right
        } yield (noteNode, result, ownerNodes)
    }
  }

  protected def unfavoriteNoteNode(noteNode: Node)(implicit neo4j: DatabaseService): SetResult = {
    if (noteNode.hasProperty("favorited"))
      noteNode.removeProperty("favorited")
    updateNodeModified(noteNode)
  }

  protected def convertNoteToTask(owner: Owner, noteUUID: UUID, note: Note): Response[(Node, SetResult, Task, OwnerNodes)] = {
    withTx {
      implicit neo4j =>
        for {
          noteResult <- putExistingExtendedItem(owner, noteUUID, note, ItemLabel.NOTE).right
          result <- validateNoteConvertable(noteResult._1).right
          taskNode <- Right(setLabel(noteResult._1, Some(MainLabel.ITEM), Some(ItemLabel.TASK), Some(scala.List(ItemLabel.NOTE)))).right
          unit <- moveContentToDescription(taskNode).right
          result <- Right(updateNodeModified(taskNode)).right
          task <- toTask(taskNode, owner).right
        } yield (taskNode, result, task, noteResult._3)
    }
  }

  protected def convertNoteToList(owner: Owner, noteUUID: UUID, note: Note): Response[(Node, SetResult, List, OwnerNodes)] = {
    withTx {
      implicit neo4j =>
        for {
          noteResult <- putExistingExtendedItem(owner, noteUUID, note, ItemLabel.NOTE).right
          result <- validateNoteConvertable(noteResult._1).right
          listNode <- Right(setLabel(noteResult._1, Some(MainLabel.ITEM), Some(ItemLabel.LIST), Some(scala.List(ItemLabel.NOTE)))).right
          unit <- moveContentToDescription(listNode).right
          result <- Right(updateNodeModified(listNode)).right
          list <- toList(listNode, owner).right
        } yield (listNode, result, list, noteResult._3)
    }
  }

  protected def previewNoteNode(owner: Owner, noteUUID: UUID, format: String): Response[(Node, PreviewNoteResult)] = {
    withTx {
      implicit neo4j =>
        for {
          noteNode <- getItemNode(getOwnerUUID(owner), noteUUID, Some(ItemLabel.NOTE)).right
          previewResult <- Right(previewNoteNode(noteNode, format)).right
        } yield (noteNode, previewResult)
    }
  }

  protected def previewNoteNode(noteNode: Node, format: String)(implicit neo4j: DatabaseService): PreviewNoteResult = {
    // Set format
    noteNode.setProperty("format", format)

    // Set preview code random long
    val previewCode = Random.generateRandomUnsignedLong
    noteNode.setProperty("preview", previewCode)

    // Set preview expires timestamp
    val previewExpires = System.currentTimeMillis() + PREVIEW_VALIDITY
    noteNode.setProperty("previewExpires", previewExpires)

    PreviewNoteResult(previewCode.toHexString, previewExpires, updateNodeModified(noteNode))
  }

  protected def publishNoteNode(ownerNodes: OwnerNodes, noteNode: Node, format: String, path: String, licence: Option[String], index: Boolean, publicUi: Option[String], overridePublished: Option[Long])(implicit neo4j: DatabaseService): Response[(Node, Long, Option[Long], Long)] = {
    val ownerNode = if (ownerNodes.foreignOwner.isDefined) ownerNodes.foreignOwner.get else ownerNodes.user
    if (!ownerNode.hasProperty("handle")){
      fail(INVALID_PARAMETER, ERR_NOTE_NO_HANDLE, "Can not publish because owner does not have a handle")
    }else{
      val handle = ownerNode.getProperty("handle").asInstanceOf[String]

      val pathResult = getPublicItemRevisionNodeByPath(getUUID(ownerNode), path)
      val published: Option[Long] =
        if (pathResult.isRight){
          val publishedNodeRevision = pathResult.right.get
          if (publishedNodeRevision.getRelationships.find(relationship =>
              relationship.getType.name == ItemRelationship.HAS_REVISION.name &&
              relationship.getStartNode != noteNode).isDefined){
            return fail(INVALID_PARAMETER, ERR_NOTE_PATH_IN_USE,
                "Can not publish because given path is already in use with a different item")
          }
          // Republishing the same node with the same path, don't change published timestamp, "modified"
          // indicates edits after publishing
          if (overridePublished.isEmpty) Some(publishedNodeRevision.getProperty("published").asInstanceOf[Long])
          else overridePublished
        }else{
          overridePublished
        }

      val previouslyPublishedRevisionRelationship =
        getPublishedExtendedItemRevisionRelationship(noteNode)
      if (previouslyPublishedRevisionRelationship.isDefined){
        // Previously published, remove it from the index
        val previouslyPublishedRevisionNode = previouslyPublishedRevisionRelationship.get.getEndNode
        val publicRevisionIndex = neo4j.gds.index().forNodes("public")
        publicRevisionIndex.remove(previouslyPublishedRevisionNode)
        // Remove published but leave unpublished timestamp to previous node
        previouslyPublishedRevisionNode.removeProperty("published")
        previouslyPublishedRevisionNode.setProperty("unpublished", System.currentTimeMillis)
      }

      // Create a revision and mark it published
      val latestRevisionRel = getLatestExtendedItemRevisionRelationship(noteNode)
      for{
        note <- toNote(noteNode, ownerNodes, skipParent = true).right
        noteBytes <- Right(pickleNote(getNoteForPickling(note))).right
        noteRevisionNode <- Right(createExtendedItemRevision(noteNode, ownerNodes, ItemLabel.NOTE, noteBytes, latestRevisionRel, base = true)).right
        publishResult <- Right(setNotePublished(getUUID(ownerNode), noteNode, noteRevisionNode, format, path, licence, index, publicUi, published)).right
      } yield (noteRevisionNode, publishResult._1, publishResult._2, publishResult._3)
    }
  }

  protected def setNotePublished(ownerUUID: UUID, noteNode: Node, noteRevisionNode: Node, format: String, path: String, licence: Option[String], index: Boolean, publicUi: Option[String], overridePublished: Option[Long])(implicit neo4j: DatabaseService): (Long, Option[Long], Long) = {
    val publishedTimestamp = if (overridePublished.isDefined) overridePublished.get else System.currentTimeMillis()
    // Set path
    noteNode.setProperty("path", path)

    // Set format
    noteNode.setProperty("format", format)

    // Set licence
    if (licence.isDefined)
      noteNode.setProperty("licence", licence.get.toString)
    else if (noteNode.hasProperty("licence"))
      noteNode.removeProperty("licence")

    // Set indexed property, can be set only once per note
    val indexed =
      if (index && licence.isDefined){
        if (!noteNode.hasProperty("indexed")){
          noteNode.setProperty("indexed", publishedTimestamp)
          Some(publishedTimestamp)
        }else{
          None
        }
      }else if (!index && noteNode.hasProperty("indexed")){
        noteNode.removeProperty("indexed")
        None
      }else{
        None
      }

    // Set published timestamp to revision
    noteRevisionNode.setProperty("published", publishedTimestamp)

    // Create a short id for the note when it is published
    val sid: Long =
      if (!noteNode.hasProperty("sid")){
        val shortId:Long = generateShortId
        noteNode.setProperty("sid", shortId)
        shortId
      }else{
        noteNode.getProperty("sid").asInstanceOf[Long]
      }

    // Set or remove publicUi field
    if (publicUi.isDefined) noteNode.setProperty("publicUi", publicUi.get)
    else if (noteNode.hasProperty("publicUi")) noteNode.removeProperty("publicUi")

    (publishedTimestamp, indexed, sid)
  }

  protected def unpublishNoteNode(noteNode: Node)(implicit neo4j: DatabaseService): Unit = {
    val publishedRevision = getPublishedExtendedItemRevisionRelationship(noteNode)
    if (publishedRevision.isDefined){
      // Remove publish info also from the revision
      if (publishedRevision.isDefined){
        val noteRevisionNode = publishedRevision.get.getEndNode
        noteRevisionNode.removeProperty("published")
        // Add an unpublished timestamp to the revision node, and mark it as unpublished in the
        // index. NOTE: unpublished is not needed in the note as the unpublished information
        // is only used when getting modified public items. Unpublished revisions are purged from
        // the index at specific intervals, see AdminActions.tick().
        val publicRevisionIndex = neo4j.gds.index().forNodes("public")
        publicRevisionIndex.add(noteRevisionNode, "unpublished", true)
        val currentTime = System.currentTimeMillis
        noteRevisionNode.setProperty("unpublished", currentTime);
        publicRevisionIndex.remove(noteRevisionNode, "modified")
        publicRevisionIndex.add(noteRevisionNode, "modified", new ValueContext(currentTime).indexNumeric())
      }
    }
  }

  protected def validateNoteConvertable(noteNode: Node)(implicit neo4j: DatabaseService): Response[Unit] = {
    // Can't convert note that has been published
    if (getPublishedExtendedItemRevisionRelationship(noteNode).isDefined)
      fail(INVALID_PARAMETER, ERR_NOTE_CONVERT_PUBLISHED, "Can not convert a note that has been published")
    else
      Right()
  }

  protected def evaluateNoteRevision(note: Note, noteNode: Node, ownerNodes: OwnerNodes, force: Boolean = false): Option[Long] = {
    withTx {
      implicit neo4j =>
        evaluateNeedForRevision(note.revision, noteNode, ownerNodes, force).flatMap(latestRevisionRel => {
          val noteBytes = pickleNote(getNoteForPickling(note))
          val revisionNode = createExtendedItemRevision(noteNode, ownerNodes, ItemLabel.NOTE, noteBytes, latestRevisionRel)
          Some(revisionNode.getProperty("number").asInstanceOf[Long])
        })
    }
  }

  private def getNoteForPickling(note: Note): Note = {
    // Create a revision containing only the fields that can be set using putExistingNote
    note.copy(
      modified = None,
      archived = None,
      deleted = None,
      creator = None,
      favorited = None,
      revision = None,
      visibility = None,
      relationships =
        if (note.relationships.isDefined)
          Some(note.relationships.get.copy(
              assigner = None,
              origin = None))
        else None)
  }

  protected def noteToPreviewItem(ownerNode: Node, noteNode: Node, displayOwner: String)(implicit neo4j: DatabaseService): Response[PublicItem] = {
    val owner = Owner(getUUID(ownerNode), None, Token.ANONYMOUS)

    for {
      tagRels <- getTagRelationships(noteNode, OwnerNodes(ownerNode, None)).right
      note <- toNote(noteNode, owner, tagRelationships=Some(tagRels), skipParent=true).right
      tagsResult <- getTagsWithParents(tagRels, owner, noUi=true).right
      assignee <- Right(getAssignee(noteNode)).right
    } yield PublicItem(
        displayOwner,
        getOwnerType(ownerNode),
        stripNonPublicFieldsFromNote(note),
        tagsResult._1,
        tagsResult._2,
        assignee,
        getBlacklisted(ownerNode))
  }

  protected def noteRevisionToPublicItem(ownerNode: Node, noteRevisionNode: Node, displayOwner: String, includeOnlyTagsByOwner: Option[UUID] = None, allowUnpublished: Boolean = false)(implicit neo4j: DatabaseService): Response[PublicItem] = {
    val owner = Owner(getUUID(ownerNode), None, Token.ANONYMOUS)
    if (!allowUnpublished && !noteRevisionNode.hasProperty("published"))
      return fail(INTERNAL_SERVER_ERROR, ERR_ITEM_REVISION_NOT_PUBLISED, "Note revision is not published")
    val published = if (allowUnpublished && !noteRevisionNode.hasProperty("published")) None else Some(noteRevisionNode.getProperty("published").asInstanceOf[Long])
    val modified = noteRevisionNode.getProperty("modified").asInstanceOf[Long]
    val publishedRevision = noteRevisionNode.getProperty("number").asInstanceOf[Long]
    val revisionRelationship = noteRevisionNode.getRelationships().find (relationship => relationship.getType.name == ItemRelationship.HAS_REVISION.name)
    if (revisionRelationship.isEmpty)
      return fail(INTERNAL_SERVER_ERROR, ERR_ITEM_NO_REVISION_RELATIONSHIP, "Note revision does not have a master")
    if (!revisionRelationship.get.getStartNode.hasProperty("path"))
      return fail(INTERNAL_SERVER_ERROR, ERR_NOTE_NO_PATH, "Published note is missing path")
    val noteNode = revisionRelationship.get.getStartNode
    val path = noteNode.getProperty("path").asInstanceOf[String]

    val shortId =
      if (noteNode.hasProperty("sid"))
        Some(IdUtils.getShortIdAsString(noteNode.getProperty("sid").asInstanceOf[Long]))
      else
        None
    val publicUi =
      if (noteNode.hasProperty("publicUi"))
        Some(noteNode.getProperty("publicUi").asInstanceOf[String])
      else
        None
    val licence =
      if (revisionRelationship.get.getStartNode.hasProperty("licence"))
        Some(revisionRelationship.get.getStartNode.getProperty("licence").asInstanceOf[String])
      else None

    val indexed = if (noteNode.hasProperty("indexed")) Some(noteNode.getProperty("indexed").asInstanceOf[Long]) else None

    for {
      unprocessedNote <- unpickleNote(noteRevisionNode.getProperty("data").asInstanceOf[Array[Byte]]).right
      note <- Right(validateNote(ownerNode, stripNonPublicFieldsFromNote(unprocessedNote))).right
      tagsResult <- getExtendedItemTagsWithParents(note, owner, public=true, includeOnlyTagsByOwner).right
      assignee <- getAssignee(note).right
    } yield PublicItem(
        displayOwner,
        getOwnerType(ownerNode),
        note.copy(modified = Some(modified),
                  visibility = Some(SharedItemVisibility(published, Some(path), licence, indexed, Some(publishedRevision), shortId, publicUi, None, None, None, None))),
        tagsResult._1,
        tagsResult._2,
        assignee,
        getBlacklisted(ownerNode))
  }

  protected def stripNonPublicFieldsFromNote(note: Note): Note ={
    note.copy(archived=None, favorited=None, ui=None, relationships = {
      if (note.relationships.isDefined){
        val rels = note.relationships.get
        if (rels.assignee.isDefined || rels.tags.isDefined || rels.collectiveTags.isDefined)
          Some(rels.copy(parent = None, origin = None, assigner = None))
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
