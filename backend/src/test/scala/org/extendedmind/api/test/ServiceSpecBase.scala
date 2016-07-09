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
    Post("/v2/users/authenticate") ~> addHeader(Authorization(BasicHttpCredentials(email, password))) ~> route ~> check {
      responseAs[SecurityContext]
    }
  }

  def emailPasswordAuthenticateRememberMe(email: String, password: String): SecurityContext = {
    Post("/v2/users/authenticate", marshal(AuthenticatePayload(true, None)).right.get) ~> addHeader(Authorization(BasicHttpCredentials(email, password))) ~> route ~> check {
      responseAs[SecurityContext]
    }
  }

  def putNewItem(newItem: Item, authenticateResponse: SecurityContext): SetResult = {
    Put("/v2/owners/" + authenticateResponse.userUUID + "/data/items",
      marshal(newItem).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        responseAs[SetResult]
      }
  }

  def putNewNote(newNote: Note, authenticateResponse: SecurityContext, foreignOwnerUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (foreignOwnerUUID.isDefined) foreignOwnerUUID.get else authenticateResponse.userUUID
    Put("/v2/owners/" + ownerUUID + "/data/notes",
      marshal(newNote).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        responseAs[SetResult]
      }
  }

  def putExistingNote(existingNote: Note, noteUUID: UUID, authenticateResponse: SecurityContext, foreignOwnerUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (foreignOwnerUUID.isDefined) foreignOwnerUUID.get else authenticateResponse.userUUID
    Put("/v2/owners/" + ownerUUID + "/data/notes/" + noteUUID.toString(),
      marshal(existingNote).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        responseAs[SetResult]
      }
  }

  def publishNoteCC(noteUUID: UUID, path: String, authenticateResponse: SecurityContext, foreignOwnerUUID: Option[UUID] = None): PublishNoteResult = {
    val ownerUUID = if (foreignOwnerUUID.isDefined) foreignOwnerUUID.get else authenticateResponse.userUUID
    Post("/v2/owners/" + ownerUUID + "/data/notes/" + noteUUID + "/publish",
      marshal(PublishPayload("md", path, Some(LicenceType.CC_BY_SA_4_0.toString), None, None))) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        responseAs[PublishNoteResult]
      }
  }


  def deleteNote(noteUUID: UUID, authenticateResponse: SecurityContext, foreignUUID: Option[UUID] = None): DeleteItemResult = {
    val ownerUUID = if (foreignUUID.isDefined) foreignUUID.get else authenticateResponse.userUUID
    Delete("/v2/owners/" + ownerUUID + "/data/notes/" + noteUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[DeleteItemResult]
    }
  }

  def undeleteNote(noteUUID: UUID, authenticateResponse: SecurityContext, foreignUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (foreignUUID.isDefined) foreignUUID.get else authenticateResponse.userUUID
    Post("/v2/owners/" + ownerUUID + "/data/notes/" + noteUUID + "/undelete") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[SetResult]
    }
  }

  def putNewTask(newTask: Task, authenticateResponse: SecurityContext, foreignOwnerUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (foreignOwnerUUID.isDefined) foreignOwnerUUID.get else authenticateResponse.userUUID
    Put("/v2/owners/" + ownerUUID + "/data/tasks",
      marshal(newTask).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        responseAs[SetResult]
      }
  }

  def putExistingTask(existingTask: Task, taskUUID: UUID, authenticateResponse: SecurityContext,
    foreignOwnerUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (foreignOwnerUUID.isDefined) foreignOwnerUUID.get else authenticateResponse.userUUID
    Put("/v2/owners/" + ownerUUID + "/data/tasks/" + taskUUID.toString(),
      marshal(existingTask).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        responseAs[SetResult]
      }
  }

  def deleteTask(taskUUID: UUID, authenticateResponse: SecurityContext, foreignUUID: Option[UUID] = None): DeleteItemResult = {
    val ownerUUID = if (foreignUUID.isDefined) foreignUUID.get else authenticateResponse.userUUID
    Delete("/v2/owners/" + ownerUUID + "/data/tasks/" + taskUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[DeleteItemResult]
    }
  }

  def undeleteTask(taskUUID: UUID, authenticateResponse: SecurityContext, foreignUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (foreignUUID.isDefined) foreignUUID.get else authenticateResponse.userUUID
    Post("/v2/owners/" + ownerUUID + "/data/tasks/" + taskUUID + "/undelete") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[SetResult]
    }
  }

  def putNewList(newList: List, authenticateResponse: SecurityContext, collectiveUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (collectiveUUID.isDefined) collectiveUUID.get else authenticateResponse.userUUID
    Put("/v2/owners/" + ownerUUID + "/data/lists",
      marshal(newList).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        responseAs[SetResult]
      }
  }

  def getList(listUUID: UUID, authenticateResponse: SecurityContext): List = {
    Get("/v2/owners/" + authenticateResponse.userUUID + "/data/lists/" + listUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[List]
    }
  }

  def putExistingList(existingList: List, listUUID: UUID, authenticateResponse: SecurityContext,
    collectiveUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (collectiveUUID.isDefined) collectiveUUID.get else authenticateResponse.userUUID
    Put("/v2/owners/" + ownerUUID + "/data/lists/" + listUUID.toString(),
      marshal(existingList).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        responseAs[SetResult]
      }
  }

  def putNewTag(newTag: Tag, authenticateResponse: SecurityContext, collectiveUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (collectiveUUID.isDefined) collectiveUUID.get else authenticateResponse.userUUID
    Put("/v2/owners/" + ownerUUID + "/data/tags",
      marshal(newTag).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        responseAs[SetResult]
      }
  }

  def getItem(itemUUID: UUID, authenticateResponse: SecurityContext): Item = {
    Get("/v2/owners/" + authenticateResponse.userUUID + "/data/items/" + itemUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[Item]
    }
  }

  def getTask(taskUUID: UUID, authenticateResponse: SecurityContext, collectiveUUID: Option[UUID] = None): Task = {
    val ownerUUID = if (collectiveUUID.isDefined) collectiveUUID.get else authenticateResponse.userUUID
    Get("/v2/owners/" + ownerUUID + "/data/tasks/" + taskUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[Task]
    }
  }

  def getNote(noteUUID: UUID, authenticateResponse: SecurityContext): Note = {
    Get("/v2/owners/" + authenticateResponse.userUUID + "/data/notes/" + noteUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[Note]
    }
  }

  def getTag(tagUUID: UUID, authenticateResponse: SecurityContext): Tag = {
    Get("/v2/owners/" + authenticateResponse.userUUID + "/data/tags/" + tagUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[Tag]
    }
  }

  def getUserUUID(email: String, authenticateResponse: SecurityContext): UUID = {
    Get("/v2/users?email=" + email) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      responseAs[PublicUser].uuid
    }
  }

  def getItemRevisionList(itemUUID: UUID, authenticateResponse: SecurityContext, jsonOutputName: Option[String] = None): ItemRevisions = {
    Get("/v2/owners/" + authenticateResponse.userUUID + "/data/" + itemUUID + "/revisions") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      if (jsonOutputName.isDefined) writeJsonOutput(jsonOutputName.get, responseAs[String])
      responseAs[ItemRevisions]
    }
  }

  def getItemRevision(itemUUID: UUID, revisionNumber: Long, authenticateResponse: SecurityContext, jsonOutputName: Option[String] = None): ExtendedItemChoice = {
    Get("/v2/owners/" + authenticateResponse.userUUID + "/data/" + itemUUID + "/revision/" + revisionNumber) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      if (jsonOutputName.isDefined) writeJsonOutput(jsonOutputName.get, responseAs[String])
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
