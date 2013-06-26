package org.extendedmind.db

import org.neo4j.graphdb.{Label => Neo4jLabel}

case class Label(labelName: String) extends Neo4jLabel{
  override def name = labelName
}

object MainLabel {
  val USER = Label("USER")
  val ITEM = Label("ITEM")
  val TAG = Label("TAG")
  val AGGREGATE = Label("AGGREGATE")
  val TOKEN = Label("TOKEN")

}

object UserLabels {
  val ADMIN = Label("ADMIN")
  val NORMAL = Label("NORMAL")
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
