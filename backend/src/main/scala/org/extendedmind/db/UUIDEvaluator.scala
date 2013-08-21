package org.extendedmind.db

import org.neo4j.graphdb.traversal.Evaluator
import org.neo4j.graphdb.Node
import org.neo4j.graphdb.Path
import org.neo4j.graphdb.traversal.Evaluation
import java.util.UUID
import org.extendedmind.security.UUIDUtils

case class UUIDEvaluator(uuid: UUID) extends Evaluator{

  override def evaluate(path: Path): Evaluation = {
    val currentNode: Node = path.endNode();
    if (UUIDUtils.getTrimmedBase64UUID(uuid) == currentNode.getProperty("uuid")){
      return Evaluation.INCLUDE_AND_PRUNE
    }else{
      return Evaluation.EXCLUDE_AND_CONTINUE
    }
  }
}