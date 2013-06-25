package org.extendedmind.security
import spray.routing.authentication._
import scala.concurrent.Promise
import java.util.UUID

object ExtendedMindUserPassAuthenticator extends UserPassAuthenticator[SecurityContext]{

  // TODO: Get from database
  val testUsers = List(SecurityContext(UUID.fromString("759cfbcd-a05d-49e4-8362-6f114182eb64"), 
      								 "timo@ext.md",
      								 0,
      								 Map()))

  def apply(userPass: Option[UserPass]) = Promise.successful(
    userPass match {
      case Some(UserPass(user, pass)) => {
        testUsers.find(c => c.email == user).flatMap {
          case x => {
            Some(x)
          }
        }
      }
      case None => None
    }).future
}