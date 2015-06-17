/**
 * Copyright (c) 2013-2015 Extended Mind Technologies Oy
 *
 * This file is part of Extended Mind.
 *
 * Extended Mind is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

package org.extendedmind.security.test

import org.extendedmind.test.SpraySpecBase
import org.extendedmind.security.defaults._
import org.extendedmind.security.AES
import java.util.UUID
import org.extendedmind.security.Token
import org.extendedmind._
import org.extendedmind.Response._

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
      val decryptedToken = Token.decryptToken("ejsoP4lbqEwn2J+gabrKMeWBwQOxYR4QyujwFBNhOR4=")
      decryptedToken match{
        case Right(token) => fail("Should have failed with CRC check")
        case Left(e) => assert(e(0) === ResponseContent(INVALID_PARAMETER, ERR_BASE_INVALID_CRC, "Token CRC Check failed"))
      }
    }
    it("should fail to decode too short token"){
      val decryptedToken = Token.decryptToken("MjsoP4lbqEwn2J+gabrKMeWBwQOxYR4QyujwFBNhOR4")
      decryptedToken match{
        case Right(token) => fail("Should have failed with invalid lenght token")
        case Left(e) => assert(e(0) === ResponseContent(INVALID_PARAMETER, ERR_BASE_INVALID_TOKEN_LENGTH, "Invalid string token length, should be 44"))
      }
    }
  }
}