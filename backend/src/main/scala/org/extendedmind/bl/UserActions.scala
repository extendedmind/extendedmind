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

trait UserActions {

  def db: GraphDatabase
  def mailgun: MailgunClient
  
  def requestInvite(inviteRequest: InviteRequest)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("requestInvite: email {}", inviteRequest.email)
    for {
      isUnique <- db.validateEmailUniqueness(inviteRequest.email).right
      emailId <- mailgun.sendRequestInviteConfirmation(inviteRequest.email).right
      result <- db.saveInviteRequest(inviteRequest.copy(emailId = Some(emailId))).right
    } yield result
  }
  
  def getInviteRequests() (implicit log: LoggingContext): Response[List[InviteRequest]] = {
    log.info("getInviteRequests")
    for {
      inviteRequests <- db.getInviteRequests().right
    } yield inviteRequests
  }
}

class UserActionsImpl(implicit val settings: Settings, implicit val inj: Injector)
  extends UserActions with Injectable {
  override def db = inject[GraphDatabase]
  override def mailgun = inject[MailgunClient]
}
