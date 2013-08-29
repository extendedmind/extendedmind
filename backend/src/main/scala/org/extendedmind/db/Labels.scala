package org.extendedmind.db

import org.neo4j.graphdb.{Label => Neo4jLabel}

case class Label(labelName: String) extends Neo4jLabel{
  override def name = labelName
}

object MainLabel {
  val OWNER = Label("OWNER")
  val ITEM = Label("ITEM")
  val TAG = Label("TAG")
  val TOKEN = Label("TOKEN")
}

object OwnerLabel {
  val USER = Label("USER")
  val COLLECTIVE = Label("COLLECTIVE")
}

object UserLabel {
  val ADMIN = Label("ADMIN")
}

object ItemLabel {
  val NOTE = Label("NOTE")
  val TASK = Label("TASK")
}

object ItemParentLabel {
  val AREA = Label("AREA")
  val PROJECT = Label("PROJECT")
}

object SecurityLabel {
  val PRIVATE = Label("PRIVATE")
  val EXCLUSIVE = Label("EXCLUSIVE") 
  val PUBLIC = Label("PUBLIC")
}
