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

package org.extendedmind.security.test

import org.extendedmind.test.SpecBase
import org.extendedmind.security.IdUtils
import java.util.UUID
import java.nio.ByteBuffer
import org.apache.commons.codec.binary.Base64
import org.extendedmind.security.Random

class UUIDUtilsSpec extends SpecBase{

  describe("IdUtilsSpec class"){
    it("should generate a valid trimmed UUID"){
      val testUUIDString = "7b13cdfe-eabf-4124-85fe-e706de4c8314"
      val testUUID = UUID.fromString(testUUIDString)
      val trimmedBase64UUID = IdUtils.getTrimmedBase64UUID(testUUID)
      val bb = ByteBuffer.allocate(16);
      bb.putLong(testUUID.getMostSignificantBits());
      bb.putLong(testUUID.getLeastSignificantBits());
      trimmedBase64UUID should be(Base64.encodeBase64String(bb.array()).substring(0, 22))

      // convert back
      val reConvertedUuid = IdUtils.getUUID(trimmedBase64UUID)
      reConvertedUuid.toString() should be(testUUIDString)

      // Try another UUID
      val testUUID2String = "a353b303-384d-4c79-8e90-0257cfb07a0c"
      val testUUID2 = UUID.fromString(testUUID2String)
      val trimmedBase64UUID2 = IdUtils.getTrimmedBase64UUID(testUUID2)
      val reConvertedUuid2 = IdUtils.getUUID(trimmedBase64UUID2)
      reConvertedUuid2.toString() should be(testUUID2String)
    }
    it("should generate a valid short id"){
      val TEST_COUNT = 1000
      val testArrayOfLongs:Array[Long] = Array.tabulate(TEST_COUNT)(n=>n)
      val testArrayOfShortIds:Array[String] = Array.tabulate(TEST_COUNT)(n=>IdUtils.getShortIdAsString(n))

      for (i <- 0 until TEST_COUNT-1){
        val shortIdValue = IdUtils.getShortIdAsLong(testArrayOfShortIds(i))
        shortIdValue should be(testArrayOfLongs(i))
      }
      for (i <- 0 until TEST_COUNT){
        val randomLong = Random.generateRandomUnsignedLong()
        val shortIdString = IdUtils.getShortIdAsString(randomLong)
        if (i == 0)
          println("Generated a short id value: " + shortIdString + " for random long " + randomLong)
        val shortIdValue = IdUtils.getShortIdAsLong(shortIdString)
        shortIdValue should be(randomLong)
      }
    }
  }
}