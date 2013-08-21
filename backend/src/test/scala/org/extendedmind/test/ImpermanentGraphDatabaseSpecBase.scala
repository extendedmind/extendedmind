package org.extendedmind.api.test

import org.extendedmind.test.SpraySpecBase
import org.extendedmind.test.TestImpermanentGraphDatabase


trait ImpermanentGraphDatabaseSpecBase extends SpraySpecBase{

  // Create test database
  var db: TestImpermanentGraphDatabase = null

  before{
    db = new TestImpermanentGraphDatabase
    db.insertTestUsers()
  }
}