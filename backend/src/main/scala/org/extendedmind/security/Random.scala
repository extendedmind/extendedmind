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

package org.extendedmind.security

import scala.collection.mutable.ArrayBuffer
import java.nio.ByteBuffer
import org.apache.commons.codec.binary.Base32

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

  def generateRandomUniqueString(characterLimit: Int = 32): String = {
    // Need to use synchronized block because ByteBuffer isn't thread safe.
    // Not optimal and this method should not be used too frequently.
    this.synchronized {
      val uuid = java.util.UUID.randomUUID()
      val random = generateRandomLong()
      val inputBuffer = ByteBuffer.allocate(24)
                          .putLong(uuid.getLeastSignificantBits)
                          .putLong(uuid.getMostSignificantBits)
                          .putLong(random)
      // Use SHA1 to create a simple Base32 string value of the seed input
      val messageDigest = java.security.MessageDigest.getInstance("SHA1");
      val sha1Result = messageDigest.digest(inputBuffer.array());
      val base32: Base32 = new Base32()
      val uniqueString = new String(base32.encode(sha1Result)).toLowerCase
      return uniqueString.substring(0, Math.min(uniqueString.length(), characterLimit));
    }
  }

}