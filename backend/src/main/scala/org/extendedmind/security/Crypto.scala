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

/**
 * Originally from https://gist.github.com/mumoshu/1587327
 */

import annotation.implicitNotFound
import java.io.{ DataOutputStream, ByteArrayOutputStream }
import javax.crypto.Cipher
import javax.crypto.spec.SecretKeySpec
import annotation.implicitNotFound
import java.io.{ DataOutputStream, ByteArrayOutputStream }
import javax.crypto.spec.SecretKeySpec
import javax.crypto.Cipher
import org.apache.commons.codec.binary.Base64
import org.apache.commons.codec.binary.Hex

@implicitNotFound(msg = "Could not find a Writes for ${T}")
trait Writes[T] {
  def writes(value: T): Array[Byte]
}

class DataOutputStreamWrites[T](writeValue: (DataOutputStream, T) => Unit) extends Writes[T] {
  def writes(value: T): Array[Byte] = {
    val bos = new ByteArrayOutputStream
    val dos = new DataOutputStream(bos)
    writeValue(dos, value)
    dos.flush()
    val byteArray = bos.toByteArray
    bos.close()
    byteArray
  }
}

trait Encryption {
  def encrypt(dataBytes: Array[Byte], secret: String): Array[Byte]
  def decrypt(codeBytes: Array[Byte], secret: String): Array[Byte]
  def encrypt[T: Writes](data: T, secret: String): Array[Byte] = encrypt(implicitly[Writes[T]].writes(data), secret)
}

class JavaCryptoEncryption(algorithmName: String) extends Encryption {

  def encrypt(bytes: Array[Byte], secret: String): Array[Byte] = {
    val secretKey = new SecretKeySpec(Hex.decodeHex(secret.toCharArray()), algorithmName)
    val encipher = Cipher.getInstance(algorithmName + "/ECB/PKCS5Padding")
    encipher.init(Cipher.ENCRYPT_MODE, secretKey)
    encipher.doFinal(bytes)
  }

  def decrypt(bytes: Array[Byte], secret: String): Array[Byte] = {
    val secretKey = new SecretKeySpec(Hex.decodeHex(secret.toCharArray()), algorithmName)
    val encipher = Cipher.getInstance(algorithmName + "/ECB/PKCS5Padding")
    encipher.init(Cipher.DECRYPT_MODE, secretKey)
    encipher.doFinal(bytes)
  }
}

object defaults {
  implicit object WritesString extends Writes[String] {
    def writes(value: String) = value.getBytes("UTF-8")
  }
  implicit object WritesLong extends DataOutputStreamWrites[Long](_.writeLong(_))
  implicit object WritesInt extends DataOutputStreamWrites[Int](_.writeInt(_))
  implicit object WritesShort extends DataOutputStreamWrites[Short](_.writeShort(_))
  
  def encodeBase64(bytes: Array[Byte]) = Base64.encodeBase64String(bytes)
  def decodeBase64(base64String: String) = Base64.decodeBase64(base64String)
}

object DES extends JavaCryptoEncryption("DES")
object AES extends JavaCryptoEncryption("AES")
