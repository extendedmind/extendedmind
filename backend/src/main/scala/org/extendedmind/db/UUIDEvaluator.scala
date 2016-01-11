/**
 * Copyright (c) 2013-2016 Extended Mind Technologies Oy
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