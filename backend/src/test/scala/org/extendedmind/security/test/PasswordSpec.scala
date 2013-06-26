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