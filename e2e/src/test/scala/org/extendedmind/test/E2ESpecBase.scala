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
import java.util.Properties
import java.io.FileInputStream


abstract class E2ESpecBase extends FunSpec 
    with BeforeAndAfter with BeforeAndAfterAll with ShouldMatchers
    with WebBrowser{
  
  val TEST_DATA_STORE_DESTINATION = "target/neo4j-test"
  val TEST_DATA_STORE = "target/neo4j-test.zip"
  val TEST_DATA_PROPERTIES = "target/testData.properties"
    
  val testData: Properties = {
    val prop = new Properties()
    prop.load(new FileInputStream(TEST_DATA_PROPERTIES))
    prop
  }

  if (System.getProperty("os.name") == "Mac OS X") {
    System.setProperty(PHANTOMJS_EXECUTABLE_PATH_PROPERTY,"target/phantomjs-1.9.1-macosx/bin/phantomjs")  
  } else {
    System.setProperty(PHANTOMJS_EXECUTABLE_PATH_PROPERTY,"target/phantomjs-1.9.1-linux-x86_64/bin/phantomjs")  
  }
  implicit val webDriver: WebDriver = new PhantomJSDriver

  
  
  // Initialize Neo4j before every file
  override def beforeAll(configMap: Map[String, Any]) {
    // First delete old if it exists
    val store = new File(TEST_DATA_STORE_DESTINATION)
    if (store.exists() == true){
    	FileUtils.deleteDirectory(store);
    }
    // Unpack test data
    ZipUtil.unpack(new File(TEST_DATA_STORE), store)
  }
  
  override def afterAll(configMap: Map[String, Any]) {
    webDriver.quit()
  }
}
