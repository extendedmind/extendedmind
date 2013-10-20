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
import java.util.UUID

trait UserActions {

  def db: GraphDatabase
  def mailgun: MailgunClient
  def settings: Settings

  def actorRefFactory: ActorRefFactory
  implicit val implicitActorRefFactory = actorRefFactory
  implicit val implicitExecutionContext = actorRefFactory.dispatcher 
    
  def requestInvite(inviteRequest: InviteRequest)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("requestInvite: email {}", inviteRequest.email)
    val setResult = for {
      isUnique <- db.validateEmailUniqueness(inviteRequest.email).right
      setResult <- db.putNewInviteRequest(inviteRequest).right
    } yield setResult
    
    if (setResult.isRight){
      val futureMailResponse = mailgun.sendRequestInviteConfirmation(inviteRequest.email, setResult.right.get.uuid.get)
      futureMailResponse onSuccess {
        case SendEmailResponse(message, id) => {
          val saveResponse = for{
            putExistingResponse <- db.putExistingInviteRequest(setResult.right.get.uuid.get, 
                                                               inviteRequest.copy(emailId = Some(id))).right
            updateResponse <- Right(db.updateInviteRequestModifiedIndex(putExistingResponse._2, 
                                                                        putExistingResponse._3)).right
          } yield putExistingResponse._1
          if (saveResponse.isLeft) 
            log.error("Error updating invite request for email {} with id {}, error: {}", 
                inviteRequest.email, id, saveResponse.left.get.head)
          else log.info("Saved invite request with email: {} and UUID: {} to emailId: {}", 
                          inviteRequest.email, setResult.right.get.uuid.get, id)
        }case _ =>
          log.error("Could not send email to {}", inviteRequest.email)
      }
    }
    setResult
  }

  def getInviteRequests() (implicit log: LoggingContext): Response[InviteRequests] = {
    log.info("getInviteRequests")
    db.getInviteRequests    
  }
  
  def getInvites() (implicit log: LoggingContext): Response[Invites] = {
    log.info("getInvites")
    db.getInvites
  }
  
  def getInviteRequestQueueNumber(inviteRequestUUID: UUID) (implicit log: LoggingContext): 
        Response[InviteRequestQueueNumber] = {
    log.info("getInviteRequestQueueNumber for UUID {}", inviteRequestUUID)
    db.getInviteRequestQueueNumber(inviteRequestUUID)
  }
  
  def getInvite(code: Long, email: String) (implicit log: LoggingContext): 
        Response[Invite] = {
    log.info("getInvite for code {}, email {}", code, email)
    db.getInvite(code, email)
  }
  
  def signUp(signUp: SignUp)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("signUp: email {}", signUp.email)
    if (settings.adminSignUp) 
      log.warning("CRITICAL: Making {} an administrator because extendedmind.security.adminSignUp is true", 
          signUp.email)
    for {
      isUnique <- db.validateEmailUniqueness(signUp.email).right
      result <- db.putNewUser(User(None, None, None, signUp.email), signUp.password, settings.signUp).right
    } yield result
    
    // TODO: Send verification email as Future
  }
  
  def acceptInviteRequest(userUUID: UUID, inviteRequestUUID: UUID, details: InviteRequestAcceptDetails)
                         (implicit log: LoggingContext): Response[(SetResult, Invite)] = {
    log.info("acceptInviteRequest: request {}", inviteRequestUUID)
    
    val acceptResult = db.acceptInviteRequest(userUUID, inviteRequestUUID, details.message)
    
    if (acceptResult.isRight){
      val invite = acceptResult.right.get._2
      val futureMailResponse = mailgun.sendInvite(invite)
      futureMailResponse onSuccess {
        case SendEmailResponse(message, id) => {
          val saveResponse = db.putExistingInvite(acceptResult.right.get._1.uuid.get, 
                                                        invite.copy(emailId = Some(id)))
          if (saveResponse.isLeft) 
            log.error("Error updating invite for email {} with id {}, error: {}", 
                invite.email, id, saveResponse.left.get.head)
          else log.info("Saved invite request with email: {} and UUID: {} to emailId: {}", 
                          invite.email, acceptResult.right.get._1.uuid.get, id)
        }case _ =>
          log.error("Could not send email to {}", invite.email)
      }
    }
    acceptResult
    
  }
  
  def acceptInvite(code: Long, signUp: SignUp) (implicit log: LoggingContext): 
        Response[SetResult] = {
    log.info("acceptInvite for code {}, email {}", code, signUp.email)
    db.acceptInvite(code, signUp)
  }
  
  def destroyInviteRequest(inviteRequstUUID: UUID)(implicit log: LoggingContext): Response[DestroyResult] = {
    log.info("destroyInviteRequest: request {}", inviteRequstUUID)
    db.destroyInviteRequest(inviteRequstUUID)
  }
  
  def getPublicUser(email: String)(implicit log: LoggingContext): Response[PublicUser] = {
    log.info("getPublicUser: email {}", email)
    val user = db.getUser(email)
    if (user.isLeft) Left(user.left.get)
    else Right(PublicUser(user.right.get.uuid.get))
  }
   
  def getUser(userUUID: UUID)(implicit log: LoggingContext): Response[User] = {
    log.info("getUser: user {}", userUUID)
    db.getUser(userUUID)
  }
  
  def putUser(userUUID: UUID, user: User)(implicit log: LoggingContext): Response[SetResult] = {
    log.info("putUser: user {}", userUUID)
    db.putExistingUser(userUUID, user) match {
      case Right(result) => {
        Right(result._1)
        // TODO
        // if (result._2)
        //   SEND EMAIL CONFIRMATION TO NEW ADDRESS! 
      }
      case Left(e) => Left(e)
    }
  }
}

class UserActionsImpl(implicit val implSettings: Settings, implicit val inj: Injector, 
                      implicit val implActorRefFactory: ActorRefFactory)
  extends UserActions with Injectable {
  override def settings  = implSettings
  override def db = inject[GraphDatabase]
  override def mailgun = inject[MailgunClient]
  override def actorRefFactory = implActorRefFactory
}
