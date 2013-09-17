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

trait ItemDatabase extends AbstractGraphDatabase {

  // PUBLIC

  def putNewItem(userUUID: UUID, item: Item): Response[SetResult] = {
    for {
      itemNode <- createItem(userUUID, item).right
      result <- Right(getSetResult(itemNode, true)).right
    } yield result
  }

  def putExistingItem(userUUID: UUID, itemUUID: UUID, item: Item): Response[SetResult] = {
    for {
      item <- updateItem(userUUID, itemUUID, item).right
      result <- Right(getSetResult(item, false)).right
    } yield result
  }

  def getItem(userUUID: UUID, itemUUID: UUID): Response[Item] = {
    withTx {
      implicit neo =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          itemNode <- getItemNode(userNode, itemUUID).right
          item <- toCaseClass[Item](itemNode).right
        } yield item
    }
  }

  def getItems(userUUID: UUID): Response[Items] = {
    withTx {
      implicit neo =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          itemNodes <- getItemNodes(userNode).right
          items <- getItems(itemNodes, userUUID).right
        } yield items
    }
  }
  
  def deleteItem(userUUID: UUID, itemUUID: UUID): Response[DeleteItemResult] = {
    for {
      deletedItem <- deleteItemNode(userUUID, itemUUID).right
      result <- Right(getDeleteItemResult(deletedItem._1, deletedItem._2)).right
    } yield result
  }
  
  def undeleteItem(userUUID: UUID, itemUUID: UUID, mandatoryLabel: Option[Label] = None): Response[SetResult] = {
    for {
      item <- undeleteItemNode(userUUID, itemUUID, mandatoryLabel).right
      result <- Right(getSetResult(item, false)).right
    } yield result
  }
  
  // PRIVATE

  protected def getItems(itemNodes: Iterable[Node], userUUID: UUID)(implicit neo4j: DatabaseService): Response[Items] = {
    val itemBuffer = new ListBuffer[Item]
    val taskBuffer = new ListBuffer[Task]
    val noteBuffer = new ListBuffer[Note]
    val tagBuffer = new ListBuffer[Tag]

    itemNodes foreach (itemNode =>
      if (itemNode.hasLabel(ItemLabel.NOTE)) {
        val note = toNote(itemNode, userUUID)
        if (note.isLeft) {
          return fail(INTERNAL_SERVER_ERROR, note.left.get.toString)
        }
        noteBuffer.append(note.right.get)
      } else if (itemNode.hasLabel(ItemLabel.TASK)) {
        val task = toTask(itemNode, userUUID)
        if (task.isLeft) {
          return fail(INTERNAL_SERVER_ERROR, task.left.get.toString)
        }
        taskBuffer.append(task.right.get)
      } else if (itemNode.hasLabel(ItemLabel.TAG)) {
        val tag = toTag(itemNode, userUUID)
        if (tag.isLeft) {
          return fail(INTERNAL_SERVER_ERROR, tag.left.get.toString)
        }
        tagBuffer.append(tag.right.get)
        
      }
      else {
        val item = toCaseClass[Item](itemNode)
        if (item.isLeft) {
          return fail(INTERNAL_SERVER_ERROR, "Could not convert item: " + item.left.get)
        }
        itemBuffer.append(item.right.get)
      })
    Right(Items(
      if (itemBuffer.isEmpty) None else Some(itemBuffer.toList),
      if (taskBuffer.isEmpty) None else Some(taskBuffer.toList),
      if (noteBuffer.isEmpty) None else Some(noteBuffer.toList),
      if (tagBuffer.isEmpty) None else Some(tagBuffer.toList)))
  }
  
  // Methods for converting tasks and nodes
  def toTask(taskNode: Node, userUUID: UUID)(implicit neo4j: DatabaseService): Response[Task];
  def toNote(noteNode: Node, userUUID: UUID)(implicit neo4j: DatabaseService): Response[Note];
  def toTag(tagNode: Node, userUUID: UUID)(implicit neo4j: DatabaseService): Response[Tag];

  protected def getItemNodes(userNode: Node)(implicit neo4j: DatabaseService): Response[Iterable[Node]] = {
    val itemsFromOwner: TraversalDescription =
      Traversal.description()
        .relationships(DynamicRelationshipType.withName(SecurityRelationship.OWNS.name),
          Direction.OUTGOING)
        .depthFirst()
        .evaluator(Evaluators.excludeStartPosition())
        .evaluator(LabelEvaluator(List(MainLabel.ITEM)))
        .evaluator(PropertyEvaluator(
            ItemLabel.TASK, "completed",
            Evaluation.EXCLUDE_AND_PRUNE,
            Evaluation.INCLUDE_AND_CONTINUE))

    val traverser = itemsFromOwner.traverse(userNode)
    Right(traverser.nodes())
  }

  protected def createItem(userUUID: UUID, item: AnyRef, 
                           extraLabel: Option[Label] = None, extraSubLabel: Option[Label] = None): 
                           Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          itemNode <- createItem(userNode, item, extraLabel, extraSubLabel).right
        } yield itemNode
    }
  }

  protected def createItem(userNode: Node, item: AnyRef, extraLabel: Option[Label], extraSubLabel: Option[Label])
            (implicit neo4j: DatabaseService): Response[Node] = {
    val itemNode = createNode(item, MainLabel.ITEM)
    if (extraLabel.isDefined){
      itemNode.addLabel(extraLabel.get)
      if (extraSubLabel.isDefined){
        itemNode.addLabel(extraSubLabel.get)
      }
    }
    // Attach it to the user
    userNode --> SecurityRelationship.OWNS --> itemNode
    Right(itemNode)
  }

  protected def updateItem(userUUID: UUID, itemUUID: UUID, item: AnyRef, 
                          additionalLabel: Option[Label] = None, 
                          additionalSubLabel: Option[Tuple2[Label, Label]] = None): Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          itemNode <- getItemNode(userNode, itemUUID, exactLabelMatch = false).right
          itemNode <- Right(setLabel(itemNode, additionalLabel, additionalSubLabel)).right
          itemNode <- updateNode(itemNode, item).right
        } yield itemNode
    }
  }

  protected def setLabel(node: Node, additionalLabel: Option[Label], additionalSubLabel: Option[Tuple2[Label, Label]])(implicit neo4j: DatabaseService): Node = {
    if (additionalLabel.isDefined && !node.hasLabel(additionalLabel.get)){
      node.addLabel(additionalLabel.get)
      if (additionalSubLabel.isDefined && !node.hasLabel(additionalSubLabel.get._1)){
        node.addLabel(additionalSubLabel.get._1)
        // Need to remove the other as the sublabel is either or
        if (node.hasLabel(additionalSubLabel.get._2))
          node.removeLabel(additionalSubLabel.get._2)
      }
    }
    node
  }

  protected def getItemNode(userNode: Node, itemUUID: UUID, mandatoryLabel: Option[Label] = None, 
                            acceptDeleted: Boolean = false, exactLabelMatch: Boolean = true)
                           (implicit neo4j: DatabaseService): Response[Node] = {
    val itemNode = if (mandatoryLabel.isDefined) getNode(itemUUID, mandatoryLabel.get, acceptDeleted)
                   else getNode(itemUUID, MainLabel.ITEM, acceptDeleted)
    if (itemNode.isLeft) return itemNode              
    
    // If searching for just ITEM, needs to fail for tasks and notes
    if (exactLabelMatch && mandatoryLabel.isEmpty && 
        (itemNode.right.get.hasLabel(ItemLabel.NOTE) 
         || itemNode.right.get.hasLabel(ItemLabel.TASK)
         || itemNode.right.get.hasLabel(ItemLabel.TAG))){
      return fail(INVALID_PARAMETER, "item already either note, task or tag with UUID " + itemUUID)
    }
    
    val userFromItem: TraversalDescription = {
      if (acceptDeleted){
        Traversal.description()
          .relationships(DynamicRelationshipType.withName(SecurityRelationship.OWNS.name),
            Direction.INCOMING)
          .depthFirst()
          .evaluator(Evaluators.excludeStartPosition())
      }else{
        Traversal.description()
          .relationships(DynamicRelationshipType.withName(SecurityRelationship.OWNS.name),
            Direction.INCOMING)
          .depthFirst()
          .evaluator(Evaluators.excludeStartPosition())
          .evaluator(PropertyEvaluator(
            MainLabel.ITEM, "deleted",
            Evaluation.EXCLUDE_AND_PRUNE,
            Evaluation.INCLUDE_AND_CONTINUE))
      }
    }
    val traverser = userFromItem.traverse(itemNode.right.get)
    val itemNodeList = traverser.nodes().toArray
    if (itemNodeList.length == 0) {
      fail(INVALID_PARAMETER, "Item " + itemUUID + " has no owner")
    } else if (itemNodeList.length > 1) {
      fail(INTERNAL_SERVER_ERROR, "More than one owner found for item with UUID " + itemUUID)
    } else {
      val user = itemNodeList.head
      if (userNode != user){
        fail(INVALID_PARAMETER, "Item " + itemUUID + " does not belong to user " 
            + getUUID(userNode))
      }else{
        Right(itemNode.right.get)
      }
    }
  }

  def putExistingExtendedItem(userUUID: UUID, itemUUID: UUID, extItem: ExtendedItem, 
                              label: Label, subLabel: Option[Tuple2[Label, Label]] = None): 
        Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          itemNode <- updateItem(userUUID, itemUUID, extItem, Some(label), subLabel).right
          parentNodes <- setParentNodes(itemNode, userUUID, extItem).right
          tagNodes <- setTagNodes(itemNode, userUUID, extItem).right
        } yield itemNode
    }
  }

  def putNewExtendedItem(userUUID: UUID, extItem: ExtendedItem, label: Label, subLabel: Option[Label] = None): 
          Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          itemNode <- createItem(userUUID, extItem, Some(label), subLabel).right
          parentNodes <- setParentNodes(itemNode, userUUID, extItem).right
          tagNodes <- setTagNodes(itemNode, userUUID, extItem).right
        } yield itemNode
    }
  }

  protected def setParentNodes(itemNode: Node,  userUUID: UUID, extItem: ExtendedItem)(implicit neo4j: DatabaseService): Response[Tuple2[Option[Relationship], Option[Relationship]]] = {
    for {
      userNode <- getNode(userUUID, OwnerLabel.USER).right
      oldParentRelationships <- getParentRelationships(itemNode, userUUID).right
      newParentTaskRelationship <- setParentRelationship(itemNode, userNode, extItem.parentTask, 
          oldParentRelationships._1, ItemLabel.TASK).right
      newParentNoteRelationship <- setParentRelationship(itemNode, userNode, extItem.parentNote, 
          oldParentRelationships._2, ItemLabel.NOTE).right
      parentList <- Right((newParentTaskRelationship, newParentNoteRelationship)).right
    }yield parentList
  }

  protected def setParentRelationship(itemNode: Node, userNode: Node, parentUUID: Option[UUID], oldParentRelationship: Option[Relationship],
                              parentLabel: Label)(implicit neo4j: DatabaseService): Response[Option[Relationship]] = {
    if (parentUUID.isDefined){
      if (oldParentRelationship.isDefined){
        if (getUUID(oldParentRelationship.get.getEndNode()) 
              == parentUUID.get){
          return Right(oldParentRelationship)
        }else{
          deleteParentRelationship(oldParentRelationship.get)
        }
      }
      val newParentLabel = if (parentLabel == ItemLabel.NOTE) Some(ItemParentLabel.AREA) 
                           else if (parentLabel == ItemLabel.TASK) Some(ItemParentLabel.PROJECT)
                           else None
      for{
        parentNode <- getItemNode(userNode, parentUUID.get, Some(parentLabel)).right
        parentRelationship <- createParentRelationship(itemNode, parentNode, newParentLabel).right
      }yield Some(parentRelationship)
    }else{
      if (oldParentRelationship.isDefined){
        deleteParentRelationship(oldParentRelationship.get)
      }
      Right(None)
    } 
  }
  
  protected def deleteParentRelationship(parentRelationship: Relationship)(implicit neo4j: DatabaseService) : Unit = {
    val parentNode = parentRelationship.getEndNode()
    parentRelationship.delete()
    // If there are no more children, remove the parent label as well
    if (!hasChildren(parentNode)){
      if (parentNode.hasLabel(ItemParentLabel.PROJECT))
        parentNode.removeLabel(ItemParentLabel.PROJECT)
      else if (parentNode.hasLabel(ItemParentLabel.AREA))
        parentNode.removeLabel(ItemParentLabel.AREA)
    }
  }
  
  protected def hasChildren(itemNode: Node)(implicit neo4j: DatabaseService): Boolean = {
    val itemsFromParent: TraversalDescription =
      Traversal.description()
        .depthFirst()
        .relationships(DynamicRelationshipType.withName(ItemRelationship.HAS_PARENT.name), Direction.INCOMING)
        .evaluator(Evaluators.excludeStartPosition())
        .depthFirst()
        .evaluator(Evaluators.toDepth(1))
    val traverser = itemsFromParent.traverse(itemNode)
    if (traverser.relationships().toList.length > 0)
      true
    else
      false
  }

  protected def createParentRelationship(itemNode: Node, parentNode: Node, newParentLabel: Option[Label])
              (implicit neo4j: DatabaseService): Response[Relationship] = {
    if (newParentLabel.isDefined){
      if(!parentNode.hasLabel(newParentLabel.get))
        parentNode.addLabel(newParentLabel.get)
    }else{
      // Both parent and child need to have the same labels
      itemNode.getLabels() foreach (label => {
        if (!parentNode.hasLabel(label)) fail(INVALID_PARAMETER, "Parent needs to be the same type as the child")
      })
    }
    val relationship = itemNode --> ItemRelationship.HAS_PARENT --> parentNode <;
    Right(relationship)
  }
  
  protected def getParentRelationships(itemNode: Node, userUUID: UUID)(implicit neo4j: DatabaseService): 
            Response[Tuple3[Option[Relationship], Option[Relationship], Option[Relationship]]] = {
    val parentNodesFromItem: TraversalDescription =
      Traversal.description()
        .depthFirst()
        .expand(new OrderedByTypeExpander()
          .add(DynamicRelationshipType.withName(ItemRelationship.HAS_PARENT.name), Direction.OUTGOING)
          .add(DynamicRelationshipType.withName(SecurityRelationship.OWNS.name), Direction.INCOMING)
          .asInstanceOf[PathExpander[_]])
        .evaluator(Evaluators.excludeStartPosition())
        .evaluator(LabelEvaluator(List(MainLabel.ITEM), 
                                  foundEvaluation = Evaluation.INCLUDE_AND_CONTINUE, 
                                  notFoundEvaluation = Evaluation.EXCLUDE_AND_PRUNE, 
                                  length = Some(1)))
        .evaluator(UUIDEvaluator(userUUID, length = Some(2)))
        .evaluator(Evaluators.toDepth(2))
        .uniqueness(Uniqueness.NODE_PATH) // We want to get the userUUID twice to be sure that we have the same owner for both paths

    val traverser = parentNodesFromItem.traverse(itemNode)
    val relationshipList = traverser.relationships().toArray

    // Correct relationships are in order ITEM->ITEM then OWNER->ITEM
    var parentProject: Option[Relationship] = None
    var parentArea: Option[Relationship] = None
    var parentTag: Option[Relationship] = None
    var previousRelationship: Relationship = null
    relationshipList foreach (relationship => {
      if (relationship.getStartNode().hasLabel(MainLabel.OWNER) 
          && (previousRelationship != null && previousRelationship.getEndNode() == relationship.getEndNode())){
        if (relationship.getEndNode().hasLabel(ItemParentLabel.PROJECT))
          parentProject = Some(previousRelationship)
        else if (relationship.getEndNode().hasLabel(ItemParentLabel.AREA))
          parentArea = Some(previousRelationship)
        else if (relationship.getEndNode().hasLabel(ItemLabel.TAG))
          parentTag = Some(previousRelationship)
      }
      previousRelationship = relationship
    })

    Right((parentProject, parentArea, parentTag))
  }
  
  
  protected def setTagNodes(itemNode: Node, userUUID: UUID, extItem: ExtendedItem)
        (implicit neo4j: DatabaseService): Response[Option[List[Relationship]]] = {
    for {
      userNode <- getNode(userUUID, OwnerLabel.USER).right
      oldTagRelationships <- getTagRelationships(itemNode, userUUID).right
      newTagRelationships <- setTagRelationships(itemNode, userNode, extItem.tags, 
          oldTagRelationships).right
    }yield newTagRelationships
  }
  
  protected def setTagRelationships(itemNode: Node, userNode: Node, tagUUIDList: Option[List[UUID]], 
        oldTagRelationships: Option[List[Relationship]])
        (implicit neo4j: DatabaseService): Response[Option[List[Relationship]]] = {
    if (tagUUIDList.isDefined){
      val oldTagUUIDList = if (oldTagRelationships.isDefined) getEndNodeUUIDList(oldTagRelationships.get) else List()
      // Get all new UUIDs
      val newUUIDList = tagUUIDList.get.diff(oldTagUUIDList)      
      // Get all removed UUIDs
      val removedUUIDList = oldTagUUIDList.diff(tagUUIDList.get)
      
      for {
        newTagNodes <- getNodes(newUUIDList, ItemLabel.TAG).right
        newTagRelationships <- createTagRelationships(itemNode, newTagNodes).right 
        removedTagNodes <- getNodes(removedUUIDList, ItemLabel.TAG).right
        removedTagRelationships <- getTagRelationships(itemNode, removedTagNodes).right
        result <- Right(deleteTagRelationships(removedTagRelationships)).right
      }yield newTagRelationships
    }else{
      deleteTagRelationships(oldTagRelationships)
      Right(None)
    } 
  }

  protected def deleteTagRelationships(tagRelationships: Option[List[Relationship]])(implicit neo4j: DatabaseService) : Unit = {
    if (tagRelationships.isDefined){
      tagRelationships.get foreach (tagRelationship => {
        tagRelationship.delete()
      })
    }
  }
  
  protected def createTagRelationships(itemNode: Node, tagNodes: List[Node])
              (implicit neo4j: DatabaseService): Response[Option[List[Relationship]]] = {
    if (tagNodes.isEmpty) return Right(None)
    Right(Some(tagNodes map (tagNode => {
      itemNode --> ItemRelationship.HAS_TAG --> tagNode <;
    })))
  }
  
  protected def getTagRelationships(itemNode: Node, userUUID: UUID)(implicit neo4j: DatabaseService): 
            Response[Option[List[Relationship]]] = {
    val tagNodesFromItem: TraversalDescription =
    Traversal.description()
        .depthFirst()
        .expand(new OrderedByTypeExpander()
          .add(DynamicRelationshipType.withName(ItemRelationship.HAS_TAG.name), Direction.OUTGOING)
          .add(DynamicRelationshipType.withName(SecurityRelationship.OWNS.name), Direction.INCOMING)
          .asInstanceOf[PathExpander[_]])
        .evaluator(Evaluators.excludeStartPosition())
        .evaluator(LabelEvaluator(List(MainLabel.ITEM), 
                                  foundEvaluation = Evaluation.INCLUDE_AND_CONTINUE, 
                                  notFoundEvaluation = Evaluation.EXCLUDE_AND_PRUNE, 
                                  length = Some(1)))
        .evaluator(UUIDEvaluator(userUUID, length = Some(2)))
        .evaluator(Evaluators.toDepth(2))
        .uniqueness(Uniqueness.NODE_PATH) // We want to get the userUUID twice to be sure that we have the same owner for both paths

    val traverser = tagNodesFromItem.traverse(itemNode)
    val relationshipList = traverser.relationships().toArray

    val tagRelationshipBuffer = new ListBuffer[Relationship]
    var previousRelationship: Relationship = null
    relationshipList foreach (relationship => {
      if (relationship.getStartNode().hasLabel(MainLabel.OWNER) 
          && (previousRelationship != null && previousRelationship.getEndNode() == relationship.getEndNode())){
        if (relationship.getEndNode().hasLabel(ItemLabel.TAG))
          tagRelationshipBuffer.append(previousRelationship)
      }
      previousRelationship = relationship
    })
    
    if (tagRelationshipBuffer.isEmpty) Right(None)
    else Right(Some(tagRelationshipBuffer.toList))
  }
  
  protected def getTagRelationships(itemNode: Node, tagNodes: List[Node])(implicit neo4j: DatabaseService): 
            Response[Option[List[Relationship]]] = {
    if (tagNodes.isEmpty) return Right(None)

    val tagNodesFromItem: TraversalDescription =
      Traversal.description()
          .depthFirst()
          .relationships(DynamicRelationshipType.withName(ItemRelationship.HAS_TAG.name), Direction.OUTGOING)
          .evaluator(Evaluators.excludeStartPosition())
          .evaluator(LabelEvaluator(List(ItemLabel.TAG)))
          .evaluator(Evaluators.endNodeIs(Evaluation.INCLUDE_AND_PRUNE, Evaluation.EXCLUDE_AND_PRUNE, 
                                          tagNodes:_*))
          .evaluator(Evaluators.toDepth(1))

    val traverser = tagNodesFromItem.traverse(itemNode)
    val relationshipList = traverser.relationships().toList

    if (relationshipList.size != tagNodes.size){
      fail(INVALID_PARAMETER, "Every given tag UUID is not attached to the item " + getUUID(itemNode))
    }else{
      Right(Some(relationshipList))
    }
  }
  
  protected def deleteItemNode(userUUID: UUID, itemUUID: UUID): Response[Tuple2[Node, Long]] = {
    withTx {
      implicit neo =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          itemNode <- getItemNode(userNode, itemUUID).right
          deleted <- Right(deleteItem(itemNode)).right
        } yield (itemNode, deleted)
    }
  }
  
  protected def undeleteItemNode(userUUID: UUID, itemUUID: UUID, mandatoryLabel: Option[Label] = None): Response[Node] = {
    withTx {
      implicit neo =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          itemNode <- getItemNode(userNode, itemUUID, mandatoryLabel, acceptDeleted = true).right
          success <- Right(undeleteItem(itemNode)).right
        } yield itemNode
    }
  }

  protected def deleteItem(itemNode: Node)(implicit neo4j: DatabaseService): Long = {
    val deleted = System.currentTimeMillis()
    itemNode.setProperty("deleted", deleted)
    deleted
  }

  protected def undeleteItem(itemNode: Node)(implicit neo4j: DatabaseService): Unit = {
    if(itemNode.hasProperty("deleted")){
      itemNode.removeProperty("deleted")
    }
  }

  protected def getDeleteItemResult(item: Node, deleted: Long): DeleteItemResult = {
    withTx {
      implicit neo4j =>
        DeleteItemResult(deleted, getSetResult(item, false))
    }
  }
}