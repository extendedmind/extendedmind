package org.extendedmind.db

import org.neo4j.graphdb.traversal.Evaluator
import org.neo4j.graphdb.Node
import org.neo4j.graphdb.Path
import org.neo4j.graphdb.traversal.Evaluation
import java.util.UUID
import org.extendedmind.security.UUIDUtils

case class ExcludeHasPropertyEvaluator(label: Label, property: String) extends Evaluator{

  override def evaluate(path: Path): Evaluation = {
    val currentNode: Node = path.endNode();
    if (currentNode.hasLabel(label) && currentNode.hasProperty(property)){
      return Evaluation.EXCLUDE_AND_PRUNE
    }
    return Evaluation.INCLUDE_AND_CONTINUE
  }
}