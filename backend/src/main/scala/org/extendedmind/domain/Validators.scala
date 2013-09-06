package org.extendedmind.domain

object Validators {
  // Pattern from: http://www.mkyong.com/regular-expressions/how-to-validate-email-address-with-regular-expression/
  val emailPattern = ("^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@"
                    + "[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$").r
                    
  def validateEmailAddress(email: String): Boolean = {
    emailPattern.pattern.matcher(email).matches()
  }
}