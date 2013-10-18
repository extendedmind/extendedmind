package org.extendedmind.security

object Random {
  def generateRandomLong(): Long = {
    val random = new scala.util.Random(new java.security.SecureRandom())
    random.nextLong
  }
  
  def generateRandomUnsignedLong(): Long = {
    val random = new scala.util.Random(new java.security.SecureRandom())
    val randomLong = random.nextLong

    // To counter javaDoc comment: 
    //    "Note that if the argument is equal 
    //     to the value of Long.MIN_VALUE, the most negative representable 
    //     long value, the result is that same value, which is negative."
    // Introduces slightest bit of favoring towards 0 but it is so small
    // that in practice doesn't matter
    if (randomLong == java.lang.Long.MIN_VALUE) return 0
    else Math.abs(randomLong)
  }
}