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
          ownerNode <- getNode(userUUID, MainLabel.OWNER).right
          itemNode <- getItemNode(ownerNode, itemUUID).right
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

  // PRIVATE

  protected def getItems(itemNodes: Iterable[Node], userUUID: UUID)(implicit neo4j: DatabaseService): Response[Items] = {
    val itemBuffer = new ListBuffer[Item]
    val taskBuffer = new ListBuffer[Task]
    val noteBuffer = new ListBuffer[Note]
    itemNodes foreach (itemNode =>
      if (itemNode.hasLabel(ItemLabel.NOTE)) {
        val note = toNote(itemNode, userUUID)
        if (note.isLeft) {
          return fail(INTERNAL_SERVER_ERROR, "Could not convert note: " + note.left.get)
        }
        noteBuffer.append(note.right.get)
      } else if (itemNode.hasLabel(ItemLabel.TASK)) {
        val task = toTask(itemNode, userUUID)
        if (task.isLeft) {
          return fail(INTERNAL_SERVER_ERROR, task.left.get.toString)
        }
        taskBuffer.append(task.right.get)
      } else {
        val item = toCaseClass[Item](itemNode)
        if (item.isLeft) {
          return fail(INTERNAL_SERVER_ERROR, "Could not convert item: " + item.left.get)
        }
        itemBuffer.append(item.right.get)
      })
    Right(Items(
      if (itemBuffer.isEmpty) None else Some(itemBuffer.toList),
      if (taskBuffer.isEmpty) None else Some(taskBuffer.toList),
      if (noteBuffer.isEmpty) None else Some(noteBuffer.toList)))
  }
  
  // Methods for converting tasks and nodes
  def toTask(taskNode: Node, userUUID: UUID)(implicit neo4j: DatabaseService): Response[Task];
  def toNote(noteNode: Node, userUUID: UUID)(implicit neo4j: DatabaseService): Response[Note];
  
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

  protected def createItem(userUUID: UUID, item: AnyRef, extraLabel: Option[Label] = None): Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          itemNode <- createItem(userNode, item, extraLabel).right
        } yield itemNode
    }
  }

  protected def createItem(userNode: Node, item: AnyRef, extraLabel: Option[Label])(implicit neo4j: DatabaseService): Response[Node] = {
    val itemNode = createNode(item, MainLabel.ITEM)
    if (extraLabel.isDefined)itemNode.addLabel(extraLabel.get)
    // Attach it to the user
    userNode --> SecurityRelationship.OWNS --> itemNode
    Right(itemNode)
  }

  protected def updateItem(userUUID: UUID, itemUUID: UUID, item: AnyRef, additionalLabel: Option[Label] = None): Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          userNode <- getNode(userUUID, OwnerLabel.USER).right
          itemNode <- getItemNode(userNode, itemUUID).right
          itemNode <- Right(setLabel(itemNode, additionalLabel)).right
          itemNode <- updateNode(itemNode, item).right
        } yield itemNode
    }
  }

  protected def setLabel(node: Node, additionalLabel: Option[Label])(implicit neo4j: DatabaseService): Node = {
    if (additionalLabel.isDefined && !node.hasLabel(additionalLabel.get))
      node.addLabel(additionalLabel.get)
    node
  }

  protected def getItemNode(userNode: Node, itemUUID: UUID, mandatoryLabel: Option[Label] = None)(implicit neo4j: DatabaseService): Response[Node] = {
    val itemNode = if (mandatoryLabel.isDefined) getNode(itemUUID, mandatoryLabel.get)
                   else getNode(itemUUID, MainLabel.ITEM)
    if (itemNode.isLeft) return itemNode              

    val userFromItem: TraversalDescription =
      Traversal.description()
        .relationships(DynamicRelationshipType.withName(SecurityRelationship.OWNS.name),
          Direction.INCOMING)
        .depthFirst()
        .evaluator(Evaluators.excludeStartPosition())
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

  def putExistingExtendedItem(userUUID: UUID, taskUUID: UUID, extItem: ExtendedItem, label: Label): Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          itemNode <- updateItem(userUUID, taskUUID, extItem, Some(label)).right
          parentNodes <- setParentNodes(itemNode, userUUID, extItem).right
        } yield itemNode
    }
  }
  
  def putNewExtendedItem(userUUID: UUID, extItem: ExtendedItem, label: Label): Response[Node] = {
    withTx {
      implicit neo4j =>
        for {
          itemNode <- createItem(userUUID, extItem, Some(label)).right
          parentNodes <- setParentNodes(itemNode, userUUID, extItem).right
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
        if (UUIDUtils.getUUID(oldParentRelationship.get.getEndNode().getProperty("uuid").asInstanceOf[String]) 
              == parentUUID.get){
          return Right(oldParentRelationship)
        }else{
          deleteParentRelationship(oldParentRelationship.get)
        }
      }
      val newParentLabel = if (parentLabel == ItemLabel.NOTE) ItemParentLabel.AREA else ItemParentLabel.PROJECT
      for{
        parentNode <- getItemNode(userNode, parentUUID.get, Some(parentLabel)).right
        parentRelationship <- Right(createParentRelationship(itemNode, parentNode, newParentLabel)).right
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
        .relationships(DynamicRelationshipType.withName(ItemRelationship.PARENT.name), Direction.INCOMING)
        .evaluator(Evaluators.excludeStartPosition())
        .depthFirst()
        .evaluator(Evaluators.toDepth(1))
    val traverser = itemsFromParent.traverse(itemNode)
    if (traverser.relationships().toList.length > 0)
      true
    else
      false
  }

  protected def createParentRelationship(itemNode: Node, parentNode: Node, newParentLabel: Label)(implicit neo4j: DatabaseService): Relationship = {
    val relationship = itemNode --> ItemRelationship.PARENT --> parentNode <;
    if (!parentNode.hasLabel(newParentLabel))
      parentNode.addLabel(newParentLabel)
    relationship
  }
  
  protected def getParentRelationships(itemNode: Node, userUUID: UUID)(implicit neo4j: DatabaseService): Response[Tuple2[Option[Relationship], Option[Relationship]]] = {
    val parentNodesFromItem: TraversalDescription =
      Traversal.description()
        .depthFirst()
        .expand(new OrderedByTypeExpander()
          .add(DynamicRelationshipType.withName(ItemRelationship.PARENT.name), Direction.OUTGOING)
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
    var previousRelationship: Relationship = null
    relationshipList foreach (relationship => {
      if (relationship.getStartNode().hasLabel(MainLabel.OWNER) 
          && (previousRelationship != null && previousRelationship.getEndNode() == relationship.getEndNode())){
        if (relationship.getEndNode().hasLabel(ItemParentLabel.PROJECT))
          parentProject = Some(previousRelationship)
        else if (relationship.getEndNode().hasLabel(ItemParentLabel.AREA))
          parentArea = Some(previousRelationship)
      }
      previousRelationship = relationship
    })

    Right((parentProject, parentArea))
  }
  
}