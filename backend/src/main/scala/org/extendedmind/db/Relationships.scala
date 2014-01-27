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
  val IS_ORIGIN = ExtendedMindRelationship("IS_ORIGIN")
  val IS_ACCEPTER = ExtendedMindRelationship("IS_ACCEPTER")
}

object ItemRelationship {
  val HAS_PARENT = ExtendedMindRelationship("HAS_PARENT")
  val HAS_TAG = ExtendedMindRelationship("HAS_TAG")
  val HAS_ORIGIN = ExtendedMindRelationship("HAS_ORIGIN")
}