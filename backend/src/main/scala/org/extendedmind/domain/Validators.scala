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

package org.extendedmind.domain

import java.time.format.DateTimeParseException
import java.time.format.DateTimeFormatter

object Validators {

  def TITLE_MAX_LENGTH = 128
  def DESCRIPTION_MAX_LENGTH = 1024

  // Pattern from: http://www.mkyong.com/regular-expressions/how-to-validate-email-address-with-regular-expression/
  // removed uppercase to make sure no duplicates exist
  val emailPattern = ("^[_a-z0-9-\\+]+(\\.[_a-z0-9-]+)*@"
                    + "[a-z0-9-]+(\\.[a-z0-9]+)*(\\.[a-z]{2,})$").r

  val dateFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd")
  val timeFormat = DateTimeFormatter.ofPattern("hh:mm")

  def validateEmailAddress(email: String): Boolean = {
    if (email.length() > 254) false
    else emailPattern.pattern.matcher(email).matches()
  }

  def validatePassword(password: String): Boolean = {
    if (password.length() < 7 || password.length() > 100) false
    else true
  }

  def validateTitle(value: String): Boolean = {
    validateLength(value, TITLE_MAX_LENGTH)
  }

  def validateDescription(value: String): Boolean = {
    validateLength(value, DESCRIPTION_MAX_LENGTH)
  }

  def validateLength(value: String, maxLength: Int): Boolean = {
    if (value.length() > maxLength) false
    else true
  }

  def validateDateString(dateString: String): Boolean = {
    try {
      dateFormat.parse(dateString);
    } catch {
      case e: DateTimeParseException => return false
    }
    return true
  }

  def validateTimeString(timeString: String): Boolean = {
    try {
      synchronized {
        timeFormat.parse(timeString);
      }
    } catch {
      case e: DateTimeParseException => return false
    }
    return true
  }
}