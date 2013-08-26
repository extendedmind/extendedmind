package org.extendedmind.db

import java.util.UUID
import scala.collection.JavaConversions.iterableAsScalaIterable
import org.extendedmind.Response._
import org.extendedmind._
import org.extendedmind.domain._
import org.neo4j.graphdb.Direction
import org.neo4j.graphdb.DynamicRelationshipType
import org.neo4j.graphdb.Node
import org.neo4j.graphdb.traversal.Evaluators
import org.neo4j.graphdb.traversal.TraversalDescription
import org.neo4j.kernel.Traversal
import org.neo4j.scala.DatabaseService
import scala.collection.mutable.ListBuffer

trait ItemDatabase extends AbstractGraphDatabase with UserDatabase{

  // PUBLIC
  
  def putNewItem(userUUID: UUID, item: Item): Response[SetResult] = {
    for{
      itemNode <- createItem(userUUID, item).right
      result <- Right(getSetResult(itemNode, true)).right
    }yield result
  }

  def putExistingItem(userUUID: UUID, itemUUID: UUID, item: Item): Response[SetResult] = {
    for{
      item <- updateItem(userUUID, itemUUID, item).right
      result <- Right(getSetResult(item, false)).right
    }yield result
  }

  def getItem(userUUID: UUID, itemUUID: UUID): Response[Item] = {
    withTx{
      implicit neo =>
        for{
          userNode <- getUserNode(userUUID).right
          itemNode <- getItemNode(userNode, itemUUID).right
          item <- toCaseClass[Item](itemNode).right
        }yield item
    }
  }

  def getItems(userUUID: UUID): Response[Items] = {
    withTx{
      implicit neo =>
        for{
          userNode <- getUserNode(userUUID).right
          itemNodes <- getItemNodes(userNode).right
          items <- getItems(itemNodes).right
        }yield items
    }
  }
  
  
  // PRIVATE
  
  protected def getItems(itemNodes: Iterable[Node])(implicit neo4j: DatabaseService): Response[Items] = {
    val itemBuffer = new ListBuffer[Item]
    val taskBuffer = new ListBuffer[Task]
    val noteBuffer = new ListBuffer[Note]
    itemNodes foreach (itemNode => 
      if (itemNode.hasLabel(ItemLabel.NOTE)){
        val note = toCaseClass[Note](itemNode)
        if (note.isLeft){
          return fail(INTERNAL_SERVER_ERROR, "Could not convert note: " + note.left.get)
        }
        noteBuffer.append(note.right.get)
      }
      else if (itemNode.hasLabel(ItemLabel.TASK)){
        val task = toCaseClass[Task](itemNode)
        if (task.isLeft){
          return fail(INTERNAL_SERVER_ERROR, "Could not convert task: " + task.left.get)
        }
        taskBuffer.append(task.right.get)
      }else{
        val item = toCaseClass[Item](itemNode)
        if (item.isLeft){
          return fail(INTERNAL_SERVER_ERROR, "Could not convert item: " + item.left.get)
        }
        itemBuffer.append(item.right.get)        
      }
    )
    Right(Items(
        if (itemBuffer.isEmpty) None else Some(itemBuffer.toList),
        if (taskBuffer.isEmpty) None else Some(taskBuffer.toList),
        if (noteBuffer.isEmpty) None else Some(noteBuffer.toList)
    ))
  }
  
  protected def getItemNodes(userNode: Node)(implicit neo4j: DatabaseService): Response[Iterable[Node]] = {
    val itemsFromUser: TraversalDescription = 
        Traversal.description()
          .relationships(DynamicRelationshipType.withName(UserRelationship.OWNS.name), 
                         Direction.OUTGOING)
          .breadthFirst()
          .evaluator(Evaluators.excludeStartPosition())
          .evaluator(LabelEvaluator(MainLabel.ITEM))
          .evaluator(ExcludeHasPropertyEvaluator(ItemLabel.TASK, "completed"))

    val traverser = itemsFromUser.traverse(userNode)
    Right(traverser.nodes())
  }
  
  protected def createItem(userUUID: UUID, item: AnyRef, extraLabel: Option[Label] = None): Response[Node] = {
    withTx{
      implicit neo4j =>
        for{
          userNode <- getUserNode(userUUID).right
          itemNode <- createItem(userNode, item, extraLabel).right
        }yield itemNode
    }
  }
 
  protected def createItem(userNode: Node, item: AnyRef, extraLabel: Option[Label])(implicit neo4j: DatabaseService): Response[Node] = {
    val itemNode = createNode(item, MainLabel.ITEM)
    if (extraLabel.isDefined) itemNode.addLabel(extraLabel.get)
    // Attach it to the user
    userNode --> UserRelationship.OWNS --> itemNode
    Right(itemNode)
  }
  
  protected def updateItem(userUUID: UUID, itemUUID: UUID, item: AnyRef, additionalLabel: Option[Label] = None): Response[Node] = {
    withTx{
      implicit neo4j =>
        for{
          userNode <- getUserNode(userUUID).right
          itemNode <- getItemNode(userNode, itemUUID).right
          itemNode <- Right(setLabel(itemNode, additionalLabel)).right
          itemNode <- updateNode(itemNode, item).right
        }yield itemNode
    }
  }
  
  protected def setLabel(node: Node, additionalLabel: Option[Label])(implicit neo4j: DatabaseService): Node = {
    if (additionalLabel.isDefined && !node.hasLabel(additionalLabel.get))
      node.addLabel(additionalLabel.get)
    node
  }
    
  protected def getItemNode(userNode: Node, itemUUID: UUID, mandatoryLabel: Option[Label] = None)(implicit neo4j: DatabaseService): Response[Node] = {
    val nodeFromUser: TraversalDescription = 
        Traversal.description()
          .relationships(DynamicRelationshipType.withName(UserRelationship.OWNS.name), 
                         Direction.OUTGOING)
          .breadthFirst()
          .evaluator(Evaluators.excludeStartPosition())
          .evaluator(UUIDEvaluator(itemUUID))
   val itemFromUser = if (mandatoryLabel.isEmpty)
                        nodeFromUser.evaluator(LabelEvaluator(MainLabel.ITEM))
                      else
                        nodeFromUser.evaluator(LabelEvaluator(MainLabel.ITEM, mandatoryLabel.get))          
    val traverser = itemFromUser.traverse(userNode)
    val itemNodeList = traverser.nodes().toArray
    if (itemNodeList.length == 0) {
      fail(INVALID_PARAMETER, "Item " + itemUUID + " not found")
    } else if (itemNodeList.length > 1) {
      fail(INTERNAL_SERVER_ERROR, "More than one item found with UUID " + itemUUID)
    } else {
      Right(itemNodeList.head)
    }
  }

}