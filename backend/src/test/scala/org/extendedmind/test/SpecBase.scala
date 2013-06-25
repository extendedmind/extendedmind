package org.extendedmind.test

import org.extendedmind.Settings
import org.extendedmind.db.GraphDatabase
import org.scalatest.BeforeAndAfter
import org.scalatest.FunSpec
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.mock.MockitoSugar

import scaldi.Module

abstract class SpecBase extends FunSpec 
    with BeforeAndAfter with ShouldMatchers
    with MockitoSugar{
  
  // Standard test mocks
  class TestConfiguration(settings: Settings) extends Module {
    bind [GraphDatabase] to new TestGraphDatabase(settings)
  }
}