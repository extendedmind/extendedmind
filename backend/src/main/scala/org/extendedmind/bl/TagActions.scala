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

package org.extendedmind.bl

import org.extendedmind.domain._
import org.extendedmind.db._
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.domain.Item
import java.util.UUID
import org.extendedmind._
import org.extendedmind.Response._
import akka.event.LoggingAdapter

trait TagActions {

  def db: GraphDatabase;

  def putNewTag(owner: Owner, tag: Tag)(implicit log: LoggingAdapter): Response[SetResult] = {
    db.putNewTag(owner, tag)
  }

  def putExistingTag(owner: Owner, tagUUID: UUID, tag: Tag)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("putExistingTag")
    db.putExistingTag(owner, tagUUID, tag)
  }

  def getTag(owner: Owner, tagUUID: UUID)(implicit log: LoggingAdapter): Response[Tag] = {
    log.info("getTag")
    db.getTag(owner, tagUUID)
  }

  def deleteTag(owner: Owner, tagUUID: UUID)(implicit log: LoggingAdapter): Response[DeleteItemResult] = {
    log.info("deleteTag")
    db.deleteTag(owner, tagUUID)
  }

  def undeleteTag(owner: Owner, tagUUID: UUID)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("undeleteTag")
    db.undeleteTag(owner: Owner, tagUUID)
  }
}

class TagActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends TagActions with Injectable {
  def db = inject[GraphDatabase]
}
