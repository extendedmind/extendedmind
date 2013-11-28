package org.extendedmind.domain

import java.util.UUID
import Validators._
import org.extendedmind.security.SecurityContext

case class User(uuid: Option[UUID], modified: Option[Long], deleted: Option[Long],  
                email: String, emailVerified: Option[Long])
           extends Container{
  require(validateEmailAddress(email), "Not a valid email address")  
}

object User{
  def apply(email:String) = new User(None, None, None, email, None)
}
            
case class SignUp(email: String, password: String){
  require(validateEmailAddress(email), "Not a valid email address")
  require(validatePassword(password), "Password needs to be 7 or more characters long")
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