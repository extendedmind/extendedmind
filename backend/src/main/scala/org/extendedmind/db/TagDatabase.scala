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
import org.neo4j.graphdb.Direction
import org.neo4j.graphdb.RelationshipType
import org.neo4j.graphdb.Node
import org.neo4j.graphdb.traversal.Evaluators
import org.neo4j.graphdb.traversal.TraversalDescription
import org.neo4j.scala.DatabaseService
import scala.collection.mutable.ListBuffer
import org.neo4j.graphdb.traversal.Evaluation
import org.neo4j.graphdb.Relationship
import org.neo4j.graphdb.PathExpander

trait TagDatabase extends AbstractGraphDatabase with ItemDatabase {

  // PUBLIC

  def putNewTag(owner: Owner, tag: Tag): Response[SetResult] = {
    for {
      tagResult <- putNewTagNode(owner, tag).right
      unit <- Right(addToItemsIndex(owner, tagResult._1, tagResult._2)).right
    } yield tagResult._2
  }

  def putExistingTag(owner: Owner, tagUUID: UUID, tag: Tag): Response[SetResult] = {
    for {
      tagResult <- putExistingTagNode(owner, tagUUID, tag).right
      unit <- Right(updateItemsIndex(tagResult._1, tagResult._2)).right
    } yield tagResult._2
  }

  def getTag(owner: Owner, tagUUID: UUID): Response[Tag] = {
    withTx {
      implicit neo =>
        for {
          tagNode <- getItemNode(getOwnerUUID(owner), tagUUID, Some(ItemLabel.TAG)).right
          tag <- toTag(tagNode, owner).right
        } yield tag
    }
  }

  def deleteTag(owner: Owner, tagUUID: UUID): Response[DeleteItemResult] = {
    for {
      deleteTagResult <- deleteTagNode(owner, tagUUID).right
      unit <- Right(updateItemsIndex(deleteTagResult._1, deleteTagResult._2.result)).right
      unit <- Right(updateItemsIndex(deleteTagResult._3, deleteTagResult._2.result)).right
    } yield deleteTagResult._2
  }

  def undeleteTag(owner: Owner, tagUUID: UUID): Response[SetResult] = {
    for {
      undeleteTagResult <- undeleteTagNode(owner, tagUUID).right
      result <- Right(getSetResult(undeleteTagResult._1, false)).right
      unit <- Right(updateItemsIndex(undeleteTagResult._1, result)).right
      unit <- Right(updateItemsIndex(undeleteTagResult._2, result)).right
    } yield result
  }

  // PRIVATE

  protected def putExistingTagNode(owner: Owner, tagUUID: UUID, tag: Tag):
        Response[(Node, SetResult)] = {
    val subLabel = if (tag.tagType.get == CONTEXT) Some(TagLabel.CONTEXT)
                   else if (tag.tagType.get == KEYWORD) Some(TagLabel.KEYWORD)
                   else Some(TagLabel.HISTORY)
    val subLabelAlternative =
      if (tag.tagType.get == CONTEXT)
        Some(scala.List(TagLabel.KEYWORD, TagLabel.HISTORY))
      else if (tag.tagType.get == KEYWORD)
        Some(scala.List(TagLabel.CONTEXT, TagLabel.HISTORY))
      else // history
        Some(scala.List(TagLabel.CONTEXT, TagLabel.KEYWORD))

    withTx {
      implicit neo4j =>
        for {
          ownerNodes <- getOwnerNodes(owner).right
          tagResult <- updateItem(owner, tagUUID, tag, Some(ItemLabel.TAG), subLabel, subLabelAlternative, tag.modified).right
          result <- setTagParentNodes(tagResult._1, ownerNodes, tag).right
        } yield tagResult
    }
  }

  def putNewTagNode(owner: Owner, tag: Tag):
          Response[(Node, SetResult)] = {
    withTx {
      implicit neo4j =>
        for {
          ownerNodes <- getOwnerNodes(owner).right
          tagResult <- createItem(owner, tag, Some(ItemLabel.TAG),
                         (if (tag.tagType.get == CONTEXT) Some(TagLabel.CONTEXT)
                          else if (tag.tagType.get == KEYWORD) Some(TagLabel.KEYWORD)
                          else Some(TagLabel.HISTORY))
                         ).right
          unit <- setTagParentNodes(tagResult._1, ownerNodes, tag).right
        } yield tagResult
    }
  }

  protected def setTagParentNodes(tagNode: Node,  ownerNodes: OwnerNodes, tag: Tag)(implicit neo4j: DatabaseService):
          Response[Option[Long]] = {
    for {
      oldParentRelationship <- Right(getItemRelationship(tagNode, ownerNodes, ItemRelationship.HAS_PARENT, ItemLabel.TAG)).right
      result <- setParentRelationship(tagNode, ownerNodes, tag.parent, oldParentRelationship, ItemLabel.TAG, skipParentHistoryTag = true).right
    }yield result
  }

  override def toTag(tagNode: Node, owner: Owner)
            (implicit neo4j: DatabaseService): Response[Tag] = {
    for {
      tag <- toCaseClass[Tag](tagNode).right
      completeTag <- addTransientTagProperties(tagNode, owner, tag).right
    } yield completeTag
  }

  protected def addTransientTagProperties(tagNode: Node, owner: Owner, tag: Tag)
            (implicit neo4j: DatabaseService): Response[Tag] = {
    for {
      ownerNodes <- getOwnerNodes(owner).right
      parent <- Right(getItemRelationship(tagNode, ownerNodes, ItemRelationship.HAS_PARENT, ItemLabel.TAG)).right
      completeTag <- Right(tag.copy(
        creator = getItemCreatorUUID(tagNode),
        tagType = (if (tagNode.hasLabel(TagLabel.CONTEXT)) Some(CONTEXT)
                   else if (tagNode.hasLabel(TagLabel.KEYWORD)) Some(KEYWORD)
                   else Some(HISTORY)),
        parent = (if (parent.isEmpty) None else (Some(getUUID(parent.get.getEndNode())))))).right
    } yield completeTag
  }

  protected def deleteTagNode(owner: Owner, tagUUID: UUID): Response[(Node, DeleteItemResult, scala.List[Node])] = {
    withTx {
      implicit neo =>
        for {
          tagNode <- getItemNode(getOwnerUUID(owner), tagUUID, Some(ItemLabel.TAG), acceptDeleted = true).right
          deleted <- Right(deleteItem(tagNode)).right
          childrenAndTagged <- getChildrenAndTagged(owner, tagNode).right
        } yield (tagNode, deleted, childrenAndTagged)
    }
  }

  protected def undeleteTagNode(owner: Owner, tagUUID: UUID): Response[(Node, scala.List[Node])] = {
    withTx {
      implicit neo =>
        for {
          tagNode <- getItemNode(getOwnerUUID(owner), tagUUID, Some(ItemLabel.TAG), acceptDeleted = true).right
          unit <- validateTagUndeletable(tagNode).right
          success <- Right(undeleteItem(tagNode)).right
          childrenAndTagged <- getChildrenAndTagged(owner, tagNode).right
        } yield (tagNode, childrenAndTagged)
    }
  }

  protected def getChildrenAndTagged(owner: Owner, tagNode: Node)
            (implicit neo4j: DatabaseService): Response[scala.List[Node]] = {
    for {
      childNodes <- Right(getChildren(tagNode, None, true)).right
      taggedItems <- Right(getTaggedItems(tagNode, true)).right
      childrenAndTagged <- Right(scala.List.concat(childNodes, taggedItems)).right
    } yield childrenAndTagged
  }

  protected def validateTagUndeletable(tagNode: Node)(implicit neo4j: DatabaseService): Response[Unit] = {
    if (tagNode.hasLabel(TagLabel.HISTORY))
      fail(INVALID_PARAMETER, ERR_TAG_UNDELETE_HISTORY, "Can't undelete history tag")
    else Right()
  }
}