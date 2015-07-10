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

import org.extendedmind.test.SpraySpecBase
import org.extendedmind.security.defaults._
import org.extendedmind.security.AES
import java.util.UUID
import org.extendedmind.security.Random
import org.extendedmind._
import org.extendedmind.Response._

class RandomSpec extends SpraySpecBase{

  def configurations = EmptyTestConfiguration

  describe("Random class"){
    it("should generate a random HEX string of specific length"){
      val randomString1 = Random.generateRandomUniqueString()
      randomString1.length should be(40)
      val randomString2 = Random.generateRandomUniqueString()
      randomString2.length should be(40)
      randomString1 should not be(randomString2)
    }
  }
}