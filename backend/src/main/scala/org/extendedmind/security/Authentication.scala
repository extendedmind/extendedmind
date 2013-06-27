package org.extendedmind.security

import scala.concurrent.Promise

import org.extendedmind.db.GraphDatabase

import spray.routing.authentication.UserPass
import spray.routing.authentication.UserPassAuthenticator
import spray.routing.authentication.UserPassAuthenticator

class ExtendedMindUserPassAuthenticator(db: GraphDatabase)
			extends UserPassAuthenticator[SecurityContext]{
	 
  def apply(userPass: Option[UserPass])= Promise.successful(
    userPass match {
      case Some(UserPass(user, pass)) => {
        if (user == "token"){
          db.authenticate(pass)
        }else{
          db.authenticate(user, pass)
        }
      }
      case None => None
    }).future
}