package org.extendedmind.domain

import java.util.UUID

case class User(uuid: Option[UUID], modified: Option[Long], deleted: Option[Long],  
                email: String)
           extends Container

