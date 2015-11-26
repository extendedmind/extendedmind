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
import org.neo4j.graphdb.NotFoundException

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
      itemNode <- updateItem(owner, itemUUID, item, None, None, None, item.modified).right
      result <- Right(getSetResult(itemNode, false)).right
      unit <- Right(updateItemsIndex(itemNode, result)).right
    } yield result
  }

  def getItem(owner: Owner, itemUUID: UUID): Response[Item] = {
    withTx {
      implicit neo4j =>
        for {
          itemNode <- getItemNode(owner, itemUUID).right
          item <- toCaseClass[Item](itemNode).right
        } yield item
    }
  }

  def getItems(owner: Owner, modified: Option[Long], active: Boolean, deleted: Boolean, archived: Boolean, completed: Boolean, tagsOnly: Boolean)(implicit log: LoggingContext): Response[Items] = {
    withTx {
      implicit neo4j =>
        for {
          ownerUUID <- Right(getOwnerUUID(owner)).right
          itemNodes <- getItemNodes(ownerUUID, modified, active, deleted, archived, completed, tagsOnly).right
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

  def putNewItemToInbox(inboxId: String, item: Item): Response[SetResult] = {
    for {
      ownerNode <- getNode("inboxId", inboxId, MainLabel.OWNER, None, false).right
      itemCreateResult <- createItem(ownerNode, item).right
      result <- Right(getSetResult(itemCreateResult._1, true)).right
      unit <- Right(addToItemsIndex(itemCreateResult._2, itemCreateResult._1, result)).right
    } yield result
  }

  def isInboxValid(inboxId: String): Response[SetResult] = {
    for {
      ownerNode <- getNode("inboxId", inboxId, MainLabel.OWNER, None, false).right
      result <- Right(SetResult(None, None, System.currentTimeMillis())).right
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

  def getItemStatistics(uuid: UUID): Response[NodeStatistics] = {
    for {
      itemNode <- getItemNodeByUUID(uuid).right
      stats <- Right(getItemStatistics(itemNode)).right
    } yield stats
  }

  def setItemProperty(uuid: UUID, key: String, stringValue: Option[String], longValue: Option[Long]): Response[SetResult] = {
    for {
      itemNode <- getItemNodeByUUID(uuid).right
      unit <- Right(setItemProperty(itemNode, key: String, stringValue: Option[String], longValue: Option[Long])).right
      result <- Right(getSetResult(itemNode, false)).right
      unit <- Right(updateItemsIndex(itemNode, result)).right
    } yield result
  }

  def getPublicItems(handle: String, modified: Option[Long]): Response[PublicItems] = {
    withTx {
      implicit neo4j =>
        for {
          ownerNode <- getNode("handle", handle, MainLabel.OWNER, Some(handle), false).right
          publicItemNodes <- getItemNodes(getUUID(ownerNode), modified, true, true, true, false, publicOnly=true).right
          publicItems <- toPublicItems(ownerNode, publicItemNodes, modified).right
        } yield publicItems
    }
  }

  def getPublicItem(handle: String, path: String): Response[PublicItem] = {
    withTx {
      implicit neo4j =>
        for {
          ownerNode <- getNode("handle", handle, MainLabel.OWNER, Some(handle), false).right
          itemNode <- getItemNodeByPath(ownerNode, path).right
          publicItem <- toPublicItem(ownerNode, itemNode, getDisplayOwner(ownerNode)).right
        } yield publicItem
    }
  }

  // PRIVATE

  case class TagRelationships(ownerTags: Option[scala.List[Relationship]], collectiveTags: Option[scala.List[Relationship]])

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
    val assignedNotesBuffer = new ListBuffer[(UUID, Note)]
    val assignedTasksBuffer = new ListBuffer[(UUID, Task)]
    val assignedListsBuffer = new ListBuffer[(UUID, List)]

    itemNodes foreach (itemNode => {
      val ownerNode = getItemOwnerNode(itemNode)
      if (ownerNode.isEmpty)
        return fail(INTERNAL_SERVER_ERROR, ERR_ITEM_NO_OWNER, "Item " + getUUID(itemNode) + " does not have an owner")
      val itemOwnerUUID = getUUID(ownerNode.get)
      val ownerUUID = getOwnerUUID(owner)

      if (itemNode.hasLabel(ItemLabel.NOTE)) {
        val note = toNote(itemNode, owner)
        if (note.isLeft) {
          return fail(INTERNAL_SERVER_ERROR, ERR_ITEM_TO_NOTE, note.left.get.toString)
        }
        if (ownerUUID == itemOwnerUUID) noteBuffer.append(note.right.get)
        else assignedNotesBuffer.append((itemOwnerUUID, note.right.get))
      } else if (itemNode.hasLabel(ItemLabel.TASK)) {
        val task = toTask(itemNode, owner)
        if (task.isLeft) {
          return fail(INTERNAL_SERVER_ERROR, ERR_ITEM_TO_TASK, task.left.get.toString)
        }
        if (ownerUUID == itemOwnerUUID) taskBuffer.append(task.right.get)
        else assignedTasksBuffer.append((itemOwnerUUID, task.right.get))
      } else if (itemNode.hasLabel(ItemLabel.LIST)) {
        val list = toList(itemNode, owner)
        if (list.isLeft) {
          return fail(INTERNAL_SERVER_ERROR, ERR_ITEM_TO_LIST, list.left.get.toString)
        }
        if (ownerUUID == itemOwnerUUID) listBuffer.append(list.right.get)
        else assignedListsBuffer.append((itemOwnerUUID, list.right.get))
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
      }
    })

    // Get assigned items to separate array

    val assignedItems: Option[scala.List[AssignedItems]] = {
      if (!assignedNotesBuffer.isEmpty || !assignedListsBuffer.isEmpty || !assignedTasksBuffer.isEmpty){
        val collectiveUUIDBuffer = new ListBuffer[UUID]
        assignedNotesBuffer.foreach(assignedNote =>
          if (!collectiveUUIDBuffer.contains(assignedNote._1))
            collectiveUUIDBuffer.append(assignedNote._1))
        assignedListsBuffer.foreach(assignedList =>
          if (!collectiveUUIDBuffer.contains(assignedList._1))
            collectiveUUIDBuffer.append(assignedList._1))
        assignedTasksBuffer.foreach(assignedTask =>
          if (!collectiveUUIDBuffer.contains(assignedTask._1))
            collectiveUUIDBuffer.append(assignedTask._1))
        if (collectiveUUIDBuffer.isEmpty) None
        else{
          Some(collectiveUUIDBuffer.toList.map(collectiveUUID => {
            val tasksAssignedToCollective = assignedTasksBuffer.filter(assignedTask => assignedTask._1 == collectiveUUID)
            val notesAssignedToCollective = assignedNotesBuffer.filter(assignedNote => assignedNote._1 == collectiveUUID)
            val listsAssignedToCollective = assignedListsBuffer.filter(assignedList => assignedList._1 == collectiveUUID)
            AssignedItems(
              collectiveUUID,
              if (tasksAssignedToCollective.isEmpty) None else Some(tasksAssignedToCollective.toList.map(assigned => assigned._2)),
              if (notesAssignedToCollective.isEmpty) None else Some(notesAssignedToCollective.toList.map(assigned => assigned._2)),
              if (listsAssignedToCollective.isEmpty) None else Some(listsAssignedToCollective.toList.map(assigned => assigned._2))
            )
          }))
        }
      }else{
        None
      }
    }

    Right(Items(
      if (itemBuffer.isEmpty) None else Some(itemBuffer.toList),
      if (taskBuffer.isEmpty) None else Some(taskBuffer.toList),
      if (noteBuffer.isEmpty) None else Some(noteBuffer.toList),
      if (listBuffer.isEmpty) None else Some(listBuffer.toList),
      if (tagBuffer.isEmpty) None else Some(tagBuffer.toList),
      assignedItems))
  }

  // Methods for converting tasks and nodes
  def toTask(taskNode: Node, owner: Owner)(implicit neo4j: DatabaseService): Response[Task];
  def toNote(noteNode: Node, owner: Owner, tagRelationships: Option[Option[TagRelationships]] = None, skipParent: Boolean = false)(implicit neo4j: DatabaseService): Response[Note];
  def toTag(tagNode: Node, owner: Owner)(implicit neo4j: DatabaseService): Response[Tag];
  def toList(listNode: Node, owner: Owner)(implicit neo4j: DatabaseService): Response[List];

  protected def getItemNodes(ownerUUID: UUID, modified: Option[Long], active: Boolean, deleted: Boolean,
                             archived: Boolean, completed: Boolean, tagsOnly: Boolean = false, publicOnly: Boolean = false)
                            (implicit neo4j: DatabaseService): Response[Iterable[Node]] = {
    val itemsIndex = neo4j.gds.index().forNodes("items")

    val itemNodeList = {
      val ownerSearchString = UUIDUtils.getTrimmedBase64UUIDForLucene(ownerUUID)
      if (modified.isDefined) {
        val ownerQuery = new TermQuery(new Term("owner", UUIDUtils.getTrimmedBase64UUIDForLucene(ownerUUID)))
        val assigneeQuery = new TermQuery(new Term("assignee", UUIDUtils.getTrimmedBase64UUIDForLucene(ownerUUID)))
        val userQuery = new BooleanQuery;
        userQuery.add(ownerQuery, BooleanClause.Occur.SHOULD);
        userQuery.add(assigneeQuery, BooleanClause.Occur.SHOULD);
        val modifiedRangeQuery = NumericRangeQuery.newLongRange("modified", 8, modified.get, null, false, false)
        val userModifiedQuery = new BooleanQuery;
        userModifiedQuery.add(modifiedRangeQuery, BooleanClause.Occur.MUST);
        userModifiedQuery.add(userQuery, BooleanClause.Occur.MUST);
        itemsIndex.query(userModifiedQuery).toList
      } else {
        val userQuery = "(owner:" + ownerSearchString + " OR assignee:" + ownerSearchString + ")"
        itemsIndex.query(userQuery).toList
      }
    }

    if (!itemNodeList.isEmpty && (!active || !deleted || !archived || !completed || publicOnly || tagsOnly)) {
      // Filter out active, deleted, archived and/or completed
      Right(itemNodeList filter (itemNode => {
        var include = true
        if (tagsOnly && !itemNode.hasLabel(ItemLabel.TAG)) include = false
        if (publicOnly &&
            (!itemNode.hasProperty("published") ||
            ((itemNode.hasProperty("unpublished") || itemNode.hasProperty("deleted")) && modified.isEmpty))) include = false
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

  protected def createItem(ownerNode: Node, item: Item): Response[(Node, Owner)] = {
    withTx {
      implicit neo4j =>
        for {
          itemNode <- createItem(OwnerNodes(ownerNode, None), item, None, None).right
        } yield (itemNode, Owner(getUUID(ownerNode), None))
    }
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
      foreignOwnerNode <- getNodeOption(owner.foreignOwnerUUID, MainLabel.OWNER).right
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
    additionalSubLabelAlternatives: Option[scala.List[Label]] = None,
    expectedModified: Option[Long] = None): Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          itemNode <- getItemNode(owner, itemUUID, exactLabelMatch = false).right
          itemNode <- updateItemNode(itemNode, item, additionalLabel, additionalSubLabel, additionalSubLabelAlternatives, expectedModified).right
        } yield itemNode
    }
  }

  protected def updateItemNode(itemNode: Node, item: AnyRef,
    additionalLabel: Option[Label] = None,
    additionalSubLabel: Option[Label] = None,
    additionalSubLabelAlternatives: Option[scala.List[Label]] = None,
    expectedModified: Option[Long] = None)(implicit neo4j: DatabaseService): Response[Node] = {
    for {
      unit <- validateExpectedModified(itemNode, expectedModified).right
      itemNode <- Right(setLabel(itemNode, additionalLabel, additionalSubLabel, additionalSubLabelAlternatives)).right
      itemNode <- updateNode(itemNode, item).right
    } yield itemNode
  }

  protected def validateExpectedModified(node: Node, expectedModified: Option[Long])(implicit neo4j: DatabaseService): Response[Unit] = {
    if (expectedModified.isDefined && node.hasProperty("modified") && node.getProperty("modified").asInstanceOf[Long] != expectedModified.get){
      fail(INVALID_PARAMETER, ERR_BASE_WRONG_EXPECTED_MODIFIED, "Given modified value does not match stored modified value")
    }else{
      Right()
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

  protected def putExistingExtendedItem(owner: Owner, itemUUID: UUID, extItem: ExtendedItem, label: Label, skipParentHistoryTag: Boolean = false): Response[(Node, Option[Long])] = {
    withTx {
      implicit neo4j =>
        for {
          itemNode <- updateItem(owner, itemUUID, extItem, Some(label), None, None, extItem.modified).right
          archived <- setParentNode(itemNode, owner, extItem.parent, skipParentHistoryTag).right
          tagNodes <- setTagNodes(itemNode, owner, extItem).right
          ownerNodes <- getOwnerNodes(owner).right
          result <- setAssigneeRelationship(itemNode, ownerNodes, extItem).right
        } yield (itemNode, archived)
    }
  }

  protected def putNewExtendedItem(owner: Owner, extItem: ExtendedItem, label: Label, subLabel: Option[Label] = None, skipParentHistoryTag: Boolean = false): Response[(Node, Option[Long])] = {
    withTx {
      implicit neo4j =>
        for {
          itemNode <- createItem(owner, extItem, Some(label), subLabel).right
          archived <- setParentNode(itemNode, owner, extItem.parent, skipParentHistoryTag).right
          tagNodes <- setTagNodes(itemNode, owner, extItem).right
          ownerNodes <- getOwnerNodes(owner).right
          result <- setAssigneeRelationship(itemNode, ownerNodes, extItem).right
        } yield (itemNode, archived)
    }
  }

  protected def putExistingLimitedExtendedItem(owner: Owner, itemUUID: UUID, extItem: LimitedExtendedItem, label: Label): Response[(Node, Option[Long])] = {
    withTx {
      implicit neo4j =>
        for {
          itemNode <- updateItem(owner, itemUUID, extItem, Some(label), None, None, extItem.modified).right
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

  protected def setParentNode(itemNode: Node, owner: Owner, parentUUID: Option[UUID], skipParentHistoryTag: Boolean = false)(implicit neo4j: DatabaseService): Response[Option[Long]] = {
    for {
      oldParentRelationship <- Right(getItemRelationship(itemNode, owner, ItemRelationship.HAS_PARENT, ItemLabel.LIST)).right
      archived <- setParentRelationship(itemNode, owner, parentUUID,
        oldParentRelationship, ItemLabel.LIST, skipParentHistoryTag).right
    } yield archived
  }

  protected def setParentRelationship(itemNode: Node, owner: Owner, parentUUID: Option[UUID], oldParentRelationship: Option[Relationship],
    parentLabel: Label, skipParentHistoryTag: Boolean)(implicit neo4j: DatabaseService): Response[Option[Long]] = {
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
        archived <- createParentRelationship(itemNode, owner, parentNode, skipParentHistoryTag).right
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
          foundEvaluation=Evaluation.EXCLUDE_AND_PRUNE,
          notFoundEvaluation=Evaluation.INCLUDE_AND_CONTINUE))
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

  protected def addNewAncestors(itemNode: Node, parentBuffer: ListBuffer[Node])(implicit neo4j: DatabaseService): Unit = {
    val parentRelationship = getParentRelationship(itemNode)
    if (parentRelationship.isDefined){
      val parentNode = parentRelationship.get.getEndNode
      if (parentBuffer.find(existingParent => existingParent.getId == parentNode.getId).isEmpty){
        // if the parent buffer does not yet contain this parent, add it
        parentBuffer.append(parentNode)
        addNewAncestors(parentNode, parentBuffer)
      }
    }
  }

  protected def addNewAncestors(collectiveItemNode: (UUID, Node), parentBuffer: ListBuffer[(UUID, Node)])(implicit neo4j: DatabaseService): Unit = {
    val parentRelationship = getParentRelationship(collectiveItemNode._2)
    if (parentRelationship.isDefined){
      val parentNode = parentRelationship.get.getEndNode
      if (parentBuffer.find(existingParent => existingParent._2 == parentNode).isEmpty){
        // if the parent buffer does not yet contain this parent, add it
        parentBuffer.append((collectiveItemNode._1, parentNode))
        addNewAncestors((collectiveItemNode._1, parentNode), parentBuffer)
      }
    }
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
          foundEvaluation=Evaluation.EXCLUDE_AND_PRUNE,
          notFoundEvaluation=Evaluation.INCLUDE_AND_CONTINUE))
      }
    }
    itemsFromTag.traverse(tagNode).nodes().toList
  }

  protected def createParentRelationship(itemNode: Node, owner: Owner, parentNode: Node, skipParentHistoryTag: Boolean)(implicit neo4j: DatabaseService): Response[Option[Long]] = {

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
      if (!skipParentHistoryTag){
        val historyTagRelationship = getItemRelationship(parentNode, owner, ItemRelationship.HAS_TAG, TagLabel.HISTORY)
        if (historyTagRelationship.isDefined) {
          val historyTagNode = historyTagRelationship.get.getEndNode()

          // Need to make sure the child does not already have this tag
          val tagRelationshipsResult = getTagRelationships(itemNode, owner)
          if (tagRelationshipsResult.isLeft) return Left(tagRelationshipsResult.left.get)
          if (tagRelationshipsResult.right.get.isDefined && tagRelationshipsResult.right.get.get.ownerTags.isDefined) {
            tagRelationshipsResult.right.get.get.ownerTags.get foreach (ownerTagRelationship => {
              if (ownerTagRelationship.getEndNode() == historyTagNode) {
                // Already has this history tag, return
                return Right(archived)
              }
            })
          }
          // Does not have the tag, add it
          createTagRelationships(itemNode, scala.List(historyTagNode))
        }
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
      newTagRelationships <- setTagRelationships(itemNode, ownerNodes, extItem.ownerTags, extItem.collectiveTags, oldTagRelationships).right
    } yield newTagRelationships
  }

  protected def setTagRelationships(itemNode: Node, ownerNodes: OwnerNodes,
          ownerTagUUIDList: Option[scala.List[UUID]],
          collectiveUUIDTagUUIDList: Option[scala.List[(UUID, scala.List[UUID])]],
          oldTagRelationships: Option[TagRelationships])(implicit neo4j: DatabaseService): Response[Option[scala.List[Relationship]]] = {

    // FIRST: owner tags

    // Get all old owner tag UUIDs
    val oldOwnerTagUUIDList =
      if (oldTagRelationships.isDefined && oldTagRelationships.get.ownerTags.isDefined)
        getEndNodeUUIDList(oldTagRelationships.get.ownerTags.get)
      else scala.List()
    // Get all new owner tag UUIDs
    val newOwnerUUIDList: scala.List[UUID] =
      if (ownerTagUUIDList.isDefined) ownerTagUUIDList.get.diff(oldOwnerTagUUIDList)
      else scala.List()
    // Get all removed owner tag UUIDs
    val removedOwnerUUIDList: scala.List[UUID] =
      if (ownerTagUUIDList.isDefined) oldOwnerTagUUIDList.diff(ownerTagUUIDList.get)
      else oldOwnerTagUUIDList

    // SECOND: collective tags

    val collectiveTagUUIDResult = getCollectiveTagUUIDs(ownerNodes, collectiveUUIDTagUUIDList)
    if (collectiveTagUUIDResult.isLeft) return Left(collectiveTagUUIDResult.left.get)
    val collectiveTagUUIDList: Option[scala.List[UUID]] = collectiveTagUUIDResult.right.get

    // Get all old collective tag UUIDs
    val oldCollectiveTagUUIDList =
      if (oldTagRelationships.isDefined && oldTagRelationships.get.collectiveTags.isDefined)
        getEndNodeUUIDList(oldTagRelationships.get.collectiveTags.get)
      else scala.List[UUID]()
    // Get all new collective UUIDs
    val newCollectiveUUIDList: scala.List[UUID] =
      if (collectiveTagUUIDList.isDefined) collectiveTagUUIDList.get.diff(oldCollectiveTagUUIDList)
      else scala.List()
    // Get all removed collective UUIDs
    val removedCollectiveUUIDList: scala.List[UUID] =
      if (collectiveTagUUIDList.isDefined) oldCollectiveTagUUIDList.diff(collectiveTagUUIDList.get)
      else oldCollectiveTagUUIDList

    // THIRD: Combine lists, as all tag relationships are of type HAS_TAG

    // Combine into a single list
    val newTagUUIDList: scala.List[UUID] = newOwnerUUIDList ++ newCollectiveUUIDList
    val removedTagUUIDList: scala.List[UUID] = removedOwnerUUIDList ++ removedCollectiveUUIDList

    for {
      // It is not possible to use this method to add or remove HISTORY tags, that happens only via archive/unarchive
      newTagNodes <- getTagNodes(newTagUUIDList, ownerNodes, false, Some(TagLabel.HISTORY)).right
      newTagRelationships <- Right(createTagRelationships(itemNode, newTagNodes)).right
      removedTagNodes <- getTagNodes(removedTagUUIDList, ownerNodes, true, Some(TagLabel.HISTORY)).right
      removedTagRelationships <- getTagRelationships(itemNode, removedTagNodes).right
      result <- Right(deleteTagRelationships(removedTagRelationships)).right
    } yield newTagRelationships
  }

  protected def getCollectiveTagUUIDs(ownerNodes: OwnerNodes, collectiveUUIDTagUUIDList: Option[scala.List[(UUID, scala.List[UUID])]])(implicit neo4j: DatabaseService): Response[Option[scala.List[UUID]]] = {
    if (collectiveUUIDTagUUIDList.isDefined && !collectiveUUIDTagUUIDList.get.isEmpty){
      val collectiveUUIDs = new ListBuffer[UUID]
      collectiveUUIDTagUUIDList.get.foreach(collectiveTags => {
        val collectiveResult = getNode(collectiveTags._1, OwnerLabel.COLLECTIVE)
        if (collectiveResult.isLeft) return Left(collectiveResult.left.get)
        val collectiveNode = collectiveResult.right.get
        incomingSharingTraversalDescription.traverse(collectiveNode).relationships.toList.find(relationship => {
          val relationshipType = relationship.getType().name()
          relationship.getStartNode() == ownerNodes.user &&
          (relationshipType == SecurityRelationship.CAN_READ.relationshipName ||
           relationshipType == SecurityRelationship.CAN_READ_WRITE.relationshipName ||
           relationshipType == SecurityRelationship.IS_FOUNDER.relationshipName)
        }).fold(
          return fail(INVALID_PARAMETER, ERR_COLLECTIVE_NO_ACCESS, "User does not have access to collective " + collectiveTags._1)
        )(securityRelationship =>{
          collectiveUUIDs.prependAll(collectiveTags._2)
        })
      })
      Right(Some(collectiveUUIDs.toList))
    }else{
      Right(None)
    }
  }

  protected def setAssigneeRelationship(itemNode: Node, ownerNodes: OwnerNodes, extItem: ExtendedItem)(implicit neo4j: DatabaseService): Response[Unit] = {
    if (extItem.relationships.isEmpty || extItem.relationships.get.assignee.isEmpty){
      val assigneeRelationship = getAssigneeRelationship(itemNode)
      if (assigneeRelationship.isDefined){
        removeAssigneeRelationship(itemNode, assigneeRelationship.get)
      }
      Right()
    }else{
      setAssigneeRelationshipNode(itemNode, ownerNodes, extItem.relationships.get.assignee.get)
    }
  }

  private def removeAssigneeRelationship(itemNode: Node, assigneeRelationship: Relationship)(implicit neo4j: DatabaseService) {
    val itemsIndex = neo4j.gds.index().forNodes("items")
    assigneeRelationship.delete()
    itemsIndex.remove(itemNode, "assignee")
  }

  private def setAssigneeRelationshipNode(itemNode: Node, ownerNodes: OwnerNodes, assigneeUUID: UUID)(implicit neo4j: DatabaseService): Response[Unit] = {
    if (ownerNodes.foreignOwner.isDefined && ownerNodes.foreignOwner.get.hasLabel(OwnerLabel.COLLECTIVE)){
      // Is a collective, assign relationship can be created
      val existingAssigneeRelationship = getAssigneeRelationship(itemNode)
      if (existingAssigneeRelationship.isDefined &&
          getUUID(existingAssigneeRelationship.get.getStartNode) == assigneeUUID){
        // This item is already assigned to this uuid, just return
        Right()
      }else{
        incomingSharingTraversalDescription.traverse(ownerNodes.foreignOwner.get).relationships.toList.find(relationship => {
          val relationshipType = relationship.getType().name()
          getUUID(relationship.getStartNode()) == assigneeUUID &&
          (relationshipType == SecurityRelationship.CAN_READ.relationshipName ||
           relationshipType == SecurityRelationship.CAN_READ_WRITE.relationshipName ||
           relationshipType == SecurityRelationship.IS_FOUNDER.relationshipName)
        }).fold(
          fail(INVALID_PARAMETER, ERR_ITEM_ASSIGNEE_NO_ACCESS, "Assignee " + assigneeUUID + " does not have access to collective " + getUUID(ownerNodes.foreignOwner.get))
        )(securityRelationship =>{
          val relationship = itemNode --> ItemRelationship.IS_ASSIGNED_TO --> securityRelationship.getStartNode <;
          // Store the assigner uuid as a property in the relationship
          relationship.setProperty("assigner", ownerNodes.user.getProperty("uuid"))
          val itemsIndex = neo4j.gds.index().forNodes("items")
          if (existingAssigneeRelationship.isDefined){
            removeAssigneeRelationship(itemNode, existingAssigneeRelationship.get)
          }
          itemsIndex.add(itemNode, "assignee",
              UUIDUtils.getTrimmedBase64UUIDForLucene(getUUID(securityRelationship.getStartNode)))
          return Right()
        })
      }
    }else{
      fail(INVALID_PARAMETER, ERR_ITEM_NOT_ASSIGNABLE, "Only items in collectives can be assigned")
    }
  }

  protected def getAssigneeRelationship(itemNode: Node): Option[Relationship] = {
    itemNode.getRelationships.toList.find(relationship => {
      relationship.getType().name == ItemRelationship.IS_ASSIGNED_TO.name
    })
  }

  protected def getItemOwnerNode(itemNode: Node): Option[Node] = {
    val iterator = itemNode.getRelationships.iterator()
    while(iterator.hasNext()){
      val relationship = iterator.next()
      if (relationship.getType().name == SecurityRelationship.OWNS.name) return Some(relationship.getStartNode)
    }
    None
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
            foundEvaluation=Evaluation.EXCLUDE_AND_PRUNE,
            notFoundEvaluation=Evaluation.INCLUDE_AND_CONTINUE))
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

  protected def getTagRelationships(itemNode: Node, owner: Owner)(implicit neo4j: DatabaseService): Response[Option[TagRelationships]] = {
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
        .evaluator(Evaluators.toDepth(2))
        .uniqueness(Uniqueness.NODE_PATH)

    val traverser = tagNodesFromItem.traverse(itemNode)
    val relationshipList = traverser.relationships().toArray

    val ownerTagRelationshipBuffer = new ListBuffer[Relationship]
    val collectiveTagRelationshipBuffer = new ListBuffer[Relationship]

    var previousRelationship: Relationship = null
    relationshipList foreach (relationship => {
      if (relationship.getStartNode().hasLabel(MainLabel.OWNER)
        && (previousRelationship != null && previousRelationship.getEndNode() == relationship.getEndNode())) {
        if (relationship.getEndNode().hasLabel(ItemLabel.TAG)){
          if (getUUID(relationship.getStartNode()) == owner.userUUID){
            ownerTagRelationshipBuffer.append(previousRelationship)
          }else{
            collectiveTagRelationshipBuffer.append(previousRelationship)
          }
        }
      }
      previousRelationship = relationship
    })

    if (ownerTagRelationshipBuffer.isEmpty && collectiveTagRelationshipBuffer.isEmpty){
      Right(None)
    }else{
      Right(Some(TagRelationships(
        ownerTags = {
          if (ownerTagRelationshipBuffer.isEmpty) None
          else Some(ownerTagRelationshipBuffer.toList)
        },
        collectiveTags = {
          if (collectiveTagRelationshipBuffer.isEmpty) None
          else Some(collectiveTagRelationshipBuffer.toList)
        })))
    }
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
          itemNode <- getItemNode(owner, itemUUID, acceptDeleted = true).right
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

  protected def validateExtendedItemModifiable(owner: Owner, itemUUID: UUID, label: Label, requireFounder: Boolean = false): Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          taskNode <- getItemNode(owner, itemUUID, Some(label), acceptDeleted = true).right
          parentRelationship <- (if(owner.isLimitedAccess) Right(getParentRelationship(taskNode)) else Right(None)).right
          accessRight <-
          (if (owner.isLimitedAccess) Right(getSharedListAccessRight(owner.sharedLists.get,
              if (parentRelationship.isDefined){
                Some(ExtendedItemRelationships(
                  Some(getUUID(parentRelationship.get.getEndNode)), None, None, None, None, None))
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
    relationshipList.foreach(relationship => {
      if (deletedItem.hasLabel(ItemLabel.TASK)){
        destroyTaskRelationship(relationship);
      }
      relationship.delete()
    })

    // Remove from items index
    val itemsIndex = neo4j.gds.index().forNodes("items")
    itemsIndex.remove(deletedItem)

    // Delete item itself
    deletedItem.delete()
  }

  protected def destroyTaskRelationship(relationship: Relationship)(implicit neo4j: DatabaseService)

  protected def addToItemsIndex(owner: Owner, itemNode: Node, setResult: SetResult): Unit = {
    withTx {
      implicit neo4j =>
        addToItemsIndex(getOwnerUUID(owner), itemNode, setResult.modified)
    }
  }

  protected def addToItemsIndex(ownerUUID: UUID, itemNode: Node, modified: Long)(implicit neo4j: DatabaseService): Unit = {
    val itemsIndex = neo4j.gds.index().forNodes("items")
    itemsIndex.add(itemNode, "owner", UUIDUtils.getTrimmedBase64UUIDForLucene(ownerUUID))
    itemsIndex.add(itemNode, "item", UUIDUtils.getTrimmedBase64UUIDForLucene(getUUID(itemNode)))
    addModifiedIndex(itemsIndex, itemNode, modified)
  }

  def updateItemsIndex(itemNode: Node, setResult: SetResult): Unit = {
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
    val oldItemsInIndex = itemsIndex.query("owner:\"" + UUIDUtils.getTrimmedBase64UUIDForLucene(ownerUUID) + "\"").toList
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

  protected def getItemNodeByUUID(uuid: UUID): Response[Node] = {
    withTx {
      implicit neo4j =>
        val nodeIter = findNodesByLabelAndProperty(MainLabel.ITEM, "uuid", UUIDUtils.getTrimmedBase64UUID(uuid))
        if (nodeIter.toList.isEmpty) {
          fail(INVALID_PARAMETER, ERR_ITEM_NOT_FOUND, "Item not found for statistics with given uuid")
        } else if (nodeIter.toList.size > 1) {
          fail(INVALID_PARAMETER, ERR_ITEM_MORE_THAN_1, "More than one item found for statistics with given uuid")
        } else {
          Right(nodeIter.toList(0))
        }
    }
  }

  protected def getItemStatistics(itemNode: Node): NodeStatistics = {
    withTx {
      implicit neo4j =>
        val itemProperties: scala.List[(String, Long)] = {
          itemNode.getPropertyKeys.toList.map(key => {
            // we know that all item properties are either String or Long
            if (key == "created" || key == "modified" || key == "deleted" ||
                key == "completed" || key == "archived" || key == "favorited"){
              (key, itemNode.getProperty(key).asInstanceOf[Long])
            }else{
              (key, itemNode.getProperty(key).asInstanceOf[String].length.asInstanceOf[Long])
            }
          })
        }
        val itemLabels = itemNode.getLabels.toList.map(label => {
          label.name
        })
        NodeStatistics(itemProperties, itemLabels)
    }
  }

  protected def setItemProperty(itemNode: Node, key: String, stringValue: Option[String], longValue: Option[Long]): Unit = {
    withTx {
      implicit neo4j =>
        if (stringValue.isDefined){
          itemNode.setProperty(key, stringValue.get)
        }else if (longValue.isDefined){
          itemNode.setProperty(key, longValue.get)
        }else if (itemNode.hasProperty(key)){
          itemNode.removeProperty(key)
        }
    }
  }

  protected def getItemNodeByPath(ownerNode: Node, path: String, includeDeleted: Boolean = false)(implicit neo4j: DatabaseService): Response[Node] = {

    val itemTraversalSkeleton = neo4j.gds.traversalDescription()
      .breadthFirst()
      .relationships(DynamicRelationshipType.withName(SecurityRelationship.OWNS.name), Direction.OUTGOING)
      .evaluator(Evaluators.excludeStartPosition())
      .evaluator(LabelEvaluator(scala.List(MainLabel.ITEM)))
      .evaluator(PropertyEvaluator(MainLabel.ITEM, "path", propertyStringValue=Some(path)))
      .evaluator(Evaluators.toDepth(1))

    val itemTraversal = if (includeDeleted) {
      itemTraversalSkeleton.traverse(ownerNode)
    } else {
      itemTraversalSkeleton.evaluator(PropertyEvaluator(MainLabel.ITEM, "deleted",
          foundEvaluation=Evaluation.EXCLUDE_AND_PRUNE,
          notFoundEvaluation=Evaluation.INCLUDE_AND_CONTINUE))
      .traverse(ownerNode)
    }
    val itemList = itemTraversal.nodes().toList
    if (itemList.isEmpty) {
      fail(INVALID_PARAMETER, ERR_ITEM_NOT_FOUND, "Item not found with given path")
    } else if (itemList.size > 1) {
      fail(INVALID_PARAMETER, ERR_ITEM_MORE_THAN_1, "More than one public item found with given path")
    } else {
      Right(itemList(0))
    }
  }

  protected def toPublicItems(ownerNode: Node, itemNodes: Iterable[Node], modified: Option[Long])(implicit neo4j: DatabaseService): Response[PublicItems] = {
    val noteBuffer = new ListBuffer[Note]
    val tagBuffer = new ListBuffer[Tag]
    val foreignTagBuffer = new ListBuffer[(UUID, scala.List[Tag])]
    val assigneeBuffer = new ListBuffer[Assignee]
    val unpublishedBuffer = new ListBuffer[UUID]
    val displayOwner = getDisplayOwner(ownerNode)
    itemNodes foreach (itemNode => {
      if (itemNode.hasProperty("unpublished") || itemNode.hasProperty("deleted")){
        unpublishedBuffer.append(getUUID(itemNode))
      }else if (!itemNode.hasProperty("draft")){ // public items returns only non-drafts
        val publicItemResult = toPublicItem(ownerNode, itemNode, displayOwner)
        if (publicItemResult.isLeft){
          return Left(publicItemResult.left.get)
        }else{
          noteBuffer.append(publicItemResult.right.get.note)
          if (publicItemResult.right.get.tags.isDefined){
            publicItemResult.right.get.tags.get.foreach ( tag => {
              if (tagBuffer.find(existingTag => existingTag.uuid.get.toString == tag.uuid.get.toString).isEmpty){
                tagBuffer.append(tag)
              }
            })
          }
          if (publicItemResult.right.get.collectiveTags.isDefined){
            publicItemResult.right.get.collectiveTags.get.foreach ( collectiveTags => {
              foreignTagBuffer.find(existingCollectiveTags => {
                existingCollectiveTags._1 == collectiveTags._1
              }).fold(
                // This collective does not yet exist, add the current as is
                foreignTagBuffer.append(collectiveTags)
              )(existingCollectiveTags => {
                // The collective already is there, replace the previous value with a joint value
                val jointTags = (existingCollectiveTags._1, (existingCollectiveTags._2 ++ collectiveTags._2).distinct)
                foreignTagBuffer -= existingCollectiveTags
                foreignTagBuffer.append(jointTags)
              })
            })
          }
          if (publicItemResult.right.get.assignee.isDefined){
            if (assigneeBuffer.find(existingAssignee => existingAssignee.uuid.toString == publicItemResult.right.get.assignee.get.uuid.toString).isEmpty){
              assigneeBuffer.append(publicItemResult.right.get.assignee.get)
            }
          }
        }
      }
    })
    val ownerPublicModified = ownerNode.getProperty("publicModified").asInstanceOf[Long]
    val content: Option[String] =
      if (ownerNode.hasProperty("content") &&
          (modified.isEmpty || ownerPublicModified > modified.get))
        Some(ownerNode.getProperty("content").asInstanceOf[String])
      else None
    val format: Option[String] =
      if (ownerNode.hasProperty("format") &&
          (modified.isEmpty || ownerPublicModified > modified.get))
        Some(ownerNode.getProperty("format").asInstanceOf[String])
      else None

    Right(PublicItems(
                owner = if (modified.isEmpty || ownerPublicModified > modified.get) Some(displayOwner) else None,
                content = content,
                format = format,
                modified = if (modified.isEmpty || ownerPublicModified > modified.get) Some(ownerPublicModified) else None,
                notes = if (noteBuffer.isEmpty) None else Some(noteBuffer.toList),
                tags = if (tagBuffer.isEmpty) None else Some(tagBuffer.toList),
                collectiveTags = if (foreignTagBuffer.isEmpty) None else Some(foreignTagBuffer.toList),
                assignees = if (assigneeBuffer.isEmpty) None else Some(assigneeBuffer.toList),
                unpublished = if (unpublishedBuffer.isEmpty) None else Some(unpublishedBuffer.toList)))
  }

  protected def toPublicItem(ownerNode: Node, itemNode: Node, displayOwner: String)(implicit neo4j: DatabaseService): Response[PublicItem] = {
    if (itemNode.hasLabel(ItemLabel.NOTE)){
      val owner = Owner(getUUID(ownerNode), None)
      for {
        tagRels <- getTagRelationships(itemNode, owner).right
        note <- toNote(itemNode, owner, tagRelationships=Some(tagRels), skipParent=true).right
        tagsResult <- getTagsWithParents(tagRels, owner).right
        assignee <- Right(getAssignee(itemNode)).right
      } yield PublicItem(displayOwner, note.copy(archived=None, favorited=None),
          tagsResult._1,
          tagsResult._2,
          assignee)
    }else{
      fail(INTERNAL_SERVER_ERROR, ERR_ITEM_NOT_NOTE, "Public item not note")
    }
  }

  private def getAssignee(itemNode: Node)(implicit neo4j: DatabaseService): Option[Assignee] = {
    itemNode.getRelationships.toList.find(relationship => {
      relationship.getType().name == ItemRelationship.IS_ASSIGNED_TO.name
    }).flatMap(assigneeRelationship =>
      Some(Assignee(getUUID(assigneeRelationship.getEndNode), getDisplayOwner(assigneeRelationship.getEndNode)))
    )
  }

  protected def getTagsWithParents(tagRels: Option[TagRelationships], owner: Owner)
          (implicit neo4j: DatabaseService): Response[(Option[scala.List[Tag]], Option[scala.List[(UUID, scala.List[Tag])]])] = {
    if (tagRels.isDefined){

      // FIRST: Owner tags

      val tagNodeBuffer = new ListBuffer[Node]
      if (tagRels.get.ownerTags.isDefined){
        tagRels.get.ownerTags.get.foreach(ownerTagRelationship => {
          tagNodeBuffer.append(ownerTagRelationship.getEndNode)
        })
        tagRels.get.ownerTags.get.foreach(ownerTagRelationship => {
          addNewAncestors(ownerTagRelationship.getEndNode, tagNodeBuffer)
        })
      }

      val tagBuffer = new ListBuffer[Tag]
      tagNodeBuffer.foreach(tagNode => {
        val tagResult = toTag(tagNode, owner)
        if (tagResult.isRight){
          tagBuffer.append(tagResult.right.get)
        }else{
          return Left(tagResult.left.get)
        }
      })

      // SECOND: Collective tags

      val collectiveTagNodeBuffer = new ListBuffer[(UUID, Node)]
      val collectiveTagBuffer = new ListBuffer[(UUID, scala.List[Tag])]

      if (tagRels.get.collectiveTags.isDefined){
        tagRels.get.collectiveTags.get.foreach(collectiveTagRelationship => {
          val ownerNode = getItemOwnerNode(collectiveTagRelationship.getEndNode)
          if (ownerNode.isDefined && ownerNode.get.hasLabel(OwnerLabel.COLLECTIVE)){
            collectiveTagNodeBuffer.append(
                (getUUID(ownerNode.get), collectiveTagRelationship.getEndNode()))
          }
        })
        collectiveTagNodeBuffer.foreach(collectiveTag => {
          addNewAncestors(collectiveTag, collectiveTagNodeBuffer)
        })
      }

      // Convert node buffer to tag buffer
      collectiveTagNodeBuffer.foreach(collectiveTagNode => {
        val tagResult = toTag(collectiveTagNode._2, owner)
        if (tagResult.isLeft) return Left(tagResult.left.get)
        collectiveTagBuffer.find(existingCollectiveTag => existingCollectiveTag._1 == collectiveTagNode._1).fold({
          collectiveTagBuffer.append( (collectiveTagNode._1, scala.List(tagResult.right.get)) )
        })(existingCollectiveTags => {
          val jointTags = (existingCollectiveTags._1, (existingCollectiveTags._2 :+ tagResult.right.get).distinct)
          collectiveTagBuffer -= existingCollectiveTags
          collectiveTagBuffer.append(jointTags)
        })
      })

      Right(( if (!tagBuffer.isEmpty) Some(tagBuffer.toList) else None,
              if (!collectiveTagBuffer.isEmpty) Some(collectiveTagBuffer.toList) else None))
    }else{
      Right((None, None))
    }
  }

  protected def getCollectiveTagEndNodeUUIDList(collectiveTagRelationships: Option[scala.List[Relationship]])(implicit neo4j: DatabaseService): Option[scala.List[(UUID, scala.List[UUID])]] = {
    collectiveTagRelationships.flatMap(collectiveTagRelationships => {
      val foreignTagBuffer = new ListBuffer[(UUID, scala.List[UUID])]
      collectiveTagRelationships.map(collectiveTagRelationship => {
        val ownerNode = getItemOwnerNode(collectiveTagRelationship.getEndNode())
        if (ownerNode.isDefined){
          val ownerUUID = getUUID(ownerNode.get)
          foreignTagBuffer.find(existingCollectiveTags => {
            existingCollectiveTags._1 == ownerUUID
          }).fold(
            foreignTagBuffer.append((ownerUUID, scala.List(getUUID(collectiveTagRelationship.getEndNode))))
          )(existingCollectiveTags => {
            val jointTags = (existingCollectiveTags._1, (existingCollectiveTags._2 :+ getUUID(collectiveTagRelationship.getEndNode)).distinct)
            foreignTagBuffer -= existingCollectiveTags
            foreignTagBuffer.append(jointTags)
          })
        }
      })
      Some(foreignTagBuffer.toList)
    })
  }

  protected def removeCollectiveTagRelationships(collectiveNode: Node, userNode: Node)(implicit neo4j: DatabaseService): Response[Unit] = {
    for {
      userItemNodes <- getItemNodes(getUUID(userNode), None, true, true, true, true).right
      unit <- Right(removeCollectiveTagRelationships(collectiveNode, userItemNodes)).right
    } yield unit
  }

  protected def removeCollectiveTagRelationships(collectiveNode: Node, itemNodes: Iterable[Node])(implicit neo4j: DatabaseService): Unit = {
    itemNodes.foreach(itemNode => {
      if (itemNode.hasLabel(ItemLabel.LIST) || itemNode.hasLabel(ItemLabel.NOTE) || itemNode.hasLabel(ItemLabel.TASK)){
        itemNode.getRelationships().foreach(relationship => {
          if (relationship.getType().name == ItemRelationship.HAS_TAG.name){
            val ownerNode = getItemOwnerNode(itemNode)
            if (ownerNode.isDefined || ownerNode.get == collectiveNode){
              // Remove the relationship
              relationship.delete()
            }
          }
        })
      }
    })
  }



  protected def removeCollectiveAssigneeRelationships(collectiveNode: Node, userNode: Node)(implicit neo4j: DatabaseService): Unit = {
    val itemsIndex = neo4j.gds.index().forNodes("items")
    val ownerQuery = new TermQuery(new Term("owner", UUIDUtils.getTrimmedBase64UUIDForLucene(getUUID(collectiveNode))))
    val assigneeQuery = new TermQuery(new Term("assignee", UUIDUtils.getTrimmedBase64UUIDForLucene(getUUID(userNode))))
    val userQuery = new BooleanQuery;
    userQuery.add(ownerQuery, BooleanClause.Occur.MUST);
    userQuery.add(assigneeQuery, BooleanClause.Occur.MUST);
    val assignedItemNodeList = itemsIndex.query(userQuery).toList
    if (!assignedItemNodeList.isEmpty){
      assignedItemNodeList.foreach(assignedItemNode => {
        // Remove assignee key from index
        itemsIndex.remove(assignedItemNode, "assignee")
        // Remove assign relationship
        val assignedItemRelationships = assignedItemNode.getRelationships()
        val assignRelationship = assignedItemRelationships.find(
            relationship => {
              relationship.getEndNode() == userNode &&
              relationship.getType().name == ItemRelationship.IS_ASSIGNED_TO.name
            })
        if (assignRelationship.isDefined){
          assignRelationship.get.delete()
        }
      })
    }
  }
}