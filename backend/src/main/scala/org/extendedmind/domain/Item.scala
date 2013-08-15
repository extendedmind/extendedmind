package org.extendedmind.domain

import java.util.UUID

case class Item(uuid: Option[UUID], title: String, itemType: Option[String], date: Option[String], childItems: Option[List[String]])
