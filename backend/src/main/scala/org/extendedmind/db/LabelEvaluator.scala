package org.extendedmind.db

import org.neo4j.graphdb.Node
import org.neo4j.graphdb.Path
import org.neo4j.graphdb.traversal.Evaluation
import org.neo4j.graphdb.traversal.Evaluator

case class LabelEvaluator(labels: Label*) extends Evaluator{

  override def evaluate(path: Path): Evaluation = {
    val currentNode: Node = path.endNode();
    labels foreach(label => if (!currentNode.hasLabel(label)) return Evaluation.EXCLUDE_AND_CONTINUE) 
    return Evaluation.INCLUDE_AND_CONTINUE
  }
}