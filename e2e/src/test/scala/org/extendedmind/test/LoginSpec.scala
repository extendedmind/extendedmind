package org.extendedmind.test

class LoginSpec extends E2ESpecBase{

  describe("Extended Mind Website"){
    it("should return front page on successful login"){
    	go to "http://www.google.com"
    	click on "q"
			textField("q").value = "Cheese!"
			submit()
			// Google's search is rendered dynamically with JavaScript.
			eventually { title should be ("Cheese! - Google Search") }
    }
  }  
}