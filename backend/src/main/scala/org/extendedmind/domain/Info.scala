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

package org.extendedmind.domain

import java.util.UUID
import Validators._

// Backend version info not actually optional
case class Info(commonCollective: (UUID, String), version: String, build: String, created: Long, ui: Option[String], clients: Option[scala.List[VersionInfo]])

// List of platforms, value matches Node's process.platform for easier use
object PlatformType extends Enumeration {
  type PlatformType = Value
  val OSX = Value("darwin")
  val WINDOWS = Value("win32")
}
case class VersionInfo(platform: String, info: PlatformVersionInfo){
  require(
    try {
      val platformType = PlatformType.withName(platform)
      true
    }catch {
      case _:Throwable => false
    },
    "Expected 'darwin', 'win32' but got " + platform)
}

// Version info compatible with Squirrel
case class PlatformVersionInfo(
    // Squirrel values
    url: Option[String],
    name: Option[String],
    notes: Option[String],
    pub_date: Option[String],
    version: String,
    // Non-Squirrel fields. Squirrel "url" field above uses updateUrl as a source,
    userType: Option[Byte],
    updateUrl: Option[String],
    fullUrl: Option[String]){
  require(validateLength(version, 128), "version can not be more than 128 characters long")
  if (name.isDefined) require(validateLength(name.get, 128), "name can not be more than 128 characters long")
  if (notes.isDefined) require(validateLength(name.get, 1024), "notes can not be more than 1024 characters long")
  if (userType.isDefined) require(userType.get >= 0 && userType.get < 4, "userType must be a either 0 (admin), 1 (alfa), 2 (beta) or 3 (normal, default)")
  if (updateUrl.isDefined) require(validateLength(updateUrl.get, 2000), "updateUrl can not be more than 2000 characters long")
  else if (fullUrl.isDefined) require(false, "if fullUrl is given, updateUrl must be too")
  if (fullUrl.isDefined) require(validateLength(fullUrl.get, 2000), "fullUrl can not be more than 2000 characters long")
  else if (updateUrl.isDefined) require(false, "if updateUrl is given, fullUrl must be too")
}