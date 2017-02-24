/**
 * Copyright (c) 2013-2017 Extended Mind Technologies Oy
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
import akka.event.LoggingAdapter
import scala.util.{Success, Failure}
import scala.concurrent.ExecutionContext
import akka.actor.ActorRefFactory
import akka.actor.ActorSystem
import java.util.UUID

trait OwnerActions {

  def db: GraphDatabase
  def settings: Settings

  def actorRefFactory: ActorRefFactory
  implicit val implicitActorRefFactory = actorRefFactory
  implicit val implicitExecutionContext = actorRefFactory.dispatcher

  def getOwners(implicit log: LoggingAdapter): Response[Owners] = {
    log.info("getOwners")
    db.getOwners
  }

  def blacklistOwner(ownerUUID: UUID)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("blacklist owner {}", ownerUUID)
    db.blacklistOwner(ownerUUID)
  }

  def unblacklistOwner(ownerUUID: UUID)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("unblacklist owner {}", ownerUUID)
    db.unblacklistOwner(ownerUUID)
  }

}

class OwnerActionsImpl(implicit val implSettings: Settings, implicit val inj: Injector,
                      implicit val implActorRefFactory: ActorRefFactory)
  extends OwnerActions with Injectable {
  override def settings  = implSettings
  override def db = inject[GraphDatabase]
  override def actorRefFactory = implActorRefFactory
}
