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

  def putNewTag(userUUID: UUID, tag: Tag): Response[SetResult] = {
    for {
      tagNode <- putNewTagNode(userUUID, tag).right
      result <- Right(getSetResult(tagNode, true)).right
    } yield result
  }
  
  def putExistingTag(userUUID: UUID, tagUUID: UUID, tag: Tag): Response[SetResult] = {
    for {
      tagNode <- putExistingTagNode(userUUID, tagUUID, tag).right
      result <- Right(getSetResult(tagNode, false)).right
    } yield result
  }

  def getTag(userUUID: UUID, tagUUID: UUID): Response[Tag] = {
    withTx {
      implicit neo =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          tagNode <- getItemNode(userNode, tagUUID, Some(ItemLabel.TAG)).right
          tag <- toTag(tagNode, userUUID).right
        } yield tag
    }
  }
  
  // PRIVATE

  protected def putExistingTagNode(userUUID: UUID, tagUUID: UUID, tag: Tag): 
        Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          tagNode <- updateItem(userUUID, tagUUID, tag, Some(ItemLabel.TAG), 
              (if (tag.tagType == CONTEXT) Some((TagLabel.CONTEXT, TagLabel.KEYWORD)) 
                 else Some((TagLabel.KEYWORD, TagLabel.CONTEXT)))
              ).right
          parentNode <- setTagParentNodes(tagNode, userUUID, tag).right
        } yield tagNode
    }
  }
  
  def putNewTagNode(userUUID: UUID, tag: Tag): 
          Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          tagNode <- createItem(userUUID, tag, Some(ItemLabel.TAG),
                         (if (tag.tagType == CONTEXT) Some(TagLabel.CONTEXT) else Some(TagLabel.KEYWORD))              
                         ).right
          parentNodes <- setTagParentNodes(tagNode, userUUID, tag).right
        } yield tagNode
    }
  }
  
  protected def setTagParentNodes(tagNode: Node,  userUUID: UUID, tag: Tag)(implicit neo4j: DatabaseService): 
          Response[Option[Relationship]] = {
    for {
      userNode <- getNode(userUUID, OwnerLabel.USER).right
      oldParentRelationships <- getParentRelationships(tagNode, userUUID).right
      newParentRelationship <- setParentRelationship(tagNode, userNode, tag.parent, 
          oldParentRelationships._3, ItemLabel.TAG).right
      parentRelationship <- Right(newParentRelationship).right
    }yield parentRelationship
  }
  
  
  override def toTag(tagNode: Node, userUUID: UUID)
            (implicit neo4j: DatabaseService): Response[Tag] = {
    for {
      tag <- toCaseClass[Tag](tagNode).right
      completeTag <- addTransientTagProperties(tagNode, userUUID, tag).right
    } yield completeTag
  }

  protected def addTransientTagProperties(tagNode: Node, userUUID: UUID, tag: Tag)
            (implicit neo4j: DatabaseService): Response[Tag] = {
    for {
      parents <- getParentRelationships(tagNode, userUUID).right
      completeTag <- Right(tag.copy(
        tagType = (if (tagNode.hasLabel(TagLabel.CONTEXT)) Some(CONTEXT) else Some(KEYWORD)),
        parent = (if (parents._3.isEmpty) None else (Some(getUUID(parents._3.get.getEndNode())))))).right
    } yield completeTag
  }
 
}