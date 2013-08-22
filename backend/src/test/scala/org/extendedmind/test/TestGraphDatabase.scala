package org.extendedmind.test

import org.extendedmind.Settings
import org.extendedmind.db.GraphDatabase
import org.extendedmind.search.SearchIndex
import org.neo4j.scala.EmbeddedGraphDatabaseServiceProvider
import org.extendedmind.db.{ MainLabel, UserLabel }
import org.extendedmind.db.UserRelationship
import org.extendedmind.security.Token
import java.util.UUID
import org.extendedmind.security.PasswordService
import org.extendedmind.domain.User
import org.extendedmind.security.UUIDUtils
import org.neo4j.scala.Neo4jWrapper
import org.apache.commons.codec.binary.Base64
import org.neo4j.scala.ImpermanentGraphDatabaseServiceProvider
import org.neo4j.graphdb.factory.GraphDatabaseFactory
import org.neo4j.kernel.extension.KernelExtensionFactory
import org.neo4j.extension.uuid.UUIDKernelExtensionFactory
import org.neo4j.test.TestGraphDatabaseFactory
import org.neo4j.graphdb.Node
import org.extendedmind.security.AuthenticatePayload
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

  def insertTestUsers(testDataLocation: Option[String] = None) {
    val userNode = createUser(User(None, None, TIMO_EMAIL), TIMO_PASSWORD, Some(UserLabel.ADMIN)).right.get
    withTx{
      implicit neo =>
        // Valid, unreplaceable
        val token = Token(UUIDUtils.getUUID(userNode.getProperty("uuid").asInstanceOf[String]))
        saveToken(userNode, token, None)
        
        // Valid, replaceable
        val replaceableToken = Token(UUIDUtils.getUUID(userNode.getProperty("uuid").asInstanceOf[String]))
        saveToken(userNode, replaceableToken, Some(AuthenticatePayload(true)))

        val currentTime = System.currentTimeMillis()
        // Save another expired token
        val expiredToken = saveCustomToken(currentTime - 1000, None, userNode)
        // Save another replaceable but expired token
        val expiredReplaceableToken = saveCustomToken(currentTime - 1000, Some(currentTime + 1000*60*60*24*10000), userNode)
        // Save another not replaceable anymore, expired token
        val expiredUnreplaceableToken = saveCustomToken(currentTime - 1000, Some(currentTime - 100), userNode)

        // Save items for user
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
    tokenNode --> UserRelationship.FOR_USER --> userNode
    newToken
  }
  
}

class TestImpermanentGraphDatabase(implicit val settings: Settings)
  extends TestGraphDatabase with ImpermanentGraphDatabaseServiceProvider {
  def testGraphDatabaseFactory = {
    val factory = new TestGraphDatabaseFactory()
    factory.addKernelExtensions(kernelExtensions)
    factory
  }
}

class TestEmbeddedGraphDatabase(dataStore: String)(implicit val settings: Settings)
  extends TestGraphDatabase with EmbeddedGraphDatabaseServiceProvider {
  def neo4jStoreDir = dataStore
  def graphDatabaseFactory = {
    new GraphDatabaseFactory().addKernelExtensions(kernelExtensions)
  }
}
