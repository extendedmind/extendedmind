package org.extendedmind.db

import org.neo4j.graphdb.Label

object MainLabel extends Enumeration with Label{
  val USER, ITEM, TAG, AGGREGATE = Value
}

object UserLabels extends Enumeration with Label{
	val ADMIN, NORMAL = Value
}

object ItemLabel extends Enumeration with Label{
	val NOTE, TASK = Value
}

object ItemParentLabel extends Enumeration with Label{
	val AREA, PROJECT = Value
}

object SecurityLabel extends Enumeration with Label{
	val PRIVATE, EXCLUSIVE, PUBLIC = Value
}
