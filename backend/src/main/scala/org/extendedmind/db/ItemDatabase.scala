/**
 * Copyright (c) 2013-2014 Extended Mind Technologies Oy
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
import org.neo4j.graphdb.traversal.Uniqueness
import org.neo4j.graphdb.traversal.TraversalDescription
import org.neo4j.kernel.Traversal
import org.neo4j.scala.DatabaseService
import scala.collection.mutable.ListBuffer
import org.neo4j.graphdb.traversal.Evaluation
import org.neo4j.kernel.OrderedByTypeExpander
import org.neo4j.graphdb.Relationship
import org.neo4j.graphdb.PathExpander
import org.neo4j.index.lucene.ValueContext
import org.neo4j.graphdb.index.Index
import org.neo4j.graphdb.RelationshipType
import org.neo4j.index.lucene.QueryContext
import org.apache.lucene.search.TermQuery
import org.apache.lucene.index.Term
import org.apache.lucene.search.NumericRangeQuery
import org.apache.lucene.search.BooleanQuery
import org.apache.lucene.search.BooleanClause
import spray.util.LoggingContext

trait ItemDatabase extends UserDatabase {

  // Item stays deleted for 30 days before it is destroyed
  val DESTROY_TRESHOLD: Long = 2592000000l

  // PUBLIC

  def putNewItem(owner: Owner, item: Item): Response[SetResult] = {
    for {
      itemNode <- createItem(owner, item).right
      result <- Right(getSetResult(itemNode, true)).right
      unit <- Right(addToItemsIndex(owner, itemNode, result)).right
    } yield result
  }

  def putExistingItem(owner: Owner, itemUUID: UUID, item: Item): Response[SetResult] = {
    for {
      itemNode <- updateItem(owner, itemUUID, item).right
      result <- Right(getSetResult(itemNode, false)).right
      unit <- Right(updateItemsIndex(itemNode, result)).right
    } yield result
  }

  def getItem(owner: Owner, itemUUID: UUID): Response[Item] = {
    withTx {
      implicit neo =>
        for {
          itemNode <- getItemNode(owner, itemUUID).right
          item <- toCaseClass[Item](itemNode).right
        } yield item
    }
  }

  def getItems(owner: Owner, modified: Option[Long], active: Boolean, deleted: Boolean, archived: Boolean, completed: Boolean)(implicit log: LoggingContext): Response[Items] = {
    withTx {
      implicit neo =>
        for {
          ownerUUID <- Right(getOwnerUUID(owner)).right
          itemNodes <- getItemNodes(ownerUUID, modified, active, deleted, archived, completed).right
          items <- getItems(itemNodes, owner).right
        } yield items
    }
  }

  def deleteItem(owner: Owner, itemUUID: UUID): Response[DeleteItemResult] = {
    for {
      deletedItemNode <- deleteItemNode(owner, itemUUID).right
      result <- Right(getDeleteItemResult(deletedItemNode._1, deletedItemNode._2)).right
      unit <- Right(updateItemsIndex(deletedItemNode._1, result.result)).right
    } yield result
  }

  def undeleteItem(owner: Owner, itemUUID: UUID, mandatoryLabel: Option[Label] = None): Response[SetResult] = {
    for {
      itemNode <- undeleteItemNode(owner, itemUUID, mandatoryLabel).right
      result <- Right(getSetResult(itemNode, false)).right
      unit <- Right(updateItemsIndex(itemNode, result)).right
    } yield result
  }

  def destroyDeletedItems(owner: Owner): Response[CountResult] = {
    withTx {
      implicit neo4j =>
        for {
          ownerNodes <- getOwnerNodes(owner).right
          deleteResult <- Right(destroyDeletedItems(ownerNodes)).right
        } yield deleteResult
    }
  }

  def rebuildItemsIndex(ownerUUID: UUID): Response[CountResult] = {
    withTx {
      implicit neo4j =>
        for {
          ownerNode <- getNode(ownerUUID, MainLabel.OWNER).right
          result <- rebuildItemsIndex(ownerNode).right
        } yield result
    }
  }
  
  def rebuildItemsIndexes: Response[CountResult] = {
    for {
      ownerUUIDs <- getOwnerUUIDs.right
      count <- rebuildItemsIndexes(ownerUUIDs).right
    } yield count
  }

  // PRIVATE

  protected def getSharedListAccessRight(sharedLists: Map[UUID,(String, Byte)], relationships: Option[ExtendedItemRelationships]): Option[Byte] = {
    // Need to use list access rights
    if (relationships.isEmpty || relationships.get.parent.isEmpty){
      None
    }else{
      val listAccessRight = sharedLists.get(relationships.get.parent.get)
      if (listAccessRight.isEmpty){
        None
      }else{
        Some(listAccessRight.get._2)
      }
    }
  }
  
  protected def getItems(itemNodes: Iterable[Node], owner: Owner)(implicit neo4j: DatabaseService, log: LoggingContext): Response[Items] = {
    val itemBuffer = new ListBuffer[Item]
    val taskBuffer = new ListBuffer[Task]
    val noteBuffer = new ListBuffer[Note]
    val listBuffer = new ListBuffer[List]
    val tagBuffer = new ListBuffer[Tag]

    itemNodes foreach (itemNode =>
      if (itemNode.hasLabel(ItemLabel.NOTE)) {
        val note = toNote(itemNode, owner)
        if (note.isLeft) {
          return fail(INTERNAL_SERVER_ERROR, ERR_ITEM_TO_NOTE, note.left.get.toString)
        }
        noteBuffer.append(note.right.get)
      } else if (itemNode.hasLabel(ItemLabel.TASK)) {
        val task = toTask(itemNode, owner)
        if (task.isLeft) {
          return fail(INTERNAL_SERVER_ERROR, ERR_ITEM_TO_TASK, task.left.get.toString)
        }
        taskBuffer.append(task.right.get)
      } else if (itemNode.hasLabel(ItemLabel.LIST)) {
        val list = toList(itemNode, owner)
        if (list.isLeft) {
          return fail(INTERNAL_SERVER_ERROR, ERR_ITEM_TO_LIST, list.left.get.toString)
        }
        listBuffer.append(list.right.get)
      } else if (itemNode.hasLabel(ItemLabel.TAG)) {
        val tag = toTag(itemNode, owner)
        if (tag.isLeft) {
          return fail(INTERNAL_SERVER_ERROR, ERR_ITEM_TO_TAG, tag.left.get.toString)
        }
        tagBuffer.append(tag.right.get)
      } else if (itemNode.hasLabel(MainLabel.ITEM)) {
        val item = toCaseClass[Item](itemNode)
        if (item.isLeft) {
          return fail(INTERNAL_SERVER_ERROR, ERR_ITEM_TO_ITEM,  "Could not convert node to Item with error: " + item.left.get)
        }
        itemBuffer.append(item.right.get)
      } else {
        val labels = itemNode.getLabels().toList.foldLeft("") {
          ((acc, n) =>
            acc + ", " + n.name())
        }
        log.warning("Owner " + getOwnerUUID(owner) + " has node " + itemNode.getId() + " with labels " + labels +
          " that was found in the items index")
      })
    Right(Items(
      if (itemBuffer.isEmpty) None else Some(itemBuffer.toList),
      if (taskBuffer.isEmpty) None else Some(taskBuffer.toList),
      if (noteBuffer.isEmpty) None else Some(noteBuffer.toList),
      if (listBuffer.isEmpty) None else Some(listBuffer.toList),
      if (tagBuffer.isEmpty) None else Some(tagBuffer.toList)))
  }

  // Methods for converting tasks and nodes
  def toTask(taskNode: Node, owner: Owner)(implicit neo4j: DatabaseService): Response[Task];
  def toNote(noteNode: Node, owner: Owner)(implicit neo4j: DatabaseService): Response[Note];
  def toTag(tagNode: Node, owner: Owner)(implicit neo4j: DatabaseService): Response[Tag];
  def toList(listNode: Node, owner: Owner)(implicit neo4j: DatabaseService): Response[List];

  protected def getItemNodes(ownerUUID: UUID, modified: Option[Long], active: Boolean, deleted: Boolean, archived: Boolean, completed: Boolean)(implicit neo4j: DatabaseService): Response[Iterable[Node]] = {
    val itemsIndex = neo4j.gds.index().forNodes("items")

    val itemNodeList =
      if (modified.isDefined) {
        val ownerQuery = new TermQuery(new Term("owner", UUIDUtils.getTrimmedBase64UUID(ownerUUID)))
        val modifiedRangeQuery = NumericRangeQuery.newLongRange("modified", 8, modified.get, null, false, false)
        val combinedQuery = new BooleanQuery;
        combinedQuery.add(ownerQuery, BooleanClause.Occur.MUST);
        combinedQuery.add(modifiedRangeQuery, BooleanClause.Occur.MUST);
        itemsIndex.query(combinedQuery).toList
      } else {
        itemsIndex.query("owner:\"" + UUIDUtils.getTrimmedBase64UUID(ownerUUID) + "\"").toList
      }

    if (!itemNodeList.isEmpty && (!active || !deleted || !archived || !completed)) {
      // Filter out active, deleted, archived and/or completed
      Right(itemNodeList filter (itemNode => {
        var include = true
        if (!deleted && itemNode.hasProperty("deleted")) include = false
        if (include && !archived && itemNode.hasProperty("archived") && !itemNode.hasProperty("favorited")) include = false
        if (include && !completed && itemNode.hasProperty("completed")) include = false
        if (include && !active &&
          (!itemNode.hasProperty("deleted") && !itemNode.hasProperty("archived") && !itemNode.hasProperty("completed"))) {
          include = false
        }
        include
      }))
    } else {
      Right(itemNodeList)
    }
  }

  protected def itemsTraversal(implicit neo4j: DatabaseService): TraversalDescription = {
    neo4j.gds.traversalDescription()
      .relationships(DynamicRelationshipType.withName(SecurityRelationship.OWNS.name),
        Direction.OUTGOING)
      .depthFirst()
      .evaluator(Evaluators.excludeStartPosition())
      .evaluator(LabelEvaluator(scala.List(MainLabel.ITEM)))
  }

  
  protected def createItem(owner: Owner, item: AnyRef,
    extraLabel: Option[Label] = None, extraSubLabel: Option[Label] = None): Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          ownerNodes <- getOwnerNodes(owner).right
          itemNode <- createItem(ownerNodes, item, extraLabel, extraSubLabel).right
        } yield itemNode
    }
  }

  protected def getOwnerNodes(owner: Owner)(implicit neo4j: DatabaseService): Response[OwnerNodes] = {
    for {
      userNode <- getNode(owner.userUUID, OwnerLabel.USER).right
      foreignOwnerNode <- getNodeOption(owner.foreignOwnerUUID, OwnerLabel.COLLECTIVE).right
    } yield OwnerNodes(userNode, foreignOwnerNode)
  }

  protected def createItem(ownerNodes: OwnerNodes, item: AnyRef, extraLabel: Option[Label], extraSubLabel: Option[Label])(implicit neo4j: DatabaseService): Response[Node] = {
    val itemNode = createNode(item, MainLabel.ITEM)
    if (extraLabel.isDefined) {
      itemNode.addLabel(extraLabel.get)
      if (extraSubLabel.isDefined) {
        itemNode.addLabel(extraSubLabel.get)
      }
    }
    if (ownerNodes.foreignOwner.isDefined) {
      // Foreign owner is the owner, user the creator
      ownerNodes.foreignOwner.get --> SecurityRelationship.OWNS --> itemNode
      ownerNodes.user --> SecurityRelationship.IS_CREATOR --> itemNode
    } else {
      // User is the owner
      ownerNodes.user --> SecurityRelationship.OWNS --> itemNode
    }

    Right(itemNode)
  }

  protected def updateItem(owner: Owner, itemUUID: UUID, item: AnyRef,
    additionalLabel: Option[Label] = None,
    additionalSubLabel: Option[Label] = None,
    additionalSubLabelAlternatives: Option[scala.List[Label]] = None): Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          itemNode <- getItemNode(owner, itemUUID, exactLabelMatch = false).right
          itemNode <- Right(setLabel(itemNode, additionalLabel, additionalSubLabel, additionalSubLabelAlternatives)).right
          itemNode <- updateNode(itemNode, item).right
        } yield itemNode
    }
  }

  protected def setLabel(node: Node, additionalLabel: Option[Label], additionalSubLabel: Option[Label], additionalSubLabelAlternatives: Option[scala.List[Label]])(implicit neo4j: DatabaseService): Node = {
    if (additionalLabel.isDefined && !node.hasLabel(additionalLabel.get)) {
      node.addLabel(additionalLabel.get)
    }
    if (additionalSubLabel.isDefined && !node.hasLabel(additionalSubLabel.get)) {
      node.addLabel(additionalSubLabel.get)
      // Need to remove the alternatives
      if (additionalSubLabelAlternatives.isDefined) {
        additionalSubLabelAlternatives.get foreach (additionalSubLabelAlternative => {
          if (node.hasLabel(additionalSubLabelAlternative))
            node.removeLabel(additionalSubLabelAlternative)
        })
      }
    }
    node
  }

  protected def getItemNode(owner: Owner, itemUUID: UUID, mandatoryLabel: Option[Label] = None,
    acceptDeleted: Boolean = false, exactLabelMatch: Boolean = true)(implicit neo4j: DatabaseService): Response[Node] = {
    val itemNode = if (mandatoryLabel.isDefined) getItemNode(getOwnerUUID(owner), itemUUID, mandatoryLabel.get, acceptDeleted)
    else getItemNode(getOwnerUUID(owner), itemUUID, MainLabel.ITEM, acceptDeleted)
    if (itemNode.isLeft) return itemNode

    // If searching for just ITEM, needs to fail for tasks and notes
    if (exactLabelMatch && mandatoryLabel.isEmpty &&
      (itemNode.right.get.hasLabel(ItemLabel.NOTE)
        || itemNode.right.get.hasLabel(ItemLabel.TASK)
        || itemNode.right.get.hasLabel(ItemLabel.LIST)
        || itemNode.right.get.hasLabel(ItemLabel.TAG))) {
      return fail(INVALID_PARAMETER, ERR_ITEM_ALREADY_EXTENDED, "item already either note, task, list or tag with UUID " + itemUUID)
    }
    itemNode
  }

  protected def getItemNode(ownerUUID: UUID, itemUUID: UUID, label: Label, acceptDeleted: Boolean)(implicit neo4j: DatabaseService): Response[Node] = {
    val itemsIndex = neo4j.gds.index().forNodes("items")
    val itemNodeList = itemsIndex.query("owner:\"" + UUIDUtils.getTrimmedBase64UUID(ownerUUID)
      + "\" AND item:\"" + UUIDUtils.getTrimmedBase64UUID(itemUUID) + "\"").toList
    if (itemNodeList.length == 0) {
      fail(INVALID_PARAMETER, ERR_ITEM_NOT_FOUND, "Could not find item " + itemUUID + " for owner " + ownerUUID)
    } else if (itemNodeList.length == 0) {
      fail(INTERNAL_SERVER_ERROR, ERR_ITEM_MORE_THAN_1, "More than one item found with item " + itemUUID + " and owner + " + ownerUUID)
    } else {
      val itemNode = itemNodeList(0)
      if (!itemNode.hasLabel(label)) {
        fail(INVALID_PARAMETER, ERR_ITEM_NO_LABEL, "Item " + itemUUID + " does not have label " + label.labelName)
      } else if (!acceptDeleted && itemNode.hasProperty("deleted")) {
        fail(INVALID_PARAMETER, ERR_ITEM_DELETED, "Item " + itemUUID + " is deleted")
      } else {
        Right(itemNode)
      }
    }
  }

  protected def putExistingExtendedItem(owner: Owner, itemUUID: UUID, extItem: ExtendedItem, label: Label): Response[(Node, Option[Long])] = {
    withTx {
      implicit neo4j =>
        for {
          itemNode <- updateItem(owner, itemUUID, extItem, Some(label), None, None).right
          archived <- setParentNode(itemNode, owner, extItem.parent).right
          tagNodes <- setTagNodes(itemNode, owner, extItem).right
        } yield (itemNode, archived)
    }
  }

  protected def putNewExtendedItem(owner: Owner, extItem: ExtendedItem, label: Label, subLabel: Option[Label] = None): Response[(Node, Option[Long])] = {
    withTx {
      implicit neo4j =>
        for {
          itemNode <- createItem(owner, extItem, Some(label), subLabel).right
          archived <- setParentNode(itemNode, owner, extItem.parent).right
          tagNodes <- setTagNodes(itemNode, owner, extItem).right
        } yield (itemNode, archived)
    }
  }
  
  protected def putExistingLimitedExtendedItem(owner: Owner, itemUUID: UUID, extItem: LimitedExtendedItem, label: Label): Response[(Node, Option[Long])] = {
    withTx {
      implicit neo4j =>
        for {
          itemNode <- updateItem(owner, itemUUID, extItem, Some(label), None, None).right
          archived <- setParentNode(itemNode, owner, extItem.parent).right
        } yield (itemNode, archived)
    }
  }

  protected def putNewLimitedExtendedItem(owner: Owner, extItem: LimitedExtendedItem, label: Label): Response[(Node, Option[Long])] = {
    withTx {
      implicit neo4j =>
        for {
          itemNode <- createItem(owner, extItem, Some(label)).right
          archived <- setParentNode(itemNode, owner, extItem.parent).right
        } yield (itemNode, archived)
    }
  }
  
  protected def setParentNode(itemNode: Node, owner: Owner, parentUUID: Option[UUID])(implicit neo4j: DatabaseService): Response[Option[Long]] = {
    for {
      oldParentRelationship <- Right(getItemRelationship(itemNode, owner, ItemRelationship.HAS_PARENT, ItemLabel.LIST)).right
      archived <- setParentRelationship(itemNode, owner, parentUUID,
        oldParentRelationship, ItemLabel.LIST).right
    } yield archived
  }

  protected def setParentRelationship(itemNode: Node, owner: Owner, parentUUID: Option[UUID], oldParentRelationship: Option[Relationship],
    parentLabel: Label)(implicit neo4j: DatabaseService): Response[Option[Long]] = {
    if (parentUUID.isDefined) {
      if (oldParentRelationship.isDefined) {
        if (getUUID(oldParentRelationship.get.getEndNode())
          == parentUUID.get) {
          return Right(None)
        } else {
          deleteParentRelationship(oldParentRelationship.get)
        }
      }
      for {
        parentNode <- getItemNode(owner, parentUUID.get, Some(parentLabel)).right
        archived <- createParentRelationship(itemNode, owner, parentNode).right
      } yield archived
    } else {
      if (oldParentRelationship.isDefined) {
        deleteParentRelationship(oldParentRelationship.get)
      }
      Right(None)
    }
  }

  protected def deleteParentRelationship(parentRelationship: Relationship)(implicit neo4j: DatabaseService): Unit = {
    val itemNode = parentRelationship.getStartNode()
    // When deleting a relationship to a parent list, item is no longer archived
    if (itemNode.hasProperty("archived") && !itemNode.hasLabel(ItemLabel.LIST)) itemNode.removeProperty("archived")
    parentRelationship.delete()
  }

  protected def hasChildren(itemNode: Node, label: Option[Label])(implicit neo4j: DatabaseService): Boolean = {
    if (getChildren(itemNode, label).length > 0)
      true
    else
      false
  }

  protected def getChildren(itemNode: Node, label: Option[Label], includeDeleted: Boolean = false)(implicit neo4j: DatabaseService): scala.List[Node] = {
    val itemsFromParentSkeleton: TraversalDescription =
      neo4j.gds.traversalDescription()
        .depthFirst()
        .relationships(DynamicRelationshipType.withName(ItemRelationship.HAS_PARENT.name), Direction.INCOMING)
        .evaluator(Evaluators.excludeStartPosition())
        .depthFirst()
        .evaluator(Evaluators.toDepth(1))

    val itemsFromParent = {
      if (includeDeleted) {
        itemsFromParentSkeleton
      } else {
        itemsFromParentSkeleton.evaluator(PropertyEvaluator(
          MainLabel.ITEM, "deleted",
          Evaluation.EXCLUDE_AND_PRUNE,
          Evaluation.INCLUDE_AND_CONTINUE))
      }
    }

    if (label.isDefined) itemsFromParent.evaluator(LabelEvaluator(scala.List(label.get))).traverse(itemNode).nodes().toList
    else itemsFromParent.traverse(itemNode).nodes().toList
  }
  
  protected def getParentRelationship(itemNode: Node)(implicit neo4j: DatabaseService): Option[Relationship] = {
    itemNode.getRelationships.find { relationship => {
      relationship.getEndNode.getId != itemNode.getId && relationship.getType.name == ItemRelationship.HAS_PARENT.name
    }}
  }
  
  protected def isUniqueParent(itemNode: Node, itemsInPath: ListBuffer[Long])(implicit neo4j: DatabaseService): Boolean = {
    val parentRelationship = getParentRelationship(itemNode)
    if (parentRelationship.isDefined){
      val parentNode = parentRelationship.get.getEndNode
      if (itemsInPath.contains(parentNode.getId)){
        return false;
      }else{
        itemsInPath.append(itemNode.getId)
        if (!isUniqueParent(parentNode, itemsInPath)){
          return false;
        }
      }
    }
    true
  }
  
  protected def getTaggedItems(tagNode: Node, includeDeleted: Boolean = false)(implicit neo4j: DatabaseService): scala.List[Node] = {
    val itemsFromTagSkeleton: TraversalDescription =
      neo4j.gds.traversalDescription()
        .depthFirst()
        .relationships(DynamicRelationshipType.withName(ItemRelationship.HAS_TAG.name), Direction.INCOMING)
        .evaluator(Evaluators.excludeStartPosition())
        .depthFirst()
        .evaluator(Evaluators.toDepth(1))

    val itemsFromTag = {
      if (includeDeleted) {
        itemsFromTagSkeleton
      } else {
        itemsFromTagSkeleton.evaluator(PropertyEvaluator(
          MainLabel.ITEM, "deleted",
          Evaluation.EXCLUDE_AND_PRUNE,
          Evaluation.INCLUDE_AND_CONTINUE))
      }
    }
    itemsFromTag.traverse(tagNode).nodes().toList
  }

  protected def createParentRelationship(itemNode: Node, owner: Owner, parentNode: Node)(implicit neo4j: DatabaseService): Response[Option[Long]] = {
    
    // First, make sure there isn't a infinite loop of parents, problem possible only for lists and tags
    if (itemNode.hasLabel(ItemLabel.LIST) || itemNode.hasLabel(ItemLabel.TAG)){
      if (itemNode.getId == parentNode.getId)
        return fail(INVALID_PARAMETER, ERR_ITEM_OWN_PARENT, "Item can not be its own parent")
      
      val itemsInPath = new ListBuffer[Long]
      itemsInPath.append(itemNode.getId)
      if (!isUniqueParent(parentNode, itemsInPath)){
        return fail(INVALID_PARAMETER, ERR_ITEM_PARENT_INFINITE_LOOP, "Infinite loop in item parents")      
      }
    }
    
    val relationship = itemNode --> ItemRelationship.HAS_PARENT --> parentNode <;
    // When adding a relationship to a parent list, item needs to match the archived status of the parent
    if (parentNode.hasProperty("archived")) {
      if (!owner.hasPremium){
        return fail(INVALID_PARAMETER, ERR_ITEM_ARCHIVE_NOT_PREMIUM, "Archive is only available for premium users")
      }
      val archived =
        if (!itemNode.hasProperty("archived")) {
          val archived = System.currentTimeMillis
          itemNode.setProperty("archived", archived)
          Some(archived)
        }else{
          None
        }
      // Get the history tag of the parent and add it to the child
      val historyTagRelationship = getItemRelationship(parentNode, owner, ItemRelationship.HAS_TAG, TagLabel.HISTORY)
      if (historyTagRelationship.isDefined) {
        val historyTagNode = historyTagRelationship.get.getEndNode()

        // Need to make sure the child does not already have this tag
        val tagRelationshipsResult = getTagRelationships(itemNode, owner)
        if (tagRelationshipsResult.isLeft) return Left(tagRelationshipsResult.left.get)
        if (tagRelationshipsResult.right.get.isDefined) {
          tagRelationshipsResult.right.get.get foreach (tagRelationship => {
            if (tagRelationship.getEndNode() == historyTagNode) {
              // Already has this history tag, return
              return Right(archived)
            }
          })
        }
        // Does not have the tag, add it
        createTagRelationships(itemNode, scala.List(historyTagNode))
      }
      Right(archived)
    }else{
      Right(None)
    }
  }

  protected def getItemRelationship(itemNode: Node, owner: Owner,
    relationshipType: RelationshipType,
    endNodeLabel: Label,
    direction: Direction = Direction.OUTGOING)(implicit neo4j: DatabaseService): Option[Relationship] = {
    val relatedNodeFromItem: TraversalDescription =
      neo4j.gds.traversalDescription()
        .depthFirst()
        .expand(new OrderedByTypeExpander()
          .add(DynamicRelationshipType.withName(relationshipType.name), direction)
          .add(DynamicRelationshipType.withName(SecurityRelationship.OWNS.name), Direction.INCOMING)
          .asInstanceOf[PathExpander[_]])
        .evaluator(Evaluators.excludeStartPosition())
        .evaluator(LabelEvaluator(scala.List(MainLabel.ITEM),
          foundEvaluation = Evaluation.INCLUDE_AND_CONTINUE,
          notFoundEvaluation = Evaluation.EXCLUDE_AND_PRUNE,
          length = Some(1)))
        .evaluator(UUIDEvaluator(getOwnerUUID(owner), length = Some(2)))
        .evaluator(Evaluators.toDepth(2))
        .uniqueness(Uniqueness.NODE_PATH) // We want to get the userUUID twice to be sure that we have the same owner for both paths

    val traverser = relatedNodeFromItem.traverse(itemNode)
    val relationshipList = traverser.relationships().toArray

    // Correct relationships are in order ITEM->ITEM then OWNER->ITEM
    var itemRelationship: Option[Relationship] = None
    var previousRelationship: Relationship = null
    relationshipList foreach (relationship => {
      if (relationship.getStartNode().hasLabel(MainLabel.OWNER)
        && previousRelationship != null
        && ((direction == Direction.OUTGOING && previousRelationship.getEndNode() == relationship.getEndNode()) ||
          (direction == Direction.INCOMING && previousRelationship.getStartNode() == relationship.getEndNode()))) {
        if (relationship.getEndNode().hasLabel(endNodeLabel)) {
          itemRelationship = Some(previousRelationship)
        }
      }
      previousRelationship = relationship
    })
    itemRelationship
  }

  protected def setTagNodes(itemNode: Node, owner: Owner, extItem: ExtendedItem)(implicit neo4j: DatabaseService): Response[Option[scala.List[Relationship]]] = {
	for {
	  ownerNodes <- getOwnerNodes(owner).right
	  oldTagRelationships <- getTagRelationships(itemNode, owner).right
	  newTagRelationships <- setTagRelationships(itemNode, ownerNodes, extItem.tags, oldTagRelationships).right
	} yield newTagRelationships
  }

  protected def setTagRelationships(itemNode: Node, ownerNodes: OwnerNodes, tagUUIDList: Option[scala.List[UUID]],
    oldTagRelationships: Option[scala.List[Relationship]])(implicit neo4j: DatabaseService): Response[Option[scala.List[Relationship]]] = {
    if (tagUUIDList.isDefined) {
      val oldTagUUIDList = if (oldTagRelationships.isDefined) getEndNodeUUIDList(oldTagRelationships.get) else scala.List()
      // Get all new UUIDs
      val newUUIDList = tagUUIDList.get.diff(oldTagUUIDList)
      // Get all removed UUIDs
      val removedUUIDList = oldTagUUIDList.diff(tagUUIDList.get)

      // It is not possible to use this method to add or remove HISTORY tags, that happens only via archive/unarchive
      for {
        newTagNodes <- getTagNodes(newUUIDList, ownerNodes, false, Some(TagLabel.HISTORY)).right
        newTagRelationships <- Right(createTagRelationships(itemNode, newTagNodes)).right
        removedTagNodes <- getTagNodes(removedUUIDList, ownerNodes, true, Some(TagLabel.HISTORY)).right
        removedTagRelationships <- getTagRelationships(itemNode, removedTagNodes).right
        result <- Right(deleteTagRelationships(removedTagRelationships)).right
      } yield newTagRelationships
    } else {
      deleteTagRelationships(oldTagRelationships)
      Right(None)
    }
  }

  protected def getTagNodes(tagUUIDList: scala.List[UUID], ownerNodes: OwnerNodes, acceptDeleted: Boolean = false, skipLabel: Option[Label] = None)(implicit neo4j: DatabaseService): Response[scala.List[Node]] = {
    val tagNodes = getNodes(tagUUIDList, ItemLabel.TAG, acceptDeleted, skipLabel)
    if (tagNodes.isRight) {
      // Check that owner has access to all tags
      val ownerFromTag: TraversalDescription =
        neo4j.gds.traversalDescription()
          .relationships(DynamicRelationshipType.withName(SecurityRelationship.OWNS.name),
            Direction.INCOMING)
          .depthFirst()
          .evaluator(Evaluators.excludeStartPosition())
          .evaluator(PropertyEvaluator(
            MainLabel.ITEM, "deleted",
            Evaluation.EXCLUDE_AND_PRUNE,
            Evaluation.INCLUDE_AND_CONTINUE))
          .uniqueness(Uniqueness.NODE_PATH) // We want to make sure to get the same owner node for all tags
      val traverser = ownerFromTag.traverse(tagNodes.right.get: _*)
      val ownerNodeList = traverser.nodes().toArray
      if (ownerNodeList.length < tagNodes.right.get.length) {
        fail(INTERNAL_SERVER_ERROR, ERR_ITEM_TAG_NO_OWNER, "Some of the tags does not have an owner")
      } else if (ownerNodeList.length > tagNodes.right.get.length) {
        fail(INTERNAL_SERVER_ERROR, ERR_ITEM_TAG_MORE_THAN_1_OWNER, "Some of the tags has more than one owner")
      } else {
        val ownerNode = getOwnerNode(ownerNodes)
        ownerNodeList foreach (tagOwner => {
          if (tagOwner != ownerNode) {
            fail(INVALID_PARAMETER, ERR_ITEM_TAG_WRONG_OWNER, "Some of the tags does not belong to the owner "
              + getUUID(ownerNode))
          }
        })
      }
    }
    tagNodes
  }

  protected def deleteTagRelationships(tagRelationships: Option[scala.List[Relationship]])(implicit neo4j: DatabaseService): Unit = {
    if (tagRelationships.isDefined) {
      tagRelationships.get foreach (tagRelationship => {
        tagRelationship.delete()
      })
    }
  }

  protected def createTagRelationships(itemNode: Node, tagNodes: scala.List[Node])(implicit neo4j: DatabaseService): Option[scala.List[Relationship]] = {
    if (tagNodes.isEmpty) return None
    Some(tagNodes map (tagNode => {
      itemNode --> ItemRelationship.HAS_TAG --> tagNode <;
    }))
  }

  protected def getTagRelationships(itemNode: Node, owner: Owner)(implicit neo4j: DatabaseService): Response[Option[scala.List[Relationship]]] = {
    val tagNodesFromItem: TraversalDescription =
      neo4j.gds.traversalDescription()
        .depthFirst()
        .expand(new OrderedByTypeExpander()
          .add(DynamicRelationshipType.withName(ItemRelationship.HAS_TAG.name), Direction.OUTGOING)
          .add(DynamicRelationshipType.withName(SecurityRelationship.OWNS.name), Direction.INCOMING)
          .asInstanceOf[PathExpander[_]])
        .evaluator(Evaluators.excludeStartPosition())
        .evaluator(LabelEvaluator(scala.List(MainLabel.ITEM),
          foundEvaluation = Evaluation.INCLUDE_AND_CONTINUE,
          notFoundEvaluation = Evaluation.EXCLUDE_AND_PRUNE,
          length = Some(1)))
        .evaluator(UUIDEvaluator(getOwnerUUID(owner), length = Some(2)))
        .evaluator(Evaluators.toDepth(2))
        .uniqueness(Uniqueness.NODE_PATH) // We want to get the userUUID twice to be sure that we have the same owner for both paths

    val traverser = tagNodesFromItem.traverse(itemNode)
    val relationshipList = traverser.relationships().toArray

    val tagRelationshipBuffer = new ListBuffer[Relationship]
    var previousRelationship: Relationship = null
    relationshipList foreach (relationship => {
      if (relationship.getStartNode().hasLabel(MainLabel.OWNER)
        && (previousRelationship != null && previousRelationship.getEndNode() == relationship.getEndNode())) {
        if (relationship.getEndNode().hasLabel(ItemLabel.TAG))
          tagRelationshipBuffer.append(previousRelationship)
      }
      previousRelationship = relationship
    })

    if (tagRelationshipBuffer.isEmpty) Right(None)
    else Right(Some(tagRelationshipBuffer.toList))
  }

  protected def getTagRelationships(itemNode: Node, tagNodes: scala.List[Node])(implicit neo4j: DatabaseService): Response[Option[scala.List[Relationship]]] = {
    if (tagNodes.isEmpty) return Right(None)
    val tagNodesFromItem: TraversalDescription =
      neo4j.gds.traversalDescription()
        .depthFirst()
        .relationships(DynamicRelationshipType.withName(ItemRelationship.HAS_TAG.name), Direction.OUTGOING)
        .evaluator(Evaluators.excludeStartPosition())
        .evaluator(LabelEvaluator(scala.List(ItemLabel.TAG)))
        .evaluator(Evaluators.toDepth(1))

    val traverser = tagNodesFromItem.traverse(itemNode)
    val relationships = traverser.relationships().toList

    // See that every node is found in the list
    val relationshipList = relationships.filter(relationship => {
      tagNodes.contains(relationship.getEndNode())
    })

    if (relationshipList.size != tagNodes.size) {
      fail(INVALID_PARAMETER, ERR_ITEM_DOES_NOT_HAVE_TAG, "Every given tag UUID is not attached to the item " + getUUID(itemNode))
    } else {
      Right(Some(relationshipList))
    }
  }
  
  protected def moveDescriptionToContent(node: Node)(implicit neo4j: DatabaseService) {
    if (node.hasProperty("description")){
      val description = node.getProperty("description").asInstanceOf[String]
      node.setProperty("content", description)
      node.removeProperty("description")
    }else if (node.hasProperty("content")){
      node.removeProperty("content")
    }
  }
  
  protected def moveContentToDescription(node: Node)(implicit neo4j: DatabaseService): Response[Unit] = {
    if (node.hasProperty("description")){
      fail(INVALID_PARAMETER, ERR_ITEM_CONTENT_ALREADY_DESCRIPTION, "Can't move content to description: item already has a description field.")
    }else if (node.hasProperty("content")){
      val content = node.getProperty("content").asInstanceOf[String]
      if (!Validators.validateDescription(content)){
        fail(INVALID_PARAMETER, ERR_ITEM_CONTENT_TOO_LONG, "Can't move content to description: content too long to fit to a description field.")        
      }else{
        node.setProperty("description", content)
        node.removeProperty("content")
        Right()
      }
    }else{
      Right()
    }
  }

  protected def deleteItemNode(owner: Owner, itemUUID: UUID): Response[Tuple2[Node, Long]] = {
    withTx {
      implicit neo =>
        for {
          itemNode <- getItemNode(owner, itemUUID).right
          deleted <- Right(deleteItem(itemNode)).right
        } yield (itemNode, deleted)
    }
  }

  protected def undeleteItemNode(owner: Owner, itemUUID: UUID, mandatoryLabel: Option[Label] = None): Response[Node] = {
    withTx {
      implicit neo =>
        for {
          itemNode <- getItemNode(owner, itemUUID, mandatoryLabel, acceptDeleted = true).right
          success <- Right(undeleteItem(itemNode)).right
        } yield itemNode
    }
  }
  
    
  protected def validateExtendedItemModifiable(owner: Owner, itemUUID: UUID, label: Label, requireFounder: Boolean): Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          taskNode <- getItemNode(owner, itemUUID, Some(label), acceptDeleted = true).right
          parentRelationship <- (if(owner.sharedLists.isDefined) Right(getParentRelationship(taskNode)) else Right(None)).right
          accessRight <- 
          (if (owner.sharedLists.isDefined) Right(getSharedListAccessRight(owner.sharedLists.get,
              if (parentRelationship.isDefined){
                Some(ExtendedItemRelationships(Some(getUUID(parentRelationship.get.getEndNode)), None, None))
              }else{
                None
              }))
           else Right(Some(SecurityContext.FOUNDER))
          ).right
          unit <- (if (requireFounder && accessRight.isDefined && accessRight.get != SecurityContext.FOUNDER)
        	  		fail(INVALID_PARAMETER, ERR_BASE_FOUNDER_ACCESS_RIGHT_REQUIRED, "Given parameters require founder access")
        		   else if (writeAccess(accessRight)) Right() 
        		   else fail(INVALID_PARAMETER, ERR_BASE_NO_LIST_ACCESS, "No write access to (un)delete task")).right
        } yield taskNode
    }
  }

  protected def destroyDeletedItems(ownerNodes: OwnerNodes)(implicit neo4j: DatabaseService): CountResult = {
    val deletedItemsFromOwner: TraversalDescription =
      neo4j.gds.traversalDescription()
        .relationships(DynamicRelationshipType.withName(SecurityRelationship.OWNS.name),
          Direction.OUTGOING)
        .depthFirst()
        .evaluator(Evaluators.excludeStartPosition())
        .evaluator(LabelEvaluator(scala.List(MainLabel.ITEM)))
        .evaluator(PropertyEvaluator(MainLabel.ITEM, "deleted"))

    val traverser = deletedItemsFromOwner.traverse(getOwnerNode(ownerNodes))
    val deletedItemList = traverser.nodes().toList
    var count = 0
    val currentTime = System.currentTimeMillis()
    deletedItemList.foreach(deletedItem => {
      if (deletedItem.getProperty("deleted").asInstanceOf[Long] + DESTROY_TRESHOLD < currentTime) {
        count += 1
        destroyItem(deletedItem)
      }
    })
    CountResult(count)
  }

  protected def destroyItem(deletedItem: Node)(implicit neo4j: DatabaseService) {
    // Remove all relationships
    val relationshipList = deletedItem.getRelationships().toList
    relationshipList.foreach(relationship => relationship.delete())
    
    // Remove from items index
    val itemsIndex = neo4j.gds.index().forNodes("items")
    itemsIndex.remove(deletedItem)
    
    // Delete item itself
    deletedItem.delete()
  }

  protected def addToItemsIndex(owner: Owner, itemNode: Node, setResult: SetResult): Unit = {
    withTx {
      implicit neo4j =>
        addToItemsIndex(getOwnerUUID(owner), itemNode, setResult.modified)
    }
  }

  protected def addToItemsIndex(ownerUUID: UUID, itemNode: Node, modified: Long)(implicit neo4j: DatabaseService): Unit = {
    val itemsIndex = neo4j.gds.index().forNodes("items")
    itemsIndex.add(itemNode, "owner", UUIDUtils.getTrimmedBase64UUID(ownerUUID))
    itemsIndex.add(itemNode, "item", itemNode.getProperty("uuid"))
    addModifiedIndex(itemsIndex, itemNode, modified)
  }

  protected def updateItemsIndex(itemNode: Node, setResult: SetResult): Unit = {
    withTx {
      implicit neo4j =>
        val itemsIndex = neo4j.gds.index().forNodes("items")
        updateModifiedIndex(itemsIndex, itemNode, setResult.modified)
    }
  }
  
  protected def updateItemsIndex(itemNodeList: scala.List[Node], setResult: SetResult): Unit = {
    withTx {
      implicit neo4j =>
        val itemsIndex = neo4j.gds.index().forNodes("items")
        itemNodeList.foreach { itemNode => updateModifiedIndex(itemsIndex, itemNode, setResult.modified) }
    }
  }

  protected def updateModifiedIndex(index: Index[Node], node: Node, modified: Long)(implicit neo4j: DatabaseService): Unit = {
    index.remove(node, "modified")
    addModifiedIndex(index, node, modified)
  }

  protected def addModifiedIndex(index: Index[Node], node: Node, modified: Long)(implicit neo4j: DatabaseService): Unit = {
    index.add(node, "modified", new ValueContext(node.getProperty("modified").asInstanceOf[Long]).indexNumeric())
  }
  
  protected def rebuildItemsIndexes(ownerUUIDs: scala.List[UUID]): Response[CountResult] = {
    ownerUUIDs.foreach(ownerUUID => {
      val rebuildResult = rebuildItemsIndex(ownerUUID)
      if (rebuildResult.isLeft) {
        return Left(rebuildResult.left.get)
      }
    })
    Right(CountResult(ownerUUIDs.size))
  }

  protected def rebuildItemsIndex(ownerNode: Node)(implicit neo4j: DatabaseService): Response[CountResult] = {
    val itemsIndex = neo4j.gds.index().forNodes("items")
    val ownerUUID = getUUID(ownerNode)
    val oldItemsInIndex = itemsIndex.query("owner:\"" + UUIDUtils.getTrimmedBase64UUID(ownerUUID) + "\"").toList
    oldItemsInIndex.foreach(itemNode => {
      itemsIndex.remove(itemNode)
    })

    // Add all back to index
    val itemsFromOwner: TraversalDescription = itemsTraversal
    val traverser = itemsFromOwner.traverse(ownerNode)
    traverser.nodes.foreach(itemNode => {
      addToItemsIndex(ownerUUID, itemNode, itemNode.getProperty("modified").asInstanceOf[Long])
    })
    Right(CountResult(traverser.nodes.size))
  }

}