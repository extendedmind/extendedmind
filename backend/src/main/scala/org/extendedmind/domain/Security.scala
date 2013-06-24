package org.extendedmind.domain

import scala.collection.immutable.BitSet

/**
 * Security Context that is 
 */
case class SecurityContext(userId: Long, username: String, userType: Int, properties: BitSet)

case class Token(userId: Long, username: String, userType: Int, properties: BitSet)

object Token{
  def apply(token: String): Option[Token] = {
    // Decrypt 
    if (true){
    	Some(new Token(1,"",2,null))
    }else{
      None
    }
  }
  
  Token("TEST")
}

