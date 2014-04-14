package org.extendedmind.domain

import java.util.UUID
import Validators._
import org.extendedmind.security.SecurityContext

case class UserPreferences(onboarded: Option[String])

case class User(uuid: Option[UUID], modified: Option[Long], deleted: Option[Long], created: Option[Long],
                email: String, emailVerified: Option[Long], cohort: Option[Int],
                preferences: Option[UserPreferences])
           extends Container{
  require(validateEmailAddress(email), "Not a valid email address")
  if (cohort.isDefined) require(cohort.get > 0 && cohort.get <= 128, "Cohort needs to be a number between 1 and 128")
}

object User{
  def apply(email:String, cohort: Option[Int], preferences: Option[UserPreferences]) = new User(None, None, None, None, email, None, cohort, preferences)
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
