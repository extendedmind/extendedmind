package org.extendedmind.test

import org.scalatest.FunSpec
import org.scalatest.BeforeAndAfter
import org.scalatest.matchers.ShouldMatchers
import spray.testkit.ScalatestRouteTest
import org.extendedmind.Service
import org.extendedmind.SettingsExtension
import org.extendedmind.domain.GraphDatabase
import org.extendedmind.Settings
import org.extendedmind.Configuration

abstract class SpecBase extends FunSpec 
    with ScalatestRouteTest with Service
    with BeforeAndAfter with ShouldMatchers{
  
  // spray-testkit
  def actorRefFactory = system

  // Initialize settings correctly here
  def settings = SettingsExtension(system)

}