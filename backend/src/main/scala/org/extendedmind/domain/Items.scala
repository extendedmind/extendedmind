package org.extendedmind.domain

import java.util.UUID

case class Items(items: Option[List[Item]], tasks: Option[List[Task]], notes: Option[List[Note]])