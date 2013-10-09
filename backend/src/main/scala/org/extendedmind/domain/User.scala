package org.extendedmind.domain

import java.util.UUID
import Validators._

case class User(uuid: Option[UUID], modified: Option[Long], deleted: Option[Long],  
                email: String)
           extends Container

                      
case class SignUp(email: String, password: String){
  require(validateEmailAddress(email), "Not a valid email address")
  require(validatePassword(password), "Password needs to be 7 or more characters long")
}
case class InviteRequest(email: String, emailId: Option[String]){
  require(validateEmailAddress(email), "Not a valid email address")
}

case class InviteRequestQueueNumber(queueNumber: Int)

case class UserAccessRight(userUUID: UUID, access: Byte){
  require(access == 1 || access == 2, "Not a valid access right, permitted values: 1 = read, 2 = read/write")
}

case class PublicUser(uuid: UUID)