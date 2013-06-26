package org.extendedmind.security

import scala.collection.immutable.BitSet
import scala.util.Either
import java.util.UUID
import java.nio.ByteBuffer
import org.extendedmind.Settings
import org.extendedmind.security.defaults._

case class Token(userUUID: UUID, accessKey: Long)

object Token{
  def apply(userUUID: UUID) = new Token(userUUID, generateAccessKey)
  
  def generateAccessKey(): Long = {
    val random = new scala.util.Random(new java.security.SecureRandom())
    random.nextLong
  }
  
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
  
  def decryptToken(stringToken: String)(implicit settings: Settings): Either[List[String], Token] =
    try {
      if (stringToken.length() != 44){
      	return Left(List("Invalid string token length, should be 44"))
      }
      
      // Decrypt Token
      val decryptedToken: Array[Byte] = AES.decrypt(decodeBase64(stringToken), settings.tokenSecret)

      // Check CRC
      val crc = new CRC16_MMC();
      crc.upd(decryptedToken.slice(0, 24))
      crc.end
      
      if (crc.getBytes.deep != decryptedToken.slice(24, 26).deep){
        return Left(List("Token CRC Check failed"))
      }
      
      // Create Token
      val mostSignificantBits = ByteBuffer.wrap(decryptedToken.slice(0, 8)).getLong()
      val leastSignificantBits = ByteBuffer.wrap(decryptedToken.slice(8, 16)).getLong()
      val userUUID = new UUID(mostSignificantBits, leastSignificantBits)
      Right(Token(userUUID, ByteBuffer.wrap(decryptedToken.slice(16, 24)).getLong()))
    } catch {
      case e: Throwable => Left(List(e.toString))
    }
}




