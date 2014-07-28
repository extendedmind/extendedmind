/**
 * Copyright (c) 2013-2014 Extended Mind Technologies Oy
 *
 * This file is part of Extended Mind.
 *
 * Extended Mind is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

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
