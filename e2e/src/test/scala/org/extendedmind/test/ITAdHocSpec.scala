/**
 * Copyright (c) 2013-2014 Extended Mind Technologies Oy
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

package org.extendedmind.test

import org.scalatest.FunSpec
import java.util.UUID

import org.junit.runner.RunWith
import org.scalatest.junit.JUnitRunner

@RunWith(classOf[JUnitRunner])
class AdHocSpec extends FunSpec{
  describe("Regular expressions in Scala/Java"){
    it("should work with negative lookahead"){
    	val pattern = "^(?!(/api/|/static/)).+$".r
    	assert((pattern replaceAllIn("/api/", "/index.html")) === "/api/")
    	assert((pattern replaceAllIn("/api/authenticate", "/index.html")) == "/api/authenticate")
    	assert((pattern replaceAllIn("/my", "/index.html")) === "/index.html")
    	assert((pattern replaceAllIn("/something/api/", "/index.html")) === "/index.html")
    	assert((pattern replaceAllIn("/api", "/index.html")) === "/index.html")
    	assert((pattern replaceAllIn("/static/", "/index.html")) === "/static/")
    }
  }
}