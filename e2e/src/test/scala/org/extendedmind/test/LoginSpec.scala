package org.extendedmind.test

import org.scalatest.concurrent.Eventually._
import org.scalatest.time._

class LoginSpec extends E2ESpecBase {
  describe("Extended Mind Website") {
    it("should return error on invalid password") {
      go to "http://localhost:8080/login"
      click on("username")
      pressKeys("timo@ext.md")
      click on("password")
      pressKeys("wrong")
      submit()
//      val ele:Option[Element] = find("error")
//      ele should be ('Forbidden)
      eventually { currentUrl should include("/login") }
    }
    it("should return front page on successful login") {
        go to "http://localhost:8080/login"
        click on("username")
        pressKeys("timo@ext.md")
        click on("password")
        pressKeys("timopwd")
      submit()
      implicitlyWait(Span(20,Seconds))
      eventually { currentUrl should include("/my") }
    }
  }
}
