package org.extendedmind.security

import scala.concurrent.Promise
import org.extendedmind.db.GraphDatabase
import spray.routing.authentication.UserPass
import spray.routing.authentication.UserPassAuthenticator
import spray.routing.authentication.UserPassAuthenticator
import org.extendedmind.Settings
import scaldi.Injector
import scaldi.Injectable

trait ExtendedMindUserPassAuthenticator extends UserPassAuthenticator[SecurityContext]{
  
  def db: GraphDatabase
  
  def apply(userPass: Option[UserPass])= Promise.successful(
    userPass match {
      case Some(UserPass(user, pass)) => {
        println(user + pass)
        if (user == "token"){
          db.authenticate(pass)
        }else{
          db.authenticate(user, pass)
        }
      }
      case None => None
    }).future
}

class ExtendedMindUserPassAuthenticatorImpl (implicit val settings: Settings, implicit val inj: Injector)
		extends ExtendedMindUserPassAuthenticator with Injectable{
  override def db = inject[GraphDatabase]
}