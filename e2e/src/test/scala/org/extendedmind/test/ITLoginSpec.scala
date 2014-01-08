package org.extendedmind.test

import org.scalatest.concurrent.Eventually._
import org.scalatest.time.Span
import org.scalatest.time.Seconds
import org.openqa.selenium.By

class ITLoginSpec extends E2ESpecBase {
  describe("Extended Mind Website") {
    it("should return error on invalid email") {
      go to "http://localhost:8080/login"
      click on id("input-email")
      pressKeys("timo@extendedmind.org")
      click on ("input-password")
      pressKeys("timopwd")
      click on id("login-button")
      eventually { currentUrl should include("/login") }
    }

    it("should return error on invalid password") {
      go to "http://localhost:8080/login"
      click on id("input-email")
      pressKeys("timo@ext.md")
      click on ("input-password")
      pressKeys("wrong")
      click on id("login-button")
      eventually { currentUrl should include("/login") }
    }

    it("should return front page on successful login") {
      go to "http://localhost:8080/login"
      click on id("input-email")
      pressKeys("timo@ext.md")
      click on ("input-password")
      pressKeys("timopwd")
      click on id("login-button")
      eventually(timeout(Span(5, Seconds))) { currentUrl should include("/my") }
    }
  }
}