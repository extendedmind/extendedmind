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

object TestGraphDatabase {
  val TIMO_EMAIL: String = "timo@ext.md"
  val TIMO_PASSWORD: String = "timopwd"
}

/**
 * Basic test data for Extended Mind
 */
trait TestGraphDatabase extends GraphDatabase {

  import TestGraphDatabase._

  def insertTestUsers() {
    var userId: Long = 0
    var tokenId: Long = 0
    withTx {
      implicit neo =>
        val timo = createNode(MainLabel.USER, UserLabel.ADMIN)
        val salt = PasswordService.generateSalt
        val password = TIMO_PASSWORD
        val encryptedPassword = PasswordService.getEncryptedPassword(
          password, salt, PasswordService.ALGORITHM, PasswordService.ITERATIONS)
        timo.setProperty("passwordAlgorithm", encryptedPassword.algorithm)
        timo.setProperty("passwordIterations", encryptedPassword.iterations)
        timo.setProperty("passwordHash", Base64.encodeBase64String(encryptedPassword.passwordHash))
        timo.setProperty("passwordSalt", encryptedPassword.salt)
        timo.setProperty("email", TIMO_EMAIL)
        userId = timo.getId()
        val timoTokenNode = createNode(MainLabel.TOKEN)
        tokenId = timoTokenNode.getId()
    }
    withTx {
      implicit neo =>
        val timoTokenNode = getNodeById(tokenId)
        val timoToken = Token(UUIDUtils.getUUID(timoTokenNode.getProperty("uuid").asInstanceOf[String]))
        timoTokenNode.setProperty("accessKey", timoToken.accessKey)
        val timo = getNodeById(userId)
        timo --> UserRelationship.HAS_TOKEN --> timoTokenNode
    }
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
