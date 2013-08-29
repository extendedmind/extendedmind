package org.extendedmind.db

import org.neo4j.graphdb.Node
import org.neo4j.graphdb.Path
import org.neo4j.graphdb.traversal.Evaluation
import org.neo4j.graphdb.traversal.Evaluator

case class LabelEvaluator(labels: List[Label], 
    foundEvaluation: Evaluation = Evaluation.INCLUDE_AND_PRUNE, 
    notFoundEvaluation: Evaluation = Evaluation.EXCLUDE_AND_CONTINUE,
    length: Option[Int] = None,
    notLenghtEvaluation: Evaluation = Evaluation.INCLUDE_AND_CONTINUE) extends Evaluator{

  override def evaluate(path: Path): Evaluation = {
    if (length.isEmpty || path.length() == length.get){
      val currentNode: Node = path.endNode();
      labels foreach(label => if (!currentNode.hasLabel(label)) return notFoundEvaluation) 
      foundEvaluation
    }else{
      notLenghtEvaluation
    }
  }
}