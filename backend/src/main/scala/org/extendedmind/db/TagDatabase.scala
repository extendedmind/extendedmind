package org.extendedmind.db

import java.util.UUID
import scala.collection.JavaConversions.iterableAsScalaIterable
import org.extendedmind.Response._
import org.extendedmind._
import org.extendedmind.domain._
import org.extendedmind.security._
import org.neo4j.graphdb.Direction
import org.neo4j.graphdb.DynamicRelationshipType
import org.neo4j.graphdb.Node
import org.neo4j.graphdb.traversal.Evaluators
import org.neo4j.graphdb.traversal.TraversalDescription
import org.neo4j.kernel.Traversal
import org.neo4j.scala.DatabaseService
import scala.collection.mutable.ListBuffer
import org.neo4j.graphdb.traversal.Evaluation
import org.neo4j.kernel.OrderedByTypeExpander
import org.neo4j.graphdb.Relationship
import org.neo4j.graphdb.PathExpander
import org.neo4j.kernel.Uniqueness

trait TagDatabase extends AbstractGraphDatabase with ItemDatabase {

  // PUBLIC

  def putNewTag(owner: Owner, tag: Tag): Response[SetResult] = {
    for {
      tagNode <- putNewTagNode(owner, tag).right
      result <- Right(getSetResult(tagNode, true)).right
      unit <- Right(addToItemsIndex(owner, tagNode, result)).right
    } yield result
  }
  
  def putExistingTag(owner: Owner, tagUUID: UUID, tag: Tag): Response[SetResult] = {
    for {
      tagNode <- putExistingTagNode(owner, tagUUID, tag).right
      result <- Right(getSetResult(tagNode, false)).right
      unit <- Right(updateItemsIndex(tagNode, result)).right
    } yield result
  }

  def getTag(owner: Owner, tagUUID: UUID): Response[Tag] = {
    withTx {
      implicit neo =>
        for {
          tagNode <- getItemNode(owner, tagUUID, Some(ItemLabel.TAG)).right
          tag <- toTag(tagNode, owner).right
        } yield tag
    }
  }
  
  def deleteTag(owner: Owner, tagUUID: UUID): Response[DeleteItemResult] = {
    for {
      deletedTagNode <- deleteTagNode(owner, tagUUID).right
      result <- Right(getDeleteItemResult(deletedTagNode._1, deletedTagNode._2)).right
      unit <- Right(updateItemsIndex(deletedTagNode._1, result.result)).right
    } yield result
  }
  
  // PRIVATE

  protected def putExistingTagNode(owner: Owner, tagUUID: UUID, tag: Tag): 
        Response[Node] = {
    val subLabel = if (tag.tagType == CONTEXT) Some(TagLabel.CONTEXT) else Some(TagLabel.KEYWORD)
    val subLabelAlternative = if (tag.tagType == CONTEXT) Some(scala.List(TagLabel.KEYWORD)) else Some(scala.List(TagLabel.CONTEXT))
    withTx {
      implicit neo4j =>
        for {
          tagNode <- updateItem(owner, tagUUID, tag, Some(ItemLabel.TAG), subLabel, subLabelAlternative).right
          parentNode <- setTagParentNodes(tagNode, owner, tag).right
        } yield tagNode
    }
  }
  
  def putNewTagNode(owner: Owner, tag: Tag): 
          Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          tagNode <- createItem(owner, tag, Some(ItemLabel.TAG),
                         (if (tag.tagType.get == CONTEXT) Some(TagLabel.CONTEXT) else Some(TagLabel.KEYWORD))              
                         ).right
          parentNodes <- setTagParentNodes(tagNode, owner, tag).right
        } yield tagNode
    }
  }
  
  protected def setTagParentNodes(tagNode: Node,  owner: Owner, tag: Tag)(implicit neo4j: DatabaseService): 
          Response[Option[Relationship]] = {
    for {
      oldParentRelationship <- getItemRelationship(tagNode, owner, ItemRelationship.HAS_PARENT, ItemLabel.TAG).right
      newParentRelationship <- setParentRelationship(tagNode, owner, tag.parent, 
          oldParentRelationship, ItemLabel.TAG).right
      parentRelationship <- Right(newParentRelationship).right
    }yield parentRelationship
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
      parent <- getItemRelationship(tagNode, owner, ItemRelationship.HAS_PARENT, ItemLabel.TAG).right
      completeTag <- Right(tag.copy(
        tagType = (if (tagNode.hasLabel(TagLabel.CONTEXT)) Some(CONTEXT) else Some(KEYWORD)),
        parent = (if (parent.isEmpty) None else (Some(getUUID(parent.get.getEndNode())))))).right
    } yield completeTag
  }
 
  protected def deleteTagNode(owner: Owner, tagUUID: UUID): Response[Tuple2[Node, Long]] = {
    withTx {
      implicit neo =>
        for {
          tagNode <- getItemNode(owner, tagUUID, Some(ItemLabel.TAG)).right
          deleted <- Right(deleteItem(tagNode)).right
        } yield (tagNode, deleted)
    }
  }

  
}