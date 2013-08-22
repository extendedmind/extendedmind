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

    //    it("should return error on expired token") {
    //      go to "http://localhost:8080/"
    //
    //      val expiredUnreplaceableToken = testData.getProperty("expiredUnreplaceableToken");
    //      add cookie ("token", expiredUnreplaceableToken)
    //
    //      go to "http://localhost:8080/my"
    //
    //      eventually(timeout(Span(5, Seconds))) {
    //        currentUrl should include("/login")
    //        delete all cookies
    //      }
    //    }
  }
}