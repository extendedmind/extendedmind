package org.extendedmind.test

import org.scalatest.BeforeAndAfter
import org.scalatest.FunSpec
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.selenium.WebBrowser

import org.openqa.selenium.phantomjs.PhantomJSDriver

abstract class E2ESpecBase extends FunSpec 
    with BeforeAndAfter with ShouldMatchers
    with WebBrowser{
  
  implicit val webDriver: WebDriver = new PhantomJSDriver
}