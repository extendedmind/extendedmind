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