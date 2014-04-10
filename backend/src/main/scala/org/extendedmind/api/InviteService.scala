package org.extendedmind.api

import scala.concurrent.Future
import org.extendedmind._
import org.extendedmind.Response._
import org.extendedmind.bl._
import org.extendedmind.security._
import org.extendedmind.security.Authentication._
import org.extendedmind.security.Authorization._
import org.extendedmind.domain._
import org.extendedmind.domain.Owner._
import org.extendedmind.db._
import scaldi._
import spray.http._
import StatusCodes._
import spray.httpx.SprayJsonSupport._
import spray.json._
import spray.routing._
import AuthenticationFailedRejection._
import java.util.UUID
import spray.can.Http
import spray.util._
import scala.concurrent.duration._
import MediaTypes._

trait InviteService extends ServiceBase {

  import JsonImplicits._
  
  def inviteRoutes = {
      postInviteRequest { url =>
        authorize(settings.signUpMethod != SIGNUP_OFF) {
          entity(as[InviteRequest]) { inviteRequest =>
            complete {
              Future[InviteRequestResult] {
                inviteActions.requestInvite(inviteRequest) match {
                  case Right(inviteRequestResult) => processResult(inviteRequestResult)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      postInviteRequestBypass { inviteRequestUUID =>
        authorize(settings.signUpMethod == SIGNUP_INVITE_COUPON || settings.signUpMethod == SIGNUP_INVITE_AUTOMATIC) {
          entity(as[InviteBypass]) { bypass =>
            complete {
              Future[InviteResult] {
                inviteActions.bypassInvite(inviteRequestUUID, bypass.inviteCoupon) match {                  
                  case Right(invite) => processResult(
                		  					InviteResult(
                		  					    invite._2.email,
                		  					    invite._2.code.toHexString,
                		  					    invite._2.accepted,
                		  					    invite._2.message,
                		  					    invite._2.emailId))
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      } ~
      getInviteRequestQueueNumber { inviteRequestUUID =>
        complete {
          Future[InviteRequestQueueNumber] {
            inviteActions.getInviteRequestQueueNumber(inviteRequestUUID) match {
              case Right(queueNumber) => processResult(queueNumber)
              case Left(e) => processErrors(e)
            }
          }
        }
      } ~
      getInvite { code =>
        parameters("email") { email =>
          complete {
            Future[InviteResult] {
              inviteActions.getInvite(code, email) match {
                case Right(invite) => processResult(InviteResult(
                		  					    invite.email,
                		  					    invite.code.toHexString,
                		  					    invite.accepted,
                		  					    invite.message,
                		  					    invite.emailId))
                case Left(e) => processErrors(e)
              }
            }
          }
        }
      } ~
      postInviteAccept { code =>
        authorize(settings.signUpMethod != SIGNUP_OFF) {
          entity(as[SignUp]) { signUp =>
            complete {
              Future[SetResult] {
                inviteActions.acceptInvite(code, signUp) match {
                  case Right(sr) => processResult(sr)
                  case Left(e) => processErrors(e)
                }
              }
            }
          }
        }
      }
  }

  
}
