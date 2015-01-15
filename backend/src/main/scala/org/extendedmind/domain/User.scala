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

package org.extendedmind.domain

import java.util.UUID
import Validators._
import org.extendedmind.security.SecurityContext

case class UserPreferences(onboarded: Option[String], ui: Option[String]){
  if (ui.isDefined) require(validateLength(ui.get, 2048), "UI preferences max length is 2048")
}

case class User(uuid: Option[UUID], created: Option[Long], modified: Option[Long], deleted: Option[Long],
                email: Option[String], emailVerified: Option[Long], cohort: Option[Int],
                preferences: Option[UserPreferences])
           extends Container{
  if (email.isDefined) require(validateEmailAddress(email.get), "Not a valid email address")
  if (cohort.isDefined) require(cohort.get > 0 && cohort.get <= 128, "Cohort needs to be a number between 1 and 128")
}

object User{
  def apply(email:String, cohort: Option[Int], preferences: Option[UserPreferences]) = new User(None, None, None, None, Some(email), None, cohort, preferences)
}

case class SignUp(email: String, password: String, cohort: Option[Int], bypass: Option[Boolean]){
  require(validateEmailAddress(email), "Not a valid email address")
  require(validatePassword(password), "Password needs to be 7 or more characters long")
  if (cohort.isDefined) require(cohort.get > 0 && cohort.get <= 128, "Cohort needs to be a number between 1 and 128")
}

case class UserEmail(email: String){
  require(validateEmailAddress(email), "Not a valid email address")
}

case class UserAccessRight(access: Option[Byte]){
  if (access.isDefined) require(access == Some(1) || access == Some(2), "Not a valid access right, permitted values: 1 = read, 2 = read/write")
}

case class PublicUser(uuid: UUID)

case class Owner(userUUID: UUID, collectiveUUID: Option[UUID])

object Owner{
  def getOwner(ownerUUID: UUID, securityContext: SecurityContext): Owner = {
    if (securityContext.userUUID == ownerUUID) new Owner(securityContext.userUUID, None) 
    else new Owner(securityContext.userUUID, Some(ownerUUID))
  }
}

case class ForgotPasswordResult(resetCodeExpires: Long)
