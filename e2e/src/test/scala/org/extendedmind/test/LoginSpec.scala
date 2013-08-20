package org.extendedmind.test

import org.scalatest.concurrent.Eventually._
import org.scalatest.time.Span
import org.scalatest.time.Seconds
import org.openqa.selenium.By

class LoginSpec extends E2ESpecBase {
  describe("Extended Mind Website") {
    it("should return error on invalid email") {
      go to "http://localhost:8080/login"
      click on id("username")
      pressKeys("timo@extendedmind.org")
      click on ("password")
      pressKeys("timopwd")
      click on id("loginbutton")
      eventually { currentUrl should include("/login") }
    }
    it("should return error on invalid password") {
      go to "http://localhost:8080/login"
      click on id("username")
      pressKeys("timo@ext.md")
      click on ("password")
      pressKeys("wrong")
      click on id("loginbutton")
      eventually { currentUrl should include("/login") }
    }
    it("should return front page on successful login") {
      go to "http://localhost:8080/login"
      click on id("username")
      pressKeys("timo@ext.md")
      click on ("password")
      pressKeys("timopwd")
      click on id("loginbutton")
      eventually(timeout(Span(5, Seconds))) { currentUrl should include("/my") }
    }
    it("should return error on expired token") {
      val expiredToken = testData.getProperty("expiredToken");
      // TODO: The stored tokens are in e2e/target/testData.properties
      // Use them to check that authentication works as planned!
    }
  }
}