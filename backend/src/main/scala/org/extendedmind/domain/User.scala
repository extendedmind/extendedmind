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
import org.extendedmind.security.Token
import org.extendedmind._

case class UserPreferences(onboarded: Option[String], ui: Option[String]){
  if (onboarded.isDefined) require(validateLength(onboarded.get, 10000), "Onboarded preferences max length is 10000")
  if (ui.isDefined) require(validateLength(ui.get, 10000), "UI preferences max length is 10000")
}

case class User(uuid: Option[UUID], created: Option[Long], modified: Option[Long], deleted: Option[Long],
                email: Option[String], emailVerified: Option[Long], cohort: Option[Int],
                preferences: Option[UserPreferences],
                sharedLists: Option[Map[UUID,(String, Map[UUID, (String, Byte)])]])
           extends Container{
  if (email.isDefined) require(validateEmailAddress(email.get), "Not a valid email address")
  if (cohort.isDefined) require(cohort.get > 0 && cohort.get <= 128, "Cohort needs to be a number between 1 and 128")
}

object User{
  def apply(email:String, cohort: Option[Int], preferences: Option[UserPreferences]) = new User(None, None, None, None, Some(email), None, cohort, preferences, None)
}

case class SignUp(email: String, password: String, cohort: Option[Int], bypass: Option[Boolean]){
  require(validateEmailAddress(email), "Not a valid email address")
  require(validatePassword(password), "Password needs to be 7 or more characters long")
  if (cohort.isDefined) require(cohort.get > 0 && cohort.get <= 128, "Cohort needs to be a number between 1 and 128")
}

case class UserEmail(email: String){
  require(validateEmailAddress(email), "Not a valid email address")
}

// List of subscription types
object SubscriptionType extends Enumeration {
  type SubscriptionType = Value
  val MONTHLY_SUBSCRIPTION = Value("monthly")
  val YEARLY_SUBSCRIPTION = Value("yearly")
}

// List of payment methods
object PaymentMethod extends Enumeration {
  type PaymentMethod = Value
  val GOOGLE_PLAY_STORE = Value("google")
  val APPLE_APP_STORE = Value("apple")
  val PAYPAL = Value("paypal")
}

case class Subscription(uuid: Option[UUID], created: Option[Long], modified: Option[Long],
                        subscriptionType: String, paymentMethod: String,
                        start: Long, end: Long, rejected: Option[Long], data: Option[String]){
  require(
      try {
        val rt = SubscriptionType.withName(subscriptionType)
        true
      }catch {
        case _:Throwable => false
      }, 
      "Expected 'monthly' or 'yearly' but got " + subscriptionType)  
  require(
      try {
        val rt = PaymentMethod.withName(paymentMethod)
        true
      }catch {
        case _:Throwable => false
      }, 
      "Expected 'google', 'apple' or 'paypal' but got " + paymentMethod)  
  if (data.isDefined) require(validateLength(data.get, 1000), "Subscription data max length is 1000")
}

case class UserAccessRight(access: Option[Byte]){
  if (access.isDefined) require(access == Some(1) || access == Some(2), "Not a valid access right, permitted values: 1 = read, 2 = read/write")
}

case class PublicUser(uuid: UUID)

case class Owner(userUUID: UUID, foreignOwnerUUID: Option[UUID], sharedLists: Option[Map[UUID, (String, Byte)]], hasPremium: Boolean)

object Owner{
  def getOwner(ownerUUID: UUID, securityContext: SecurityContext)(implicit settings: Settings): Owner = {
    val hasPremium = securityContext.userType == Token.ADMIN || securityContext.userType == Token.ALFA ||
                     (settings.signUpMode == MODE_NORMAL && securityContext.subscription.isDefined
                      && securityContext.subscription.get == "premium")
                     
    if (securityContext.userUUID == ownerUUID){
      new Owner(ownerUUID, None, None, hasPremium) 
    }else if (securityContext.collectives.isDefined){
      new Owner(securityContext.userUUID, Some(ownerUUID), None, hasPremium)
    }else if (securityContext.sharedLists.isDefined){
      val sharedListAccess = securityContext.sharedLists.get(ownerUUID)
      new Owner(securityContext.userUUID, Some(ownerUUID), Some(sharedListAccess._2), hasPremium)
    }else{
      throw new InternalServerErrorException(ERR_BASE_OWNER_NOT_IN_SECURITY_CONTEXT,
          "Security context with foreign owner UUID which can not be found in securityContext collectives nor shared lists")
    }
  }
  
  def apply(ownerUUID: UUID, collectiveUUID: Option[UUID]) 
        = new Owner(ownerUUID, collectiveUUID, None, false)
}

case class ForgotPasswordResult(resetCodeExpires: Long)

/* Agreement objects */

case class AgreementUser(uuid: Option[UUID], email: Option[String]){
  if(email.isDefined) require(validateEmailAddress(email.get), "Not a valid email address")
}

case class AgreementTarget(uuid: UUID, title: Option[String]){
  if(title.isDefined) require(validateTitle(title.get), "Title can not be more than " + TITLE_MAX_LENGTH + " characters")
}

// List of Reminder types
object AgreementType extends Enumeration {
  type AgreementType = Value
  val LIST_AGREEMENT = Value("list")
}

case class Agreement(uuid: Option[UUID], created: Option[Long], modified: Option[Long],
                     agreementType: String, access: Byte, accepted: Option[Long], targetItem: AgreementTarget,
                     proposedBy: Option[AgreementUser], proposedTo: AgreementUser){
  require(
      try {
        val rt = AgreementType.withName(agreementType)
        true
      }catch {
        case _:Throwable => false
      }, 
      "Expected 'list' but got " + agreementType)

  require(access == 1 || access == 2, "Access needs to be either 1 for read or 2 for write")
}

object Agreement{
  import org.extendedmind.domain.AgreementType._  
  def apply(agreementType: AgreementType, access: Byte, targetItem: AgreementTarget,
            proposedBy: AgreementUser, proposedTo: AgreementUser) 
        = new Agreement(None, None, None, agreementType.toString, access, None, targetItem, Some(proposedBy), proposedTo)
}
