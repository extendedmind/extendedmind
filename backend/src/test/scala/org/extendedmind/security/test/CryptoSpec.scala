/**
 * Copyright (c) 2013-2014 Extended Mind Technologies Oy
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

import org.extendedmind.test.SpecBase

import org.extendedmind.security.defaults._
import org.extendedmind.security.AES

class CryptoSpec extends SpecBase{

  describe("Crypto class"){
    it("should encode and decode Base64 string"){
      val testString = "Crypto Test String"
      val testSecret = "01234567890123456789012345678901"
      val encryptedString = new String(encodeBase64(AES.encrypt(testString, testSecret)))
      val decryptedString = new String(AES.decrypt(decodeBase64(encryptedString), testSecret))
      assert(testString == decryptedString)

      val testString2 = "Crypto Test String 2"
      val testSecret2 = "11234567890123456789012345678901"
      val encryptedString2 = new String(encodeBase64(AES.encrypt(testString2, testSecret2)))
      assert(encryptedString2 != encryptedString)
      val decryptedString2 = new String(AES.decrypt(decodeBase64(encryptedString2), testSecret2))
      assert(testString2 == decryptedString2)
    }
  }
}