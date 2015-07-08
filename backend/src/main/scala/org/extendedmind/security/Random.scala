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