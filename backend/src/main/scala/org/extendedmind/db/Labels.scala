package org.extendedmind.db

import org.neo4j.graphdb.{Label => Neo4jLabel}

case class Label(labelName: String) extends Neo4jLabel{
  override def name = labelName
}

object MainLabel {
  val OWNER = Label("OWNER")
  val ITEM = Label("ITEM")
  val TOKEN = Label("TOKEN")
  val REQUEST = Label("REQUEST")
  val INVITE = Label("INVITE")
}

object OwnerLabel {
  val USER = Label("USER")
  val COLLECTIVE = Label("COLLECTIVE")
}

object UserLabel {
  val ADMIN = Label("ADMIN")
  val ALFA = Label("ALFA")
  val BETA = Label("BETA")
}

object ItemLabel {
  val NOTE = Label("NOTE")
  val TASK = Label("TASK")
  val TAG = Label("TAG")
}

object TagLabel {
  val KEYWORD = Label("KEYWORD")
  val CONTEXT = Label("CONTEXT")
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
