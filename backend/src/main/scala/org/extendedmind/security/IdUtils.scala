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

import org.apache.commons.codec.binary.Base64
import java.util.UUID
import java.nio.ByteBuffer

object IdUtils {
  def getUUID(trimmedBase64UUID: String): UUID = {
    getUUID(Base64.decodeBase64(trimmedBase64UUID + "=="))
  }
  def getUUID(bytes: Array[Byte]): UUID = {
    val mostSignificantBits = convertByteArrayToLong(bytes.slice(0, 8))
    val leastSignificantBits = convertByteArrayToLong(bytes.slice(8, 16))
    new UUID(mostSignificantBits, leastSignificantBits)
  }

  def getTrimmedBase64UUID(uuid: UUID): String = {
    this.synchronized {
      val bb = ByteBuffer.allocate(16)
      bb.putLong(uuid.getMostSignificantBits())
      bb.putLong(uuid.getLeastSignificantBits())
      Base64.encodeBase64String(bb.array()).slice(0, 22)
    }
  }
  def getTrimmedBase64UUIDForLucene(uuid: UUID): String = {
    // In Lucene the + character in Base64 is reserved, so changing it to @ is needed
    getTrimmedBase64UUID(uuid).replace('+', '@')
  }

  def convertByteArrayToLong(byteArray: Array[Byte]): Long = {
    this.synchronized {
      ByteBuffer.wrap(byteArray).getLong()
    }
  }

  def getShortIdAsString(shortId: Long): String = {
    val firstPart: Long = shortId/10
    val secondPart: Long = shortId%10
    val postfix: String =
      if (firstPart < 1) ""
      else Base58(firstPart)
    secondPart.toString + postfix
  }

  def getShortIdAsLong(shortId: String): Long = {
    val secondPart: Long = shortId.substring(0, 1).toLong
    val firstPart: Long =
      if (shortId.length > 1) Base58(shortId.substring(1))
      else 0
    firstPart*10 + secondPart
  }

}
