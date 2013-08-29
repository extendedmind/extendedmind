package org.extendedmind.db

import org.neo4j.graphdb.traversal.Evaluator
import org.neo4j.graphdb.Node
import org.neo4j.graphdb.Path
import org.neo4j.graphdb.traversal.Evaluation
import java.util.UUID
import org.extendedmind.security.UUIDUtils

case class PropertyEvaluator(label: Label, property: String, 
                             foundEvaluation: Evaluation = Evaluation.INCLUDE_AND_PRUNE,
                             notFoundEvaluation: Evaluation = Evaluation.EXCLUDE_AND_CONTINUE) extends Evaluator{

  override def evaluate(path: Path): Evaluation = {
    val currentNode: Node = path.endNode();
    if (currentNode.hasLabel(label) && currentNode.hasProperty(property)){
      return foundEvaluation
    }
    return notFoundEvaluation
  }
}