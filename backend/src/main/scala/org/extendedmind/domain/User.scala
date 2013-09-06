package org.extendedmind.domain

import java.util.UUID

case class User(uuid: Option[UUID], modified: Option[Long], deleted: Option[Long],  
                email: String)
           extends Container

case class SignUp(email: String, password: String)
case class InviteRequest(email: String, emailId: Option[String]){
  require(Validators.validateEmailAddress(email), "Not a valid email address")
}

