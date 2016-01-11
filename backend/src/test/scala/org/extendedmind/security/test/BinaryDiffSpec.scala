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
import org.extendedmind.security.BinaryDiff

class BinaryDiffSpec extends SpecBase{

  describe("BinaryDiff class"){
    it("should generate a valid difference between two byte arrays"){
      val bytes1: Array[Byte] = Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
      val bytes2: Array[Byte] = Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
      val bytes3: Array[Byte] = Array(4, 5, 6, 7, 8, 9, 10,
                                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)

      val diff1 = BinaryDiff.getDelta(bytes1, bytes2)
      val diff2 = BinaryDiff.getDelta(bytes2, bytes3)
      val patchedBytes2 = BinaryDiff.patch(bytes1, diff1)
      val patchedBytes3 = BinaryDiff.patch(patchedBytes2, diff2)
      patchedBytes3 should be(bytes3)
    }
  }
}