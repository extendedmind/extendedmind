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

import org.scalatest.concurrent.Eventually._
import org.scalatest.time.Span
import org.scalatest.time.Seconds
import org.openqa.selenium.By

class ITLoginSpec extends E2ESpecBase {
  describe("Extended Mind Website") {
    it("should return error on invalid email") {
      go to "http://localhost:8080/login"
      click on id("input-email")
      pressKeys("timo@extendedmind.org")
      click on ("input-password")
      pressKeys("timopwd")
      click on id("login-button")
      eventually { currentUrl should include("/login") }
    }

    it("should return error on invalid password") {
      go to "http://localhost:8080/login"
      click on id("input-email")
      pressKeys("timo@ext.md")
      click on ("input-password")
      pressKeys("wrong")
      click on id("login-button")
      eventually { currentUrl should include("/login") }
    }

    it("should return front page on successful login") {
      go to "http://localhost:8080/login"
      click on id("input-email")
      pressKeys("timo@ext.md")
      click on ("input-password")
      pressKeys("timopwd")
      click on id("login-button")
      eventually(timeout(Span(5, Seconds))) { currentUrl should include("/my") }
    }
  }
}