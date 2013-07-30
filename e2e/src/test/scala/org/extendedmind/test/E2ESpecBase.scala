package org.extendedmind.test

import org.scalatest.BeforeAndAfter
import org.scalatest.FunSpec
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.selenium.WebBrowser
import org.openqa.selenium.phantomjs.PhantomJSDriver
import org.openqa.selenium.WebDriver
import org.openqa.selenium.phantomjs.PhantomJSDriverService._
import org.openqa.selenium.phantomjs.PhantomJSDriverService

abstract class E2ESpecBase extends FunSpec 
    with BeforeAndAfter with ShouldMatchers
    with WebBrowser{
  
  System.setProperty(PHANTOMJS_EXECUTABLE_PATH_PROPERTY,"target/phantomjs-1.9.1-linux-x86_64/bin/phantomjs")  
  implicit val webDriver: WebDriver = new PhantomJSDriver
}