package org.extendedmind.security.test

import org.extendedmind.test.SpraySpecBase
import org.extendedmind.security.defaults._
import org.extendedmind.security.AES
import java.util.UUID
import org.extendedmind.security.Token

class TokenSpec extends SpraySpecBase{
  
  def configurations = EmptyTestConfiguration 
  
  describe("Token class"){
    it("should encode and decode Tokens"){
      val testUUID = UUID.randomUUID()
      val testToken = Token(testUUID, 1L)
      val stringToken = Token.encryptToken(testToken)
      assert(stringToken.length() === 44)
      
      // Decrypt and verify
      val decryptedToken = Token.decryptToken(stringToken)
      decryptedToken match{
        case Right(token) => {
          assert(token.userUUID.getMostSignificantBits() === testToken.userUUID.getMostSignificantBits())
          assert(token.userUUID.getLeastSignificantBits() === testToken.userUUID.getLeastSignificantBits())
          assert(token.accessKey === testToken.accessKey)
        }
        case Left(e) => fail(e.toString)
      }
    }
    it("should fail to decode invalid token"){
      val decryptedToken = Token.decryptToken("s61FqPljIOpZ0PHVoC1nSG4te8uK6Z1bN3Xilk+pObM=")
      decryptedToken match{
        case Right(token) => fail("Should have failed with CRC check")
        case Left(e) => assert(e(0) === "Token CRC Check failed")
      }
    }
    it("should fail to decode too short token"){
      val decryptedToken = Token.decryptToken("r61FqPljIOpZ0PHVoC1nSG4te8uK6Z1bN3Xilk+pObM")
      decryptedToken match{
        case Right(token) => fail("Should have failed with invalid lenght token")
        case Left(e) => assert(e(0) === "Invalid string token length, should be 44")
      }
    }
  }
}