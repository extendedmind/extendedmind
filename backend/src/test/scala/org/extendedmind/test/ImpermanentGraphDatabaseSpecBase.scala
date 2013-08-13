package org.extendedmind.api.test
import org.extendedmind.bl.ItemActions
import scaldi.Module
import org.mockito.Mockito._
import org.extendedmind.domain.User
import org.extendedmind.test.SpecBase
import java.io.PrintWriter
import spray.testkit.ScalatestRouteTest
import org.extendedmind.api.Service
import org.extendedmind.SettingsExtension
import org.extendedmind.test.SpraySpecBase
import org.extendedmind.bl.SecurityActions
import spray.http.HttpHeaders.Authorization
import spray.http.BasicHttpCredentials
import java.util.UUID
import org.extendedmind.domain.UserWrapper
import org.extendedmind.test.TestImpermanentGraphDatabase
import org.extendedmind.db.GraphDatabase
import org.extendedmind.test.TestGraphDatabase._
import org.extendedmind.security.SecurityContext
import org.extendedmind.api.JsonImplicits._
import spray.httpx.SprayJsonSupport._
import spray.httpx.marshalling._
import org.extendedmind.security.AuthenticatePayload


trait ImpermanentGraphDatabaseSpecBase extends SpraySpecBase{

  // Create test database
  var db: TestImpermanentGraphDatabase = null

  before{
    db = new TestImpermanentGraphDatabase
    db.insertTestUsers
  }
}