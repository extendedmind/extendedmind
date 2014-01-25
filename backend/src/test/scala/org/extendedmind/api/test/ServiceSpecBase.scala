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

abstract class ServiceSpecBase extends ImpermanentGraphDatabaseSpecBase {

  def emailPasswordAuthenticate(email: String, password: String): SecurityContext = {
    Post("/authenticate") ~> addHeader(Authorization(BasicHttpCredentials(email, password))) ~> route ~> check {
      entityAs[SecurityContext]
    }
  }

  def emailPasswordAuthenticateRememberMe(email: String, password: String): SecurityContext = {
    Post("/authenticate", marshal(AuthenticatePayload(true)).right.get) ~> addHeader(Authorization(BasicHttpCredentials(email, password))) ~> route ~> check {
      entityAs[SecurityContext]
    }
  }

  def putNewNote(newNote: Note, authenticateResponse: SecurityContext): SetResult = {
    Put("/" + authenticateResponse.userUUID + "/note",
      marshal(newNote).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        entityAs[SetResult]
      }
  }

  def putExistingNote(existingNote: Note, noteUUID: UUID, authenticateResponse: SecurityContext): SetResult = {
    Put("/" + authenticateResponse.userUUID + "/note/" + noteUUID.toString(),
      marshal(existingNote).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        entityAs[SetResult]
      }
  }

  def putNewTask(newTask: Task, authenticateResponse: SecurityContext, collectiveUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (collectiveUUID.isDefined) collectiveUUID.get else authenticateResponse.userUUID
    Put("/" + ownerUUID + "/task",
      marshal(newTask).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        entityAs[SetResult]
      }
  }

  def putExistingTask(existingTask: Task, taskUUID: UUID, authenticateResponse: SecurityContext,
    collectiveUUID: Option[UUID] = None): SetResult = {
    val ownerUUID = if (collectiveUUID.isDefined) collectiveUUID.get else authenticateResponse.userUUID
    Put("/" + ownerUUID + "/task/" + taskUUID.toString(),
      marshal(existingTask).right.get) ~> addHeader("Content-Type", "application/json") ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
        entityAs[SetResult]
      }
  }

  def getItem(itemUUID: UUID, authenticateResponse: SecurityContext): Item = {
    Get("/" + authenticateResponse.userUUID + "/item/" + itemUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      entityAs[Item]
    }
  }

  def getTask(taskUUID: UUID, authenticateResponse: SecurityContext, collectiveUUID: Option[UUID] = None): Task = {
    val ownerUUID = if (collectiveUUID.isDefined) collectiveUUID.get else authenticateResponse.userUUID
    Get("/" + ownerUUID + "/task/" + taskUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      entityAs[Task]
    }
  }

  def getNote(noteUUID: UUID, authenticateResponse: SecurityContext): Note = {
    Get("/" + authenticateResponse.userUUID + "/note/" + noteUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      entityAs[Note]
    }
  }
  
  def getList(listUUID: UUID, authenticateResponse: SecurityContext): List = {
    Get("/" + authenticateResponse.userUUID + "/list/" + listUUID) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      entityAs[List]
    }
  }

  def getUserUUID(email: String, authenticateResponse: SecurityContext): UUID = {
    Get("/user?email=" + email) ~> addCredentials(BasicHttpCredentials("token", authenticateResponse.token.get)) ~> route ~> check {
      entityAs[PublicUser].uuid
    }
  }

  // Helper file writer
  def writeJsonOutput(filename: String, contents: String): Unit = {
    Some(new PrintWriter(db.TEST_DATA_DESTINATION + "/" + filename + ".json")).foreach { p => p.write(contents); p.close }
  }
}
