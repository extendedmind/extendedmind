package org.extendedmind.test

import org.scalatest.concurrent.Eventually._

class LoginSpec extends E2ESpecBase{

  describe("Extended Mind Website"){
    it("should return error on invalid password"){
    	go to "http://localhost:8080/login"
    	
    	click on "email"
			enter("timo@ext.md")

    	click on "password"
			enter("timopwd")
			submit()

			// Google's search is rendered dynamically with JavaScript.
			eventually { currentUrl should include("/login") }
    }
    it("should return front page on successful login"){
    	go to "http://localhost:8080/e2e/login"
			textField("user.email").value = "timo@ext.md"
			textField("user.password").value = "timo"
			submit()
			// Google's search is rendered dynamically with JavaScript.
			eventually { currentUrl should endWith("/") }
    }
  }
}