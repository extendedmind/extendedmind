package org.extendedmind.test

import org.scalatest.FunSpec
import java.util.UUID

class AdHocSpec extends FunSpec{
  describe("Regular expressions in Scala/Java"){
    it("should work with negative lookahead"){
    	val pattern = "^(?!(/api/|/static/)).+$".r
    	assert((pattern replaceAllIn("/api/", "/index.html")) === "/api/")
    	assert((pattern replaceAllIn("/api/authenticate", "/index.html")) == "/api/authenticate")
    	assert((pattern replaceAllIn("/my", "/index.html")) === "/index.html")
    	assert((pattern replaceAllIn("/something/api/", "/index.html")) === "/index.html")
    	assert((pattern replaceAllIn("/api", "/index.html")) === "/index.html")
    	assert((pattern replaceAllIn("/static/", "/index.html")) === "/static/")
    }
  }
  describe("UUID in Scala/Java"){
    it("should produce the same from toString as long hex conversion"){
      val uuid: UUID = java.util.UUID.randomUUID()
      assert(uuid.toString().replace("-", "") ===  
        new java.lang.StringBuilder()
            .append(java.lang.Long.toHexString(uuid.getMostSignificantBits()))
            .append(java.lang.Long.toHexString(uuid.getLeastSignificantBits())).toString())
    }
  }
}