package org.extendedmind.test

import org.scalatest.FunSpec
import org.scalatest.matchers.ShouldMatchers
import spray.testkit.ScalatestRouteTest
import org.extendedmind.Service
import org.extendedmind.SettingsExtension
import org.extendedmind.domain.GraphDatabase
import org.extendedmind.Settings
import org.extendedmind.Configuration
import scaldi.Module
import org.extendedmind.Configuration
import org.scalatest.mock.MockitoSugar
import org.scalatest.BeforeAndAfterAll
import org.scalatest.BeforeAndAfter

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