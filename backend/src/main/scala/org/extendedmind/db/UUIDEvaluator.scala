package org.extendedmind.db

import org.neo4j.graphdb.traversal.Evaluator
import org.neo4j.graphdb.Node
import org.neo4j.graphdb.Path
import org.neo4j.graphdb.traversal.Evaluation
import java.util.UUID
import org.extendedmind.security.UUIDUtils

case class UUIDEvaluator(uuid: UUID, foundEvaluation: Evaluation = Evaluation.INCLUDE_AND_PRUNE, 
                         notFoundEvaluation: Evaluation = Evaluation.EXCLUDE_AND_CONTINUE,
                         length: Option[Int] = None,
                         notLenghtEvaluation: Evaluation = Evaluation.INCLUDE_AND_CONTINUE) extends Evaluator{

  override def evaluate(path: Path): Evaluation = {
    if (length.isEmpty || path.length() == length.get){
      val currentNode: Node = path.endNode();
      if (currentNode.hasProperty("uuid") && UUIDUtils.getTrimmedBase64UUID(uuid) == currentNode.getProperty("uuid")){
        return foundEvaluation
      }else{
        return notFoundEvaluation
      }
    }else{
      notLenghtEvaluation
    }
  }
}