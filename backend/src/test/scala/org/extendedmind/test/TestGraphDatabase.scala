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
}

/**
 * Basic test data for Extended Mind
 */
trait TestGraphDatabase extends GraphDatabase {
  
  import TestGraphDatabase._

  val TEST_DATA_DESTINATION = "target/test-classes"

  var timoUUID: UUID = null
  
  def insertTestData(testDataLocation: Option[String] = None) {
    val timoNode = createUser(User(None, None, None, TIMO_EMAIL), TIMO_PASSWORD, Some(UserLabel.ADMIN)).right.get
    
    withTx{
      implicit neo =>
        // Valid, unreplaceable
        timoUUID = UUIDUtils.getUUID(timoNode.getProperty("uuid").asInstanceOf[String])
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
    
    // Store items for user
    putNewItem(timoUUID,
        Item(None, None, None, "should I start yoga?", None)).right.get
    putNewItem(timoUUID,
        Item(None, None, None, "remember the milk", None)).right.get
    
    // Store tags for user
    putNewTag(timoUUID,
        Tag("home", None, CONTEXT, None, None))
    putNewTag(timoUUID,
        Tag("office", None, CONTEXT, None, None))
    val computerTag = putNewTag(timoUUID,
        Tag("computer", None, CONTEXT, None, None))
    putNewTag(timoUUID,
        Tag("browser", None, CONTEXT, None, computerTag.right.get.uuid))
    putNewTag(timoUUID,
        Tag("email", None, CONTEXT, None, computerTag.right.get.uuid))
    putNewTag(timoUUID,
        Tag("secret", None, KEYWORD, None, None))        
    putNewTag(timoUUID,
        Tag("productivity", None, KEYWORD, None, None))        

    // Store tasks for user
    putNewTask(timoUUID,
        Task("clean closet", None, None, None, None, None)).right.get
    putNewTask(timoUUID,
        Task("book flight", None, Some("2014-01-01"), None, None, None)).right.get
    putNewTask(timoUUID,
        Task("print tickets", None, Some("2014-01-02"), Some("10:00"), Some("http://www.finnair.fi"), None)).right.get
    val completedTask = putNewTask(timoUUID,
        Task("get ext.md domain", None, Some("2013-05-01"), None, None, None)).right.get
    completeTask(timoUUID, completedTask.uuid.get)
    
    // Store notes for user
    putNewNote(timoUUID, 
        Note("office door code", None, Some("4321"), None, None)).right.get
    putNewNote(timoUUID, 
        Note("notes on productivity", None, Some("##what I've learned about productivity"), None, None)).right.get
    putNewNote(timoUUID, 
        Note("extended mind", None, None, Some("http://ext.md"), None)).right.get
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
