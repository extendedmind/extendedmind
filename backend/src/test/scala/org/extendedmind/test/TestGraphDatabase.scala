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
import org.neo4j.kernel.extension.KernelExtensionFactory
import org.neo4j.extension.uuid.UUIDKernelExtensionFactory
import org.neo4j.test.TestGraphDatabaseFactory
import org.neo4j.graphdb.Node
import java.io.PrintWriter
import org.neo4j.scala.DatabaseService

object TestGraphDatabase {
  val TIMO_EMAIL: String = "timo@ext.md"
  val TIMO_PASSWORD: String = "timopwd"
  val LAURI_EMAIL: String = "lauri@ext.md"
  val LAURI_PASSWORD: String = "lauripwd"
  val JP_EMAIL: String = "jp@ext.md"
  val JP_PASSWORD: String = "jppwd"
  val INFO_EMAIL: String = "info@ext.md"
  val INFO_PASSWORD: String = "infopwd"
}

/**
 * Basic test data for Extended Mind
 */
trait TestGraphDatabase extends GraphDatabase {
  
  import TestGraphDatabase._

  val TEST_DATA_DESTINATION = "target/test-classes"

  var timoUUID: UUID = null
  var emtUUID: UUID = null
  
  def insertTestData(testDataLocation: Option[String] = None) {
    val timoNode = createUser(User(TIMO_EMAIL), TIMO_PASSWORD, Some(UserLabel.ADMIN)).right.get
    val lauriNode = createUser(User(LAURI_EMAIL), LAURI_PASSWORD, Some(UserLabel.ADMIN)).right.get
    val jpNode = createUser(User(JP_EMAIL), JP_PASSWORD, Some(UserLabel.ADMIN)).right.get

    // Collectives
    val extendedMind = createCollective(timoNode, "extended mind", Some("common collective for all extended mind users"), true)
    val extendedMindTechnologies = createCollective(
                                            timoNode, "extended mind technologies", 
                                            Some("private collective for extended mind technologies"), false)
    
    // Info node created after common collective "extended mind" but should still be part of it
    val infoNode = createUser(User(INFO_EMAIL), INFO_PASSWORD).right.get
                                            
    // Add permissions to collectives
    withTx{
      implicit neo =>
        setCollectiveUserPermission(getUUID(extendedMindTechnologies), getUUID(timoNode), getUUID(lauriNode), 
            Some(SecurityContext.READ_WRITE))                                            
        setCollectiveUserPermission(getUUID(extendedMindTechnologies), getUUID(jpNode), getUUID(jpNode), 
            Some(SecurityContext.READ_WRITE))
        emtUUID = getUUID(extendedMindTechnologies)
    }
    withTx{
      implicit neo =>
        // Valid, unreplaceable
        timoUUID = getUUID(timoNode)
        val token = Token(timoUUID)
        saveToken(timoNode, token, None)
        
        // Valid, replaceable
        val replaceableToken = Token(UUIDUtils.getUUID(timoNode.getProperty("uuid").asInstanceOf[String]))
        saveToken(timoNode, replaceableToken, Some(AuthenticatePayload(true)))

        val currentTime = System.currentTimeMillis()
        // Save another expired token
        val expiredToken = saveCustomToken(currentTime - 1000, None, timoNode)
        // Save another replaceable but expired token
        val expiredReplaceableToken = saveCustomToken(currentTime - 1000, Some(currentTime + 1000*60*60*24*10000), timoNode)
        // Save another not replaceable anymore, expired token
        val expiredUnreplaceableToken = saveCustomToken(currentTime - 1000, Some(currentTime - 100), timoNode)

        // Save test data
        if (testDataLocation.isDefined){      
          val testData = "# 12h valid token for timo@ext.md: " + "\n" + 
                         "token=" + Token.encryptToken(token) + "\n\n" +
                         "# 12h valid, 7 days replaceable token for timo@ext.md: " + "\n" + 
                         "replaceableToken=" + Token.encryptToken(replaceableToken) + "\n\n" +                
                         "# Expired token for timo@ext.md: " + "\n" +
                         "expiredToken=" + Token.encryptToken(expiredToken) + "\n\n" + 
                         "# Expired but replaceable token for timo@ext.md: " + "\n" + 
                         "expiredReplaceableToken=" + Token.encryptToken(expiredReplaceableToken) + "\n\n" +
                         "# Expired unreplaceable token for timo@ext.md: " + "\n" +
                         "expiredUnreplaceableToken=" + Token.encryptToken(expiredUnreplaceableToken) + "\n\n"
          Some(new PrintWriter(testDataLocation.get + "/" + "testData.properties")).foreach{p => p.write(testData); p.close}
        }
    }

    // Timo's personal items
    
    // Store items for user
    putNewItem(Owner(timoUUID, None),
        Item(None, None, None, "should I start yoga?", None, None)).right.get
    putNewItem(Owner(timoUUID, None),
        Item(None, None, None, "remember the milk", None, None)).right.get
    
    // Store tags for user
    val homeTag = putNewTag(Owner(timoUUID, None),
        Tag("home", None, None, CONTEXT, None))
    val officeTag = putNewTag(Owner(timoUUID, None),
        Tag("office", None, None, CONTEXT, None))
    val computerTag = putNewTag(Owner(timoUUID, None),
        Tag("computer", None, None, CONTEXT, None))
    val browserTag = putNewTag(Owner(timoUUID, None),
        Tag("browser", None, None, CONTEXT, computerTag.right.get.uuid))
    val emailTag = putNewTag(Owner(timoUUID, None),
        Tag("email", None, None, CONTEXT, computerTag.right.get.uuid))
    val secretTag = putNewTag(Owner(timoUUID, None),
        Tag("secret", None, None, KEYWORD, None))        
    val productivityTag = putNewTag(Owner(timoUUID, None),
        Tag("productivity", None, None, KEYWORD, None))

    // Store lists for user
    val extendedMindTechnologiesList = putNewList(Owner(timoUUID, None), 
        List("extended mind technologies", None, Some("http://ext.md"), None, None, None, None)).right.get
    val tripList = putNewList(Owner(timoUUID, None),
        List("trip to Dublin", None, None, Some(true), Some("2013-10-31"), None, None)).right.get
    val essayList = putNewList(Owner(timoUUID, None),
        List("write essay on cognitive biases", None, None, Some(true), None, None, None)).right.get

    // Store tasks for user
    putNewTask(Owner(timoUUID, None),
        Task("clean closet", None, None, None, None,  None,
            Some(ExtendedItemRelationships(None, None, Some(scala.List(homeTag.right.get.uuid.get)))
    ))).right.get
    putNewTask(Owner(timoUUID, None),
        Task("book flight", None, None, Some("2014-01-01"), None,  None,
            Some(ExtendedItemRelationships(Some(tripList.uuid.get), None, Some(scala.List(browserTag.right.get.uuid.get)))
    ))).right.get
    putNewTask(Owner(timoUUID, None),
        Task("print tickets", None, Some("http://www.finnair.fi"), Some("2014-01-02"), Some("10:00"),  None, 
            Some(ExtendedItemRelationships(Some(tripList.uuid.get), None, Some(scala.List(officeTag.right.get.uuid.get)))
    ))).right.get
    val completedTask = putNewTask(Owner(timoUUID, None),
        Task("get ext.md domain", None, None, Some("2013-05-01"), None, None, 
            Some(ExtendedItemRelationships(Some(extendedMindTechnologiesList.uuid.get), None, Some(scala.List(browserTag.right.get.uuid.get)))
    ))).right.get
    completeTask(Owner(timoUUID, None), completedTask.uuid.get)
    putNewTask(Owner(timoUUID, None),
        Task("sketch outline for essay", None, None, Some("2014-03-08"), None, None, 
            Some(ExtendedItemRelationships(Some(essayList.uuid.get), None, None)
    ))).right.get
    putNewTask(Owner(timoUUID, None),
        Task("write essay body", None, None, Some("2014-03-09"), None, None, 
            Some(ExtendedItemRelationships(Some(essayList.uuid.get), None, None)
    ))).right.get
    putNewTask(Owner(timoUUID, None),
        Task("finalize essay", None, None, Some("2014-03-10"), None, None,
            Some(ExtendedItemRelationships(Some(essayList.uuid.get), None, None)
    ))).right.get
    
    // Store notes for user
    putNewNote(Owner(timoUUID, None), 
        Note("office door code", None, None, Some("4321"), 
            Some(ExtendedItemRelationships(None, None, Some(scala.List(secretTag.right.get.uuid.get)))
    ))).right.get
    putNewNote(Owner(timoUUID, None), 
        Note("notes on productivity", None, None, Some("##what I've learned about productivity"), 
            Some(ExtendedItemRelationships(None, None, Some(scala.List(productivityTag.right.get.uuid.get)))
    ))).right.get

    // Extended Mind Technologies
    
    // Store items for EMT
    putNewItem(Owner(timoUUID, Some(emtUUID)),
        Item(None, None, None, "should we try a premortem?", None, None)).right.get
    putNewItem(Owner(timoUUID, Some(emtUUID)),
        Item(None, None, None, "review agile project planning tools", None, None)).right.get
 
    // Store tasks for EMT
    putNewTask(Owner(timoUUID, Some(emtUUID)),
        Task("backup script changes", None, None, Some("2014-06-02"), None, None, None)).right.get

    // Store notes for EMT
    putNewNote(Owner(timoUUID, Some(emtUUID)),
        Note("list of servers", None, None, None, None)).right.get
    
    // Build indexes
    rebuildUserIndexes
  }
  
  def saveCustomToken(expires: Long, replaceable: Option[Long], userNode: Node)
               (implicit neo: DatabaseService): Token = {
    val newToken = Token(UUIDUtils.getUUID(userNode.getProperty("uuid").asInstanceOf[String]))
    val tokenNode = createNode(MainLabel.TOKEN)
    val currentTime = System.currentTimeMillis()
    tokenNode.setProperty("accessKey", newToken.accessKey)
    tokenNode.setProperty("expires", expires)
    if (replaceable.isDefined)
      tokenNode.setProperty("replaceable", replaceable.get)
    tokenNode --> SecurityRelationship.IDS --> userNode
    newToken
  }
  
  def createCollective(creator: Node, title: String, description: Option[String], common: Boolean): Node = {
    withTx{
      implicit neo =>
        val collective = createCollective(getUUID(creator), Collective(title, description), common)
        collective.right.get
    }
  }
  
}

class TestImpermanentGraphDatabase(implicit val settings: Settings)
  extends TestGraphDatabase with ImpermanentGraphDatabaseServiceProvider {
  def testGraphDatabaseFactory = {
    val factory = new TestGraphDatabaseFactory()
    factory.addKernelExtensions(kernelExtensions(false))
    factory
  }
}

class TestEmbeddedGraphDatabase(dataStore: String)(implicit val settings: Settings)
  extends TestGraphDatabase with EmbeddedGraphDatabaseServiceProvider {
  def neo4jStoreDir = dataStore
  def graphDatabaseFactory = {
    new GraphDatabaseFactory().addKernelExtensions(kernelExtensions(true))
  }
}
