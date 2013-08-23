package org.extendedmind.domain

import java.util.UUID

case class Item(uuid: Option[UUID], modified: Option[Long], 
                title: String, description: Option[String])
           extends Container(uuid, modified)
