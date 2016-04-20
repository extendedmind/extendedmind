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

import java.util.UUID
import scala.collection.JavaConversions.iterableAsScalaIterable
import org.apache.commons.codec.binary.Base64
import org.extendedmind._
import org.extendedmind.Response._
import org.extendedmind.domain._
import org.extendedmind.security._
import org.neo4j.graphdb.Direction
import org.neo4j.graphdb.DynamicRelationshipType
import org.neo4j.graphdb.Node
import org.neo4j.graphdb.traversal.Evaluators
import org.neo4j.graphdb.traversal.TraversalDescription
import org.neo4j.scala.DatabaseService
import scala.collection.mutable.ListBuffer
import org.neo4j.graphdb.Relationship
import spray.util.LoggingContext
import scala.collection.mutable.HashMap
import org.neo4j.graphdb.traversal.Evaluation

trait OwnerDatabase extends AbstractGraphDatabase {

  def getOwners: Response[Owners] = {
    withTx {
      implicit neo4j =>
        val users = findNodesByLabel(OwnerLabel.USER).toList
        val usersList =
          users map (userNode => {
            val response = toCaseClass[User](userNode)
            if (response.isLeft) return Left(response.left.get)
            else response.right.get
          });
        val collectives = findNodesByLabel(OwnerLabel.COLLECTIVE).toList
        val collectivesList: Option[scala.List[Collective]] = if (collectives.isEmpty) {
          None
        } else {
          Some(collectives map (collectiveNode => {
            val response = toCaseClass[Collective](collectiveNode)
            if (response.isLeft) return Left(response.left.get)
            response.right.get
          }))
        }
        Right(Owners(usersList, collectivesList))
    }
  }
}