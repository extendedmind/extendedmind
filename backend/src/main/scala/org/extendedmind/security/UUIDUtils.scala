package org.extendedmind.security

import org.apache.commons.codec.binary.Base64
import java.util.UUID
import java.nio.ByteBuffer

object UUIDUtils {
  def getUUID(trimmedBase64UUID: String): UUID = {
    getUUID(Base64.decodeBase64(trimmedBase64UUID + "=="))
  }
  def getUUID(bytes: Array[Byte]): UUID = {
    val mostSignificantBits = ByteBuffer.wrap(bytes.slice(0, 8)).getLong()
    val leastSignificantBits = ByteBuffer.wrap(bytes.slice(8, 16)).getLong()
    new UUID(mostSignificantBits, leastSignificantBits)
  }
  def getTrimmedBase64UUID(uuid: UUID): String = {
    val bb = ByteBuffer.allocate(16)
    bb.putLong(uuid.getMostSignificantBits())
    bb.putLong(uuid.getLeastSignificantBits())
    Base64.encodeBase64String(bb.array()).slice(0, 22)
  }
}

