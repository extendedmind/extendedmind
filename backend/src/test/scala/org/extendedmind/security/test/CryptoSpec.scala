package org.extendedmind.security.test

import org.extendedmind.test.SpecBase

import org.extendedmind.security.defaults._
import org.extendedmind.security.AES

class CryptoSpec extends SpecBase{

  describe("Crypto class"){
    it("should encode and decode Base64 string"){
      val testString = "Crypto Test String"
      val testSecret = "0123456789012345"
      val encryptedString = new String(encodeBase64(AES.encrypt(testString, testSecret)))
      val decryptedString = new String(AES.decrypt(decodeBase64(encryptedString), testSecret))
      assert(testString == decryptedString)

      val testString2 = "Crypto Test String 2"
      val testSecret2 = "9876543210987654"
      val encryptedString2 = new String(encodeBase64(AES.encrypt(testString2, testSecret2)))
      assert(encryptedString2 != encryptedString)
      val decryptedString2 = new String(AES.decrypt(decodeBase64(encryptedString2), testSecret2))
      assert(testString2 == decryptedString2)
    }
  }
}