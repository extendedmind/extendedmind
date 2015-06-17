/**
 * Copyright (c) 2013-2015 Extended Mind Technologies Oy
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

package org.extendedmind.test

import org.neo4j.graphdb._
import org.neo4j.graphdb.index.IndexManager
import scala.collection.JavaConversions._
import org.neo4j.graphdb.index.Index
import java.lang.reflect.Field


/**
 * Copyright 2011 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
trait Neo4jHelper {

  def cleanDb(graphDatabaseService: GraphDatabaseService) = {

    val tx = graphDatabaseService.beginTx()
    try {
      clearIndex(graphDatabaseService)
      removeNodes(graphDatabaseService)
      tx.success()
    } finally {
      tx.finish()
    }
  }

  private def removeNodes(graphDatabaseService: GraphDatabaseService): Unit = {

    graphDatabaseService.getAllNodes() foreach (node =>
      node.getRelationships(Direction.OUTGOING) foreach (rel =>
        rel.delete()  
      ))
        
    graphDatabaseService.getAllNodes() foreach (node =>
      node.delete()
    )
  }

  private def clearIndex(gds: GraphDatabaseService) = {
    val indexManager: IndexManager = gds.index()
    indexManager.nodeIndexNames() foreach (ix => {
      val index = indexManager.forNodes(ix) 
      getMutableIndex(index).delete()
    })

    indexManager.relationshipIndexNames() foreach (ix => {
      val index = indexManager.forRelationships(ix)
      getMutableIndex(index).delete()
    })
  }
  
  private def getMutableIndex(index: Index[_]): Index[_] = {
     val indexClass = index.getClass();
        if (indexClass.getName().endsWith("ReadOnlyIndexToIndexAdapter")) {
            try {
                val delegateIndexField: Field = indexClass.getDeclaredField("delegate");
                delegateIndexField.setAccessible(true);
                return delegateIndexField.get(index).asInstanceOf[Index[_]];
            } catch{ 
                case e: Exception => throw new UnsupportedOperationException(e);
            }
        } else {
            return index;
        }
    }
  
  
}