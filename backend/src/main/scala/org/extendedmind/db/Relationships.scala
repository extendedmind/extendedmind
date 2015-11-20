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

import org.neo4j.graphdb.RelationshipType

case class ExtendedMindRelationship(relationshipName: String) extends RelationshipType {
  override def name = relationshipName
}

object SecurityRelationship {
  val OWNS = ExtendedMindRelationship("OWNS")
  val IDS = ExtendedMindRelationship("IDS")
  val IS_FOUNDER = ExtendedMindRelationship("IS_FOUNDER")
  val IS_CREATOR = ExtendedMindRelationship("IS_CREATOR")
  val CAN_READ = ExtendedMindRelationship("CAN_READ")
  val CAN_READ_WRITE = ExtendedMindRelationship("CAN_READ_WRITE")
}

object ItemRelationship {
  val HAS_PARENT = ExtendedMindRelationship("HAS_PARENT")
  val HAS_TAG = ExtendedMindRelationship("HAS_TAG")
  val HAS_ORIGIN = ExtendedMindRelationship("HAS_ORIGIN")
  val HAS_REMINDER = ExtendedMindRelationship("HAS_REMINDER")
  val IS_ASSIGNED_TO = ExtendedMindRelationship("IS_ASSIGNED_TO")
  val HAS_REVISION = ExtendedMindRelationship("HAS_REVISION")
}

object AgreementRelationship {
  val PROPOSES = ExtendedMindRelationship("PROPOSES")
  val IS_PROPOSED_TO = ExtendedMindRelationship("IS_PROPOSED_TO")
  val CONCERNING = ExtendedMindRelationship("CONCERNING")
}