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
import org.extendedmind._
import org.extendedmind.email._
import org.extendedmind.security._
import org.extendedmind.Response._
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.db.EmbeddedGraphDatabase
import scala.util.{Success, Failure}
import scala.concurrent.ExecutionContext
import akka.actor.ActorRefFactory
import akka.actor.ActorSystem
import java.util.UUID
import akka.event.LoggingAdapter


trait CollectiveActions {

  def db: GraphDatabase
  def settings: Settings

  def putNewCollective(creatorUUID: UUID, collective: Collective)(implicit log: LoggingAdapter): Response[SetResult] = {
    if (!db.hasCommonCollective){
      log.info("Making collective {} a common collective to all "
                 +"users because it is the first inserted collective", collective.title)
      db.putNewCollective(creatorUUID, collective, true)
    }else{
      db.putNewCollective(creatorUUID, collective, false)
    }
  }

  def putExistingCollective(collectiveUUID: UUID, collective: Collective)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("putExistingCollective: collective {}", collectiveUUID)
    db.putExistingCollective(collectiveUUID, collective)
  }

  def getCollective(collectiveUUID: UUID)(implicit log: LoggingAdapter): Response[Collective] = {
    log.info("getCollective: collective {}", collectiveUUID)
    db.getCollective(collectiveUUID)
  }

  def setCollectiveUserPermission(collectiveUUID: UUID, founderUUID: UUID, userUUID: UUID, access: Option[Byte])
          (implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("setCollectiveUserPermission: collective {}, founder {}, user {}, access {}", collectiveUUID, founderUUID, userUUID, access)
    db.setCollectiveUserPermission(collectiveUUID, founderUUID, userUUID, access)
  }
}

class CollectiveActionsImpl(implicit val implSettings: Settings, implicit val inj: Injector)
  extends CollectiveActions with Injectable {
  override def settings  = implSettings
  override def db = inject[GraphDatabase]
}
