package org.extendedmind.db

import org.neo4j.graphdb.RelationshipType


case class Relationship(relationshipName: String) extends RelationshipType{
  override def name = relationshipName
}

object UserRelationship {
  val OWNS = Relationship("OWNS")
  val HAS_TOKEN = Relationship("HAS_TOKEN")
}
