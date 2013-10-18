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
  val NORMAL: Byte = 1
  
  def apply(userUUID: UUID) = new Token(userUUID, Random.generateRandomLong)
  
  def encryptToken(token: Token)(implicit settings: Settings): String = {
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
  
  def decryptToken(stringToken: String)(implicit settings: Settings): Response[Token] =
    try {
      if (stringToken.length() != 44){
      	return fail(INVALID_PARAMETER, "Invalid string token length, should be 44")
      }
      
      // Decrypt Token
      val decryptedToken: Array[Byte] = AES.decrypt(decodeBase64(stringToken), settings.tokenSecret)

      // Check CRC
      val crc = new CRC16_MMC();
      crc.upd(decryptedToken.slice(0, 24))
      crc.end
      
      if (crc.getBytes.deep != decryptedToken.slice(24, 26).deep){
        return fail(INVALID_PARAMETER, "Token CRC Check failed")
      }
      
      // Create Token
      val userUUID = UUIDUtils.getUUID(decryptedToken.slice(0, 16))
      Right(Token(userUUID, ByteBuffer.wrap(decryptedToken.slice(16, 24)).getLong()))
    } catch {
      case e: Throwable => fail(INTERNAL_SERVER_ERROR, "Could not decrypt token", e)
    }
}
