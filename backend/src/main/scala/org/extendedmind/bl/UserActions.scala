package org.extendedmind.bl

import org.extendedmind.domain._
import org.extendedmind.db._
import org.extendedmind._
import org.extendedmind.email._
import org.extendedmind.security._
import org.extendedmind.Response._
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.db.EmbeddedGraphDatabase
import spray.util.LoggingContext
import scala.util.{Success, Failure}
import scala.concurrent.ExecutionContext
import akka.actor.ActorRefFactory
import akka.actor.ActorSystem

trait UserActions {

  def db: GraphDatabase
  def mailgun: MailgunClient
  
  def actorRefFactory: ActorRefFactory
  implicit val implicitActorRefFactory = actorRefFactory
  implicit val implicitExecutionContext = actorRefFactory.dispatcher 
  
  def requestInvite(inviteRequest: InviteRequest)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("requestInvite: email {}", inviteRequest.email)
    val setResult = for {
      isUnique <- db.validateEmailUniqueness(inviteRequest.email).right
      setResult <- db.putNewInviteRequest(inviteRequest).right
    } yield setResult
    
    val futureMailResponse = mailgun.sendRequestInviteConfirmation(inviteRequest.email)
    futureMailResponse onSuccess {
      case SendEmailResponse(message, id) => {
        val saveResponse = db.putExistingInviteRequest(setResult.right.get.uuid.get, inviteRequest.copy(emailId = Some(id)))
        if (saveResponse.isLeft) 
          log.error("Error updating invite request for email {} with id {}, error: {}", 
              inviteRequest.email, id, saveResponse.left.get.head)
        else log.info("Saved email: {} with id: {}", inviteRequest.email, id)
      }case _ =>
        log.error("Could not send email to {}", inviteRequest.email)
    }
    return setResult
  }
  
  def getInviteRequests() (implicit log: LoggingContext): Response[List[InviteRequest]] = {
    log.info("getInviteRequests")
    for {
      inviteRequests <- db.getInviteRequests().right
    } yield inviteRequests
  }
}

class UserActionsImpl(implicit val settings: Settings, implicit val inj: Injector, implicit val implActorRefFactory: ActorRefFactory)
  extends UserActions with Injectable {
  override def db = inject[GraphDatabase]
  override def mailgun = inject[MailgunClient]
  override def actorRefFactory = implActorRefFactory
}
