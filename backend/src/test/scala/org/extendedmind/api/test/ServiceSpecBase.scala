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

package org.extendedmind.api.test

import java.io.PrintWriter
import java.util.UUID
import org.extendedmind._
import org.extendedmind.bl._
import org.extendedmind.db._
import org.extendedmind.domain._
import org.extendedmind.security._
import org.extendedmind.email._
import org.extendedmind.test._
import org.extendedmind.test.TestGraphDatabase._
import org.mockito.Mockito._
import org.mockito.Matchers._
import org.mockito.Matchers.{ eq => mockEq }
import scaldi.Module
import spray.http.BasicHttpCredentials
import spray.http.HttpHeaders.Authorization
import org.zeroturnaround.zip.ZipUtil
import java.io.File
import org.zeroturnaround.zip.FileUtil
import org.apache.commons.io.FileUtils
import org.extendedmind.api.JsonImplicits._
import spray.httpx.SprayJsonSupport._
import spray.httpx.marshalling._
import spray.json.DefaultJsonProtocol._
import scala.concurrent.Future
import scala.concurrent.duration.Duration
import java.util.concurrent.TimeUnit

abstract class ServiceSpecBase extends ImpermanentGraphDatabaseSpecBase {

  implicit val timeout = RouteTestTimeout(Duration(10, TimeUnit.SECONDS))

  def emailPasswordAuthenticate(email: String, password: String): SecurityContext = {
    Post("/authenticate") ~> addHeader(Authorization(BasicHttpCredentials(email, password))) ~> route ~> check {
      responseAs[SecurityContext]
    }
  }

  def emailPasswordAuthenticateRememberMe(email: String, password: String): SecurityContext = {
    Post("/authenticate", marshal(AuthenticatePayload(true, None)).right.get) ~> addHeader(Authorization(BasicHttpCredentials(email, password))) ~> route ~> check {
      responseAs[SecurityContext]
    }
  }

  def putNewItem(newItem: Item, authenticateResponse: SecurityContext): SetResult = {
    Put("/" + authenticateResponse.userUUID + "/item",
      marshal(newItem).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        responseAs[SetResult]
      }
  }

  def putNewNote(newNote: Note, authenticateResponse: SecurityContext, foreignOwnerUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (foreignOwnerUUID.isDefined) foreignOwnerUUID.get else authenticateResponse.userUUID
    Put("/" + ownerUUID + "/note",
      marshal(newNote).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        responseAs[SetResult]
      }
  }

  def putExistingNote(existingNote: Note, noteUUID: UUID, authenticateResponse: SecurityContext, foreignOwnerUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (foreignOwnerUUID.isDefined) foreignOwnerUUID.get else authenticateResponse.userUUID
    Put("/" + ownerUUID + "/note/" + noteUUID.toString(),
      marshal(existingNote).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        responseAs[SetResult]
      }
  }

  def deleteNote(noteUUID: UUID, authenticateResponse: SecurityContext, foreignUUID: Option[UUID] = None): DeleteItemResult = {
    val ownerUUID = if (foreignUUID.isDefined) foreignUUID.get else authenticateResponse.userUUID
    Delete("/" + ownerUUID + "/note/" + noteUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[DeleteItemResult]
    }
  }

  def undeleteNote(noteUUID: UUID, authenticateResponse: SecurityContext, foreignUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (foreignUUID.isDefined) foreignUUID.get else authenticateResponse.userUUID
    Post("/" + ownerUUID + "/note/" + noteUUID + "/undelete") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[SetResult]
    }
  }

  def putNewTask(newTask: Task, authenticateResponse: SecurityContext, foreignOwnerUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (foreignOwnerUUID.isDefined) foreignOwnerUUID.get else authenticateResponse.userUUID
    Put("/" + ownerUUID + "/task",
      marshal(newTask).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        responseAs[SetResult]
      }
  }

  def putExistingTask(existingTask: Task, taskUUID: UUID, authenticateResponse: SecurityContext,
    foreignOwnerUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (foreignOwnerUUID.isDefined) foreignOwnerUUID.get else authenticateResponse.userUUID
    Put("/" + ownerUUID + "/task/" + taskUUID.toString(),
      marshal(existingTask).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        responseAs[SetResult]
      }
  }

  def deleteTask(taskUUID: UUID, authenticateResponse: SecurityContext, foreignUUID: Option[UUID] = None): DeleteItemResult = {
    val ownerUUID = if (foreignUUID.isDefined) foreignUUID.get else authenticateResponse.userUUID
    Delete("/" + ownerUUID + "/task/" + taskUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[DeleteItemResult]
    }
  }

  def undeleteTask(taskUUID: UUID, authenticateResponse: SecurityContext, foreignUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (foreignUUID.isDefined) foreignUUID.get else authenticateResponse.userUUID
    Post("/" + ownerUUID + "/task/" + taskUUID + "/undelete") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[SetResult]
    }
  }

  def putNewList(newList: List, authenticateResponse: SecurityContext, collectiveUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (collectiveUUID.isDefined) collectiveUUID.get else authenticateResponse.userUUID
    Put("/" + ownerUUID + "/list",
      marshal(newList).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        responseAs[SetResult]
      }
  }

  def getList(listUUID: UUID, authenticateResponse: SecurityContext): List = {
    Get("/" + authenticateResponse.userUUID + "/list/" + listUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[List]
    }
  }


  def putExistingList(existingList: List, listUUID: UUID, authenticateResponse: SecurityContext,
    collectiveUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (collectiveUUID.isDefined) collectiveUUID.get else authenticateResponse.userUUID
    Put("/" + ownerUUID + "/list/" + listUUID.toString(),
      marshal(existingList).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        responseAs[SetResult]
      }
  }

  def putNewTag(newTag: Tag, authenticateResponse: SecurityContext, collectiveUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (collectiveUUID.isDefined) collectiveUUID.get else authenticateResponse.userUUID
    Put("/" + ownerUUID + "/tag",
      marshal(newTag).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        responseAs[SetResult]
      }
  }

  def getItem(itemUUID: UUID, authenticateResponse: SecurityContext): Item = {
    Get("/" + authenticateResponse.userUUID + "/item/" + itemUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[Item]
    }
  }

  def getTask(taskUUID: UUID, authenticateResponse: SecurityContext, collectiveUUID: Option[UUID] = None): Task = {
    val ownerUUID = if (collectiveUUID.isDefined) collectiveUUID.get else authenticateResponse.userUUID
    Get("/" + ownerUUID + "/task/" + taskUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[Task]
    }
  }

  def getNote(noteUUID: UUID, authenticateResponse: SecurityContext): Note = {
    Get("/" + authenticateResponse.userUUID + "/note/" + noteUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[Note]
    }
  }

  def getTag(tagUUID: UUID, authenticateResponse: SecurityContext): Tag = {
    Get("/" + authenticateResponse.userUUID + "/tag/" + tagUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[Tag]
    }
  }

  def getUserUUID(email: String, authenticateResponse: SecurityContext): UUID = {
    Get("/user?email=" + email) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[PublicUser].uuid
    }
  }

  def getItemRevisionList(itemUUID: UUID, authenticateResponse: SecurityContext): ItemRevisions = {
    Get("/" + authenticateResponse.userUUID + "/item/" + itemUUID + "/revisions") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[ItemRevisions]
    }
  }

  def getItemRevision(itemUUID: UUID, revisionNumber: Long, authenticateResponse: SecurityContext): ExtendedItemChoice = {
    Get("/" + authenticateResponse.userUUID + "/item/" + itemUUID + "/revision/" + revisionNumber) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[ExtendedItemChoice]
    }
  }

  def isEmptyItems(items: Items): Boolean = {
    return items.items.isEmpty && items.tasks.isEmpty && items.notes.isEmpty && items.lists.isEmpty && items.tags.isEmpty
  }

  // Helper file writer
  def writeJsonOutput(filename: String, contents: String): Unit = {
    Some(new PrintWriter(db.TEST_DATA_DESTINATION + "/" + filename + ".json")).foreach { p => p.write(contents); p.close }
  }
}
