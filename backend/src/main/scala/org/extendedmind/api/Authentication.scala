package org.extendedmind.api

import spray.routing.authentication.BasicUserContext
import spray.routing.authentication.UserPass
import scala.concurrent.Promise
import scala.concurrent.Future
import org.extendedmind.db.GraphDatabase
import spray.routing.authentication._
import scala.concurrent.ExecutionContext
import spray.routing.RequestContext
import spray.routing.AuthenticationRequiredRejection
import akka.actor.ActorRef

object ExtendedMindUserPassAuthenticator {

/*  
  val companyUsers = List(CompanyUser("Bob", "TheBuilder", List(1, 2)), CompanyUser("Mary", "LittleLamb", List(2, 3)), CompanyUser("Nancy", "Pancy", List(4)))
  
	def apply(userPass: Option[UserPass]) = Promise.successful(
	  userPass match {
			case Some(UserPass(user, pass)) => {
				companyUsers.find(c => c.name == user).flatMap {
					case x => {
						if (x.password == pass) Some(createCompanyUser(UserPass(user, pass))) else None
					}
				}
			}
			case _ => None
			}).future

	def apply(userPass: Option[(String, String)]) = userPass.flatMap {
			case (user, pass) => {
				companyUsers.find(c => c.name == user).map { 
				  case x => if (x.password == pass) BasicUserContext(user) 
				}
			}
	}
	* 
	*/
}