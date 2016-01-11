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

package org.extendedmind.test

import org.neo4j.test.TestGraphDatabaseFactory

object ImpermanentGraphDatabaseSpecBase {
  // Test database
  var localdb: TestImpermanentGraphDatabase = null
  def db(implicit settings: org.extendedmind.Settings): TestImpermanentGraphDatabase = {
    if (localdb == null){
      localdb = new TestImpermanentGraphDatabase
    }
    localdb
  }
}

trait ImpermanentGraphDatabaseSpecBase extends SpraySpecBase with Neo4jHelper{
  // Test database, singleton
  val db: TestImpermanentGraphDatabase = ImpermanentGraphDatabaseSpecBase.db
}