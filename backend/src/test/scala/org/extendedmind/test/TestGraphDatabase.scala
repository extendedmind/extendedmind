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

package org.extendedmind.test

import org.extendedmind._
import org.extendedmind.db._
import org.extendedmind.security._
import org.extendedmind.domain._
import org.neo4j.scala.EmbeddedGraphDatabaseServiceProvider
import java.util.UUID
import org.apache.commons.codec.binary.Base64
import org.neo4j.scala.ImpermanentGraphDatabaseServiceProvider
import org.neo4j.graphdb.factory.GraphDatabaseFactory
import org.neo4j.test.TestGraphDatabaseFactory
import org.neo4j.graphdb.Node
import java.io.PrintWriter
import org.neo4j.scala.DatabaseService
import java.lang.{Long=>JLong}

object TestGraphDatabase {
  val TIMO_EMAIL: String = "timo@extendedmind.org"
  val TIMO_PASSWORD: String = "timopwd"
  val LAURI_EMAIL: String = "lauri@extendedmind.org"
  val LAURI_PASSWORD: String = "lauripwd"
  val JP_EMAIL: String = "jp@extendedmind.org"
  val JP_PASSWORD: String = "jiipeepwd"
  val INFO_EMAIL: String = "info@extendedmind.org"
  val INFO_PASSWORD: String = "infopwd"
}

/**
 * Basic test data for Extended Mind
 */
trait TestGraphDatabase extends GraphDatabase {

  import TestGraphDatabase._

  val TEST_DATA_DESTINATION = "target/test-classes"

  var timoUUID: UUID = null
  var lauriUUID: UUID = null
  var tcUUID: UUID = null
  var tdUUID: UUID = null

  def insertTestData(testDataLocation: Option[String] = None) {
    
    // Initialize database and create common collective and admin user
    val timoUser = User(TIMO_EMAIL, Some("Timo"), Some("timo"), Some("Test *bio* for Timo"), Some("md"), Some(1), None)
    val testDataCollective = Collective("test data", Some("common collective for all test users"), None, Some("test-data"), None, None, None)
    val initializeResult = initializeDatabase(transactionEventHandlers(), Some(testDataCollective), Some(timoUser), Some(TIMO_PASSWORD))
    val testDataNode = withTx { implicit neo => getNode(initializeResult._2.get, OwnerLabel.COLLECTIVE).right.get }
    val timoNode = withTx { implicit neo => getNode(initializeResult._3.get, OwnerLabel.USER).right.get }
    val verifiedTimestamp = System.currentTimeMillis + 1000
    val lauriUser = User(LAURI_EMAIL, None, None, None, None, None, None)
    val lauriNode = createUser(lauriUser, LAURI_PASSWORD, Some(UserLabel.ADMIN),
                               None, overrideEmailVerified=Some(verifiedTimestamp)).right.get._1
    val jpUser = User(JP_EMAIL, None, None, None, None, None, None)
    val jpNode = createUser(jpUser, JP_PASSWORD, Some(UserLabel.ALFA),
                               None, overrideEmailVerified=Some(verifiedTimestamp)).right.get._1

    // Collectives
    withTx {
      implicit neo =>
        // Set a predictable test UUID "11111111-1111-1111-1111-111111111111" for the common collective,
        // stored as tight base64
        tdUUID = java.util.UUID.fromString("11111111-1111-1111-1111-111111111111")
        testDataNode.setProperty("uuid", "EREREREREREREREREREREQ")
        // Store a uuid with + character that needs to be escaped in Lucene indices
        timoNode.setProperty("uuid","+eDZ9pdBSQWexIARddL9zA")

        // Store a predictable inbox id (use "w" as the widest character)
        timoNode.setProperty("inboxId", "wwwwwwww")
    }

    val testCompany = createCollective(
      timoNode, "test company",
      Some("private collective for a test company"), false,
      Some("Test Company"), Some("tc"), Some("Test _underlined_content_ for the collective"), Some("md"),
      Some(OwnerPreferences(None, Some("{\"useCC\":true}"), Some("{\"sharing\":true}"))))

    // Info node created after common collective "test data" but should still be part of it,
    // Info does not have email verified
    val infoNode = createUser(User(INFO_EMAIL, None, None, None, None, None, None), INFO_PASSWORD, None).right.get

    // Add permissions to collectives
    withTx {
      implicit neo =>
        setCollectiveUserPermission(getUUID(testCompany), getUUID(timoNode), getUUID(lauriNode),
          Some(SecurityContext.READ_WRITE))
        setCollectiveUserPermission(getUUID(testCompany), getUUID(timoNode), getUUID(jpNode),
          Some(SecurityContext.READ))
        tcUUID = getUUID(testCompany)
        lauriUUID = getUUID(lauriNode)
    }

    withTx {
      implicit neo =>

        val testOnboardingPreferences = "{\"user\":\"1432192930431:devel:devel\",\"focus\":\"1432192930431:devel:devel\",\"inbox\":\"1432192930431:devel:devel\",\"tasks\":\"1432192930431:devel:devel\",\"notes\":\"1432192930431:devel:devel\",\"lists\":{\"active\":\"1432192930431:devel:devel\"},\"list\":\"1432192930431:devel:devel\",\"trash\":\"1432192930431:devel:devel\",\"settings\":\"1432192930431:devel:devel\"}"

        // Add preferences to timo node
        patchExistingUser(getUUID(timoNode), timoUser.copy(preferences = Some(OwnerPreferences(Some(testOnboardingPreferences), None, Some("{\"sharing\":true}")))))

        // Add preferences to lauri node
        patchExistingUser(getUUID(lauriNode), lauriUser.copy(preferences = Some(OwnerPreferences(Some(testOnboardingPreferences), None, None))))

        // Add preferences to JP node
        patchExistingUser(getUUID(jpNode), jpUser.copy(preferences = Some(OwnerPreferences(Some(testOnboardingPreferences), None, None))))

        // Valid, unreplaceable
        timoUUID = getUUID(timoNode)
        val token = Token(timoUUID)
        saveToken(timoNode, token, None)

        // Valid, replaceable
        val replaceableToken = Token(IdUtils.getUUID(timoNode.getProperty("uuid").asInstanceOf[String]))
        saveToken(timoNode, replaceableToken, Some(AuthenticatePayload(true, None)))

        val currentTime = System.currentTimeMillis()
        // Save another expired token
        val expiredToken = saveCustomToken(currentTime - 1000, None, timoNode)
        // Save another replaceable but expired token
        val expiredReplaceableToken = saveCustomToken(currentTime - 1000, Some(currentTime + 1000 * 60 * 60 * 24 * 10000), timoNode)
        // Save another not replaceable anymore, expired token
        val expiredUnreplaceableToken = saveCustomToken(currentTime - 1000, Some(currentTime - 100), timoNode)

        // Save test data
        if (testDataLocation.isDefined) {
          val testData = "# 12h valid token for timo@extendedmind.org: " + "\n" +
            "token=" + Token.encryptToken(token) + "\n\n" +
            "# 12h valid, 7 days replaceable token for timo@extendedmind.org: " + "\n" +
            "replaceableToken=" + Token.encryptToken(replaceableToken) + "\n\n" +
            "# Expired token for timo@extendedmind.org: " + "\n" +
            "expiredToken=" + Token.encryptToken(expiredToken) + "\n\n" +
            "# Expired but replaceable token for timo@extendedmind.org: " + "\n" +
            "expiredReplaceableToken=" + Token.encryptToken(expiredReplaceableToken) + "\n\n" +
            "# Expired unreplaceable token for timo@extendedmind.org: " + "\n" +
            "expiredUnreplaceableToken=" + Token.encryptToken(expiredUnreplaceableToken) + "\n\n"
          Some(new PrintWriter(testDataLocation.get + "/" + "testData.properties")).foreach { p => p.write(testData); p.close }
        }
    }

    // Common collective

    // Common contexts, and one productivity tag
    val homeTag = putNewTag(Owner(timoUUID, Some(tdUUID), Token.ADMIN),
      Tag("home", None, None, CONTEXT, None))
    val officeTag = putNewTag(Owner(timoUUID, Some(tdUUID), Token.ADMIN),
      Tag("office", None, None, CONTEXT, None))
    val computerTag = putNewTag(Owner(timoUUID, Some(tdUUID), Token.ADMIN),
      Tag("computer", None, None, CONTEXT, None))
    val browserTag = putNewTag(Owner(timoUUID, Some(tdUUID), Token.ADMIN),
      Tag("browser", None, None, CONTEXT, computerTag.right.get.uuid))
    val emailTag = putNewTag(Owner(timoUUID, Some(tdUUID), Token.ADMIN),
      Tag("email", None, None, CONTEXT, computerTag.right.get.uuid))

    val workTag = putNewTag(Owner(timoUUID, Some(tdUUID), Token.ADMIN),
      Tag("work", None, None, KEYWORD, None))
    val productivityTag = putNewTag(Owner(timoUUID, Some(tdUUID), Token.ADMIN),
      Tag("productivity", None, None, KEYWORD, workTag.right.get.uuid))
    val technologyTag = putNewTag(Owner(timoUUID, Some(tdUUID), Token.ADMIN),
      Tag("technology", None, None, KEYWORD, None))

    // Test Company

    // Store tags for TC
    val devopsTag = putNewTag(Owner(timoUUID, Some(tcUUID), Token.ADMIN),
      Tag("devops", None, None, KEYWORD, None))

    // Store items for TC
    putNewItem(Owner(timoUUID, Some(tcUUID), Token.ADMIN),
      Item("should we try a premortem?", None, None)).right.get
    putNewItem(Owner(timoUUID, Some(tcUUID), Token.ADMIN),
      Item("review agile project planning tools", None, None)).right.get

    // Store tasks for TC
    putNewTask(Owner(timoUUID, Some(tcUUID), Token.ADMIN),
      Task("backup script changes", None, None, Some("2014-06-02"), None, None, None)).right.get

    // Store notes for TC
    val listOfServersNoteResult = putNewNote(Owner(timoUUID, Some(tcUUID), Token.ADMIN),
      Note("list of servers", None, None, None, None, None,
          Some(ExtendedItemRelationships(None, None, None, None, Some(scala.List(devopsTag.right.get.uuid.get)),
              Some(scala.List((tdUUID, scala.List(technologyTag.right.get.uuid.get)))))))).right.get
    publishNote(Owner(timoUUID, Some(tcUUID), Token.ADMIN), listOfServersNoteResult.uuid.get, "md", "list-of-servers", Some(LicenceType.CC_BY_SA_4_0.toString), true, None, None)

    // Timo's personal items

    // Store items for user
    putNewItem(Owner(timoUUID, None, Token.ADMIN),
      Item("should I start yoga?", None, None)).right.get
    putNewItem(Owner(timoUUID, None, Token.ADMIN),
      Item("remember the milk", None, None)).right.get

    // Store tags for user
    val secretTag = putNewTag(Owner(timoUUID, None, Token.ADMIN),
      Tag("secret", None, None, KEYWORD, None))
    val blogTag = putNewTag(Owner(timoUUID, None, Token.ADMIN),
      Tag("blog", None, None, KEYWORD, None))

    // Store lists for user
    val extendedMindTechnologiesList = putNewList(Owner(timoUUID, None, Token.ADMIN),
      List("extended mind technologies", None, Some("http://extendedmind.org"), None, None)).right.get
    val tripList = putNewList(Owner(timoUUID, None, Token.ADMIN),
      List("trip to Dublin", None, None, Some("2013-10-31"), None)).right.get
    val essayList = putNewList(Owner(timoUUID, None, Token.ADMIN),
      List("write essay on cognitive biases", None, None, None, None)).right.get

    // Store tasks for user
    putNewTask(Owner(timoUUID, None, Token.ADMIN),
      Task("clean closet", None, None, None, None, None,
        Some(ExtendedItemRelationships(None, None, None, None, None,
            Some(scala.List((tdUUID, scala.List(homeTag.right.get.uuid.get)))))))).right.get
    putNewTask(Owner(timoUUID, None, Token.ADMIN),
      Task("book flight", None, None, Some("2014-01-01"), None, None,
        Some(ExtendedItemRelationships(Some(tripList.uuid.get), None, None, None, None,
            Some(scala.List((tdUUID, scala.List(browserTag.right.get.uuid.get)))))))).right.get
    putNewTask(Owner(timoUUID, None, Token.ADMIN),
      Task("print tickets", None, Some("http://www.finnair.fi"), Some("2014-01-02"), None,
          Some(scala.List(Reminder("12345678901234567", "ln", "ios-cordova", "iPhone6", System.currentTimeMillis + 60000))),
        Some(ExtendedItemRelationships(Some(tripList.uuid.get), None, None, None, None,
            Some(scala.List((tdUUID, scala.List(officeTag.right.get.uuid.get)))))))).right.get
    val completedTask = putNewTask(Owner(timoUUID, None, Token.ADMIN),
      Task("get extendedmind.org domain", None, None, Some("2013-05-01"), None, None,
        Some(ExtendedItemRelationships(Some(extendedMindTechnologiesList.uuid.get), None, None, None, None,
            Some(scala.List((tdUUID, scala.List(browserTag.right.get.uuid.get)))))))).right.get
    completeTask(Owner(timoUUID, None, Token.ADMIN), completedTask.uuid.get, None)
    putNewTask(Owner(timoUUID, None, Token.ADMIN),
      Task("sketch outline for essay", None, None, Some("2014-03-08"), None, None,
        Some(ExtendedItemRelationships(Some(essayList.uuid.get), None, None, None, None, None)))).right.get
    putNewTask(Owner(timoUUID, None, Token.ADMIN),
      Task("write essay body", None, None, Some("2014-03-09"), None, None,
        Some(ExtendedItemRelationships(Some(essayList.uuid.get), None, None, None, None, None)))).right.get
    putNewTask(Owner(timoUUID, None, Token.ADMIN),
      Task("finalize essay", None, None, Some("2014-03-10"), None, None,
        Some(ExtendedItemRelationships(Some(essayList.uuid.get), None, None, None, None, None)))).right.get

    // Store notes for user
    putNewNote(Owner(timoUUID, None, Token.ADMIN),
      Note("contexts could be used to prevent access to data", None, None, None, None, None, None)).right.get
    putNewNote(Owner(timoUUID, None, Token.ADMIN),
      Note("office door code", None, None, Some("4321"), None, None,
        Some(ExtendedItemRelationships(None, None, None, None, Some(scala.List(secretTag.right.get.uuid.get)), None)))).right.get
    val productivityNoteResult = putNewNote(Owner(timoUUID, None, Token.ADMIN),
      Note("notes on productivity", None, None, Some(
        "# what I've learned about productivity \n" +
          "## focus \n" +
          "to get things done, you need to have uninterrupted time \n" +
          "## rhythm \n" +
          "work in high intensity sprints of 90 minutes, then break for 15 minutes \n" +
          "## rest \n" +
          "without ample rest and sleep, your productivity will decline rapidly \n" +
          "## tools \n" +
          "use the best possible tools for your work \n" +
          "## process \n" +
          "increasing your productivity doesn't happen overnight"),
        Some("md"), None,
        Some(ExtendedItemRelationships(Some(extendedMindTechnologiesList.uuid.get), None, None, None, Some(scala.List(blogTag.right.get.uuid.get)),
          Some(scala.List((tdUUID, scala.List(productivityTag.right.get.uuid.get)))))))).right.get
    publishNote(Owner(timoUUID, None, Token.ADMIN), productivityNoteResult.uuid.get, "md", "productivity", Some(LicenceType.CC_BY_SA_4_0.toString), true, None, None)

    // Timo shares essay list with Lauri

    val shareAgreementResult = putNewAgreement(Agreement(AgreementType.LIST_AGREEMENT, SecurityContext.READ_WRITE,
                    AgreementTarget(essayList.uuid.get, None), Some(AgreementUser(Some(timoUUID), None)),
                    AgreementUser(None, Some(LAURI_EMAIL)))).right.get
    val agreementCode = 1234L
    val saveResponse = saveAgreementAcceptInformation(shareAgreementResult.result.uuid.get, agreementCode, "1234")
    acceptAgreement(agreementCode, LAURI_EMAIL).right.get

    // Lauri's personal items

    // Store tasks for Lauri
    val laurisCompletedTask = putNewTask(Owner(lauriUUID, None, Token.ADMIN),
      Task("complete this", Some("for testing"), None, Some("2015-06-02"), None, None, None)).right.get
    completeTask(Owner(lauriUUID, None, Token.ADMIN), laurisCompletedTask.uuid.get, None)

    // Build indexes
    rebuildUserIndexes
  }

  def saveCustomToken(expires: Long, replaceable: Option[Long], userNode: Node)(implicit neo: DatabaseService): Token = {
    val newToken = Token(IdUtils.getUUID(userNode.getProperty("uuid").asInstanceOf[String]))
    val tokenNode = createNode(MainLabel.TOKEN)
    val currentTime = System.currentTimeMillis()
    tokenNode.setProperty("accessKey", newToken.accessKey)
    tokenNode.setProperty("expires", expires)
    if (replaceable.isDefined)
      tokenNode.setProperty("replaceable", replaceable.get)
    tokenNode --> SecurityRelationship.IDS --> userNode
    newToken
  }

  def createCollective(creator: Node, title: String, description: Option[String], common: Boolean, displayName: Option[String], handle: Option[String], content: Option[String], format: Option[String], preferences: Option[OwnerPreferences]): Node = {
    withTx {
      implicit neo =>
        val collective = createCollective(getUUID(creator),
            Collective(title, description, displayName, handle, content, format, preferences), common)
        collective.right.get._1
    }
  }

}

class TestImpermanentGraphDatabase(implicit val settings: Settings)
  extends TestGraphDatabase with ImpermanentGraphDatabaseServiceProvider {
  def testGraphDatabaseFactory = {
    new TestGraphDatabaseFactory()
  }
}

class TestEmbeddedGraphDatabase(dataStore: String)(implicit val settings: Settings)
  extends TestGraphDatabase with EmbeddedGraphDatabaseServiceProvider {
  def neo4jStoreDir = dataStore
  def graphDatabaseFactory = {
    new GraphDatabaseFactory()
  }
}
