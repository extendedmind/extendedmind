package org.extendedmind.test

import spray.testkit.ScalatestRouteTest
import org.extendedmind.api.Service
import org.extendedmind.SettingsExtension
import scaldi.Module

abstract class SpraySpecBase extends SpecBase 
    with ScalatestRouteTest with Service{

  // spray-testkit
  def actorRefFactory = system

  // Initialize settings correctly here
  def settings = SettingsExtension(system)

  // Empty Scaldi bindings
  object EmptyTestConfiguration extends Module
}