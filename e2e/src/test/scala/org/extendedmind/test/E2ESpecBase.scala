package org.extendedmind.test

import org.junit.runner.RunWith
import org.scalatest.junit.JUnitRunner
import org.scalatest.BeforeAndAfter
import org.scalatest.FunSpec
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.selenium.WebBrowser
import org.openqa.selenium.phantomjs.PhantomJSDriver
import org.openqa.selenium.WebDriver
import org.openqa.selenium.phantomjs.PhantomJSDriverService._
import org.openqa.selenium.phantomjs.PhantomJSDriverService
import org.scalatest._
import org.zeroturnaround.zip.ZipUtil
import org.apache.commons.io.FileUtils
import java.io.File
import java.util.Properties
import java.io.FileInputStream

@RunWith(classOf[JUnitRunner])
abstract class E2ESpecBase extends FunSpec 
    with BeforeAndAfter with BeforeAndAfterAll with ShouldMatchers
    with WebBrowser{
  
  val TEST_DATA_PROPERTIES = "target/testData.properties"
    
  val testData: Properties = {
    val prop = new Properties()
    prop.load(new FileInputStream(TEST_DATA_PROPERTIES))
    prop
  }

  if (System.getProperty("os.name") == "Mac OS X") {
    System.setProperty(PHANTOMJS_EXECUTABLE_PATH_PROPERTY,"target/phantomjs-1.9.7/mac/bin/phantomjs")  
  } else {    
    System.setProperty(PHANTOMJS_EXECUTABLE_PATH_PROPERTY,"target/phantomjs-1.9.7/linux/bin/phantomjs")  
  }
  implicit val webDriver: WebDriver = new PhantomJSDriver
  
  override def afterAll(configMap: ConfigMap) {
    webDriver.quit()
  }
}
