package org.extendedmind.domain

import java.util.UUID

case class Item(uuid: Option[UUID], modified: Option[Long], 
                title: String, itemType: Option[String], date: Option[String], 
                childItems: Option[List[String]])
           extends Container(uuid, modified)
