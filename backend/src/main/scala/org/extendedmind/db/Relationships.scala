package org.extendedmind.db

import org.neo4j.graphdb.RelationshipType

case class ExtendedMindRelationship(relationshipName: String) extends RelationshipType {
  override def name = relationshipName
}

object SecurityRelationship {
  val OWNS = ExtendedMindRelationship("OWNS")
  val IDS = ExtendedMindRelationship("IDS")
  val IS_CREATOR = ExtendedMindRelationship("IS_CREATOR")
  val CAN_READ = ExtendedMindRelationship("CAN_READ")
  val CAN_WRITE = ExtendedMindRelationship("CAN_WRITE")
}

object ItemRelationship {
  val HAS_PARENT = ExtendedMindRelationship("HAS_PARENT")
  val HAS_TAG = ExtendedMindRelationship("HAS_TAG")
}