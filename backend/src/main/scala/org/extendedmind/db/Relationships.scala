package org.extendedmind.db

import org.neo4j.graphdb.RelationshipType


case class Relationship(relationshipName: String) extends RelationshipType{
  override def name = relationshipName
}

object UserRelationship {
  val OWNS = Relationship("OWNS")
  val FOR_USER = Relationship("FOR_USER")
}
