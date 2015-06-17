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

import org.extendedmind.test.SpecBase
import org.extendedmind.security.PasswordService
import org.extendedmind.security.Password

class PasswordSpec extends SpecBase {

  describe("Password class") {
    it("should encode and verify password") {
      val password = "Password1234"
      val salt = PasswordService.generateSalt
      val encryptedPassword = PasswordService.getEncryptedPassword(
          			password, salt, 
          			PasswordService.ALGORITHM, 
          			PasswordService.ITERATIONS)      
      assert(PasswordService.authenticate(password, encryptedPassword))
      assert(!PasswordService.authenticate("Password12345", encryptedPassword))
    }
  }
}