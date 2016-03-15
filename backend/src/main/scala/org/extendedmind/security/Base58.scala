/**
 * Copyright (c) 2013-2016 Extended Mind Technologies Oy
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

import java.util.Arrays

object Base58 {
  val alpha = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
  val base = alpha.length

  def apply(encodedInput: String) = decode(encodedInput)
  def apply(decodedInput: Long) = encode(decodedInput)

  def encode(input: String): String = encode(input.toLong)
  def encode(input: Long) = {
    def enc(in: Long, acc: String): String = if (in < 1) acc else enc(in / base, alpha((in % base).toInt) + acc)
    enc(input, "")
  }

  def decode: PartialFunction[String, Long] = {
    case s: String if s.length == 0 => 0
    case s: String if s.head != '1' => {
      val in = s.reverse

      def dec(idx: Int, acc: BigInt): Long = if (idx == in.length) acc.toLong else dec(idx + 1, acc + alpha.indexOf(in(idx)) * BigInt(base).pow(idx))
      dec(0, 0)
    }
  }
}