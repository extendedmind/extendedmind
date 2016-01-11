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

import scala.collection.immutable.BitSet
import scala.util.Either
import java.util.UUID
import java.nio.ByteBuffer
import org.extendedmind._
import org.extendedmind.Response._
import org.extendedmind.Settings
import org.extendedmind.security.defaults._

case class Token(userUUID: UUID, accessKey: Long)

object Token{

  val ADMIN: Byte = 0
  val ALFA: Byte = 1
  val BETA: Byte = 2
  val NORMAL: Byte = 3

  def apply(userUUID: UUID) = new Token(userUUID, Random.generateRandomLong)

  def encryptToken(token: Token)(implicit settings: Settings): String = {
    this.synchronized {
      val bb = ByteBuffer.allocate(26)
      bb.putLong(token.userUUID.getMostSignificantBits())
      bb.putLong(token.userUUID.getLeastSignificantBits())
      bb.putLong(token.accessKey)

      // Add CRC to token
      val crc = new CRC16_MMC();
      crc.upd(bb.array().slice(0, 24))
      crc.end
      bb.put(crc.getBytes)

      // Encrypt token using AES with secret
      new String(encodeBase64(AES.encrypt(bb.array(), settings.tokenSecret)))
    }
  }

  def decryptToken(stringToken: String)(implicit settings: Settings): Response[Token] =
    try {
      if (stringToken.length() != 44){
      	return fail(INVALID_PARAMETER, ERR_BASE_INVALID_TOKEN_LENGTH, "Invalid string token length, should be 44")
      }

      // Decrypt Token
      val decryptedToken: Array[Byte] = AES.decrypt(decodeBase64(stringToken), settings.tokenSecret)

      // Check CRC
      val crc = new CRC16_MMC();
      crc.upd(decryptedToken.slice(0, 24))
      crc.end

      if (crc.getBytes.deep != decryptedToken.slice(24, 26).deep){
        return fail(INVALID_PARAMETER, ERR_BASE_INVALID_CRC, "Token CRC Check failed")
      }

      // Create Token
      val userUUID = UUIDUtils.getUUID(decryptedToken.slice(0, 16))
      Right(Token(userUUID, UUIDUtils.convertByteArrayToLong(decryptedToken.slice(16, 24))))
    } catch {
      case e: Throwable => fail(INTERNAL_SERVER_ERROR, ERR_BASE_DECRYPT_FAILED, "Could not decrypt token", e)
    }

}
