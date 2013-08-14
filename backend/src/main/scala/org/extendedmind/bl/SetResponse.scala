package org.extendedmind.bl

import java.util.UUID

/**
 * Response that is returned from every PUT/POST method
 */
case class SetResponse(uuid: Option[UUID], modified: Long)