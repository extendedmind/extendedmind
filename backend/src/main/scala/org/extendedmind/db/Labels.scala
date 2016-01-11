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

import org.neo4j.graphdb.{Label => Neo4jLabel}

case class Label(labelName: String) extends Neo4jLabel{
  override def name = labelName
}

object MainLabel {
  val INFO = Label("INFO")
  val OWNER = Label("OWNER")
  val ITEM = Label("ITEM")
  val TOKEN = Label("TOKEN")
  val REMINDER = Label("REMINDER")
  val AGREEMENT = Label("AGREEMENT")
  val REVISION = Label("REVISION")
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
  val NORMAL = Label("NORMAL")
}

object SubscriptionLabel {
  val PREMIUM = Label("PREMIUM")
}

object ItemLabel {
  val NOTE = Label("NOTE")
  val TASK = Label("TASK")
  val LIST = Label("LIST")
  val TAG = Label("TAG")
}

object TagLabel {
  val KEYWORD = Label("KEYWORD")
  val CONTEXT = Label("CONTEXT")
  val HISTORY = Label("HISTORY")
}

object SecurityLabel {
  val PRIVATE = Label("PRIVATE")
  val EXCLUSIVE = Label("EXCLUSIVE")
  val PUBLIC = Label("PUBLIC")
}

object AgreementLabel {
  val LIST_AGREEMENT = Label("LIST_AGREEMENT")
}
