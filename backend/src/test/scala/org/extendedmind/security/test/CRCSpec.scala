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

package org.extendedmind.security.test

import org.extendedmind.test.SpecBase
import org.extendedmind.security.CRC16_MMC

class CRCSpec extends SpecBase{

  describe("CRC class"){
    it("should generate valid CRC"){
      var crc = new CRC16_MMC();

      val testString = "CRC Test String"      
      crc.upd(testString.getBytes("UTF-8"))
      crc.end
      var bytes = crc.getBytes       
      assert(bytes(0) == 3)
      assert(bytes(1) == -60) 
      assert(crc.get == 964);

      crc.reset

      val testString2 = "CRC Test String 2"
      crc.upd(testString2.getBytes("UTF-8"))
      crc.end
      assert(crc.get == 56428)
      
      crc = new CRC16_MMC();
      
      crc.upd(testString2.getBytes("UTF-8"))
      crc.end
      
      bytes = crc.getBytes      
      assert(bytes(0) == -36)
      assert(bytes(1) == 108) 
    }
  }
}