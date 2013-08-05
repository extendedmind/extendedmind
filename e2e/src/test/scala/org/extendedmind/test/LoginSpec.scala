package org.extendedmind.test

import org.scalatest.concurrent.Eventually._

class LoginSpec extends E2ESpecBase {

  describe("Extended Mind Website") {
    it("should return error on invalid password") {
      go to "http://localhost:8080/login"
      click on("username")
      pressKeys("timo@ext.md")
      click on("password")
      pressKeys("wrong")
      submit()
      eventually { currentUrl should include("/login") }
    }
    it("should return front page on successful login") {
      go to "http://localhost:8080/login"
      click on("username")
      pressKeys("timo@ext.md")
      click on("password")
      pressKeys("timopwd")
      submit()
      eventually { currentUrl should endWith("/my") }
    }
  }
}
