package org.extendedmind.test

import org.extendedmind.Settings
import org.extendedmind.SettingsExtension
import org.extendedmind.api.Service
import org.extendedmind.db.GraphDatabase
import org.scalatest.BeforeAndAfter
import org.scalatest.FunSpec
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.mock.MockitoSugar

import scaldi.Module
import spray.testkit.ScalatestRouteTest

abstract class SpecBase extends FunSpec 
    with ScalatestRouteTest with Service
    with BeforeAndAfter with ShouldMatchers
    with MockitoSugar{
  
  // spray-testkit
  def actorRefFactory = system

  // Initialize settings correctly here
  def settings = SettingsExtension(system)

  // Standard test mocks
  class TestConfiguration(settings: Settings) extends Module {
    bind [GraphDatabase] to new TestGraphDatabase(settings)
  }
}