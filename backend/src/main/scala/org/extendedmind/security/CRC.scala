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

import java.nio.ByteBuffer

/**
Original copyright 2011 edartuz@gmail.com
https://bitbucket.org/edartuz/muprog

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

/** Basic CRC class */
abstract class CRC {
    var curCRC: Int = initCRC
    var finalized: Boolean = false

    def bits: Int
    def bitsMask: Int
    def poly: Int
    def initCRC: Int

    def reset: CRC = {
        curCRC = initCRC
        finalized = false
        this
    }

    def set( newCRC: Int ): CRC = {
        curCRC = newCRC
        finalized = false
        this
    }

    def get: Int = curCRC

    def getHex: String = {
        val tableHex: Array[Char] = Array( '0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f' )
        var hexCRC: String = ""
        var tempCRC: Int = curCRC

        for (digitCnt <- 0 to (((bits - 1) >> 2))) {
            hexCRC = tableHex( tempCRC & 0xf ) + hexCRC
            tempCRC >>>= 4
        }
        hexCRC
    }

    /// update CRC with single byte
    def upd( newValue: Byte ): CRC

    /// update CRC with multiple bytes
    def upd( newValues: Iterable[Byte] ): CRC = {
        for (newValue <- newValues) upd( newValue )
        this
    }

    /// update CRC with multiple bytes
    def upd( newValues: Seq[Byte], start:Int, end:Int ): CRC = {
        for (i <- start to end) upd( newValues(i) )
        this
    }

    /// finalize CRC calculation
    def end: CRC = {
        finalized = true
        this
    }

    def isFinalized: Boolean = finalized
}

class CRC16_MMC extends CRC {

    override def bits: Int = 16
    override def bitsMask: Int = 0xffff
    override def poly: Int = 0x1021
    override def initCRC: Int = 0x0

    override def upd( newValue: Byte ): CRC = {
        var newCRC: Int = curCRC
        var dataIn: Int = newValue & 0xFF
        var flagXOR: Int = 0
        for ( bitCnt <- 1 to 8 ) {
            flagXOR = (((newCRC >> 8) ^ dataIn) & 0x80)
            dataIn <<= 1
            newCRC <<= 1
            if (flagXOR != 0) newCRC ^= poly
        }
        curCRC = newCRC & bitsMask
        this
    }

    def getBytes(): Array[Byte] = {
      this.synchronized {
        val bb = ByteBuffer.allocate(4)
        bb.putInt(curCRC)
        bb.array().slice(2, 4)
      }
    }
}