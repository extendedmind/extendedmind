package org.extendedmind.db

import org.neo4j.graphdb.RelationshipType

case class ExtendedMindRelationship(relationshipName: String) extends RelationshipType {
  override def name = relationshipName
}

object SecurityRelationship {
  val OWNS = ExtendedMindRelationship("OWNS")
  val IDS = ExtendedMindRelationship("IDS")
}

object ItemRelationship {
  val HAS_PARENT = ExtendedMindRelationship("HAS_PARENT")
  val HAS_TAG = ExtendedMindRelationship("HAS_TAG")
}