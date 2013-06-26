package org.extendedmind.test

import org.extendedmind.Settings
import org.extendedmind.db.GraphDatabase
import org.extendedmind.search.SearchIndex
import org.neo4j.scala.EmbeddedGraphDatabaseServiceProvider
import org.neo4j.scala.Neo4jBatchIndexProvider
import org.neo4j.scala.BatchGraphDatabaseServiceProvider
import org.extendedmind.db.MainLabel
import org.extendedmind.db.UserRelationship
import org.extendedmind.security.Token
import java.util.UUID
import org.extendedmind.security.PasswordService
import org.extendedmind.domain.User

/**
 * Basic test data for Extended Mind
 */
trait TestGraphDatabase extends GraphDatabase {
  def insertTestUsers() {
    withTx {
      implicit neo =>
        putUser(User("timo@ext.md"))
        val timo = createNode
        timo.addLabel(MainLabel.USER)
        val salt = PasswordService.generateSalt
        val password = "timopwd"
        val encryptedPassword = PasswordService.getEncryptedPassword(
            														password, salt, PasswordService.ALGORITHM, PasswordService.ITERATIONS)
        timo.setProperty("passwordHash", encryptedPassword.passwordHash)
        timo.setProperty("passwordIterations", encryptedPassword.iterations)
        timo.setProperty("passwordAlgorithm", encryptedPassword.algorithm)
        
        val timoTokenNode = createNode
        timoTokenNode.addLabel(MainLabel.TOKEN)
        val timoToken = Token(UUID.fromString(timoTokenNode.getProperty("uuid").asInstanceOf[String]))
        timoTokenNode.setProperty("accessKey", timoToken.accessKey)
        timo --> UserRelationship.HAS_TOKEN --> timoTokenNode
    }
  }
}

class TestImpermanentGraphDatabase
  extends TestGraphDatabase with ImpermanentGraphDatabaseServiceProvider {
}

class TestBatchGraphDatabase
  extends TestGraphDatabase with Neo4jBatchIndexProvider with BatchGraphDatabaseServiceProvider {
  def neo4jStoreDir = "target/test-classes"
}
