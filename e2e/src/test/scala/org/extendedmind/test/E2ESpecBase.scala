package org.extendedmind.test

import org.scalatest.BeforeAndAfter
import org.scalatest.FunSpec
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.selenium.WebBrowser
import org.openqa.selenium.phantomjs.PhantomJSDriver
import org.openqa.selenium.WebDriver
import org.openqa.selenium.phantomjs.PhantomJSDriverService._
import org.openqa.selenium.phantomjs.PhantomJSDriverService
import org.scalatest.BeforeAndAfterAll
import org.zeroturnaround.zip.ZipUtil
import org.apache.commons.io.FileUtils
import java.io.File


abstract class E2ESpecBase extends FunSpec 
    with BeforeAndAfter with BeforeAndAfterAll with ShouldMatchers
    with WebBrowser{
  
  val TEST_DATA_STORE_DESTINATION = new File("/tmp/temp-neo-test")
  val TEST_DATA_STORE = new File("target/neo4j-test.zip")
  
  System.setProperty(PHANTOMJS_EXECUTABLE_PATH_PROPERTY,"target/phantomjs-1.9.1-linux-x86_64/bin/phantomjs")  
  implicit val webDriver: WebDriver = new PhantomJSDriver
 
  // Initialize Neo4j every time
  before{
    // First delete old if it exists
    if (TEST_DATA_STORE_DESTINATION.exists() == true){
    	FileUtils.deleteDirectory(TEST_DATA_STORE_DESTINATION);
    }
    // Unpack test data
    ZipUtil.unpack(TEST_DATA_STORE, TEST_DATA_STORE_DESTINATION)
  }
  
  override def afterAll(configMap: Map[String, Any]) {
    webDriver.quit()
  }
}