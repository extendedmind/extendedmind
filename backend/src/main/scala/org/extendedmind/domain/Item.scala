package org.extendedmind.domain

import java.util.UUID

case class Item(uuid: Option[String], title: String, itemType: Option[String], date: Option[String], childItems: Option[List[String]])

object ItemWrapper{
  def apply (uuid: UUID, title: String, itemType: Option[String], date: Option[String], childItems: Option[List[String]]) =
    new Item(Some(uuid.toString()), title, itemType, date, childItems)
}