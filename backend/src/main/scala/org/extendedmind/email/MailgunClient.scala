package org.extendedmind.email

import scala.util.{Success, Failure}
import org.extendedmind.domain._
import org.extendedmind._
import org.extendedmind.Response._
import scaldi._
import akka.actor.ActorSystem
import akka.io.IO
import akka.pattern.ask
import spray.http._
import MediaTypes._
import spray.json._
import spray.httpx.SprayJsonSupport._
import spray.httpx.marshalling._
import spray.httpx.marshalling.Marshaller._
import spray.json.DefaultJsonProtocol._
import spray.util.LoggingContext
import scala.concurrent.Future
import akka.util.Timeout
import scala.concurrent.duration._
import scala.concurrent.Await
import scala.concurrent.ExecutionContext
import akka.actor.ActorRefFactory
import java.util.UUID
import dispatch._

case class SendEmailRequest(from: String, to: String, subject: String, html: String)
case class SendEmailResponse(message: String, id: String)

object MailgunProtocol  extends DefaultJsonProtocol{
  def toSendEmailResponse(jsonResponse: String): SendEmailResponse = {
    implicit val implSendMailResponse = jsonFormat2(SendEmailResponse.apply)
    jsonResponse.asJson.convertTo[SendEmailResponse]
  }  
}

trait MailgunClient{

  import MailgunProtocol._

  def settings: Settings
  def actorRefFactory: ActorRefFactory

  val requestInviteConfirmationHtmlTemplate = getTemplate("requestInviteConfirmation.html", settings.emailTemplateDir)
  val acceptInviteRequestHtmlTemplate = getTemplate("acceptInviteRequest.html", settings.emailTemplateDir)

  implicit val implicitActorRefFactory = actorRefFactory
  implicit val implicitContext =  actorRefFactory.dispatcher 
  val mailgunRequest = url("https://api.mailgun.net/v2/" + settings.mailgunDomain + "/messages")
  val mailgunPostRequest = mailgunRequest.POST
  
  def sendRequestInviteConfirmation(email: String, inviteRequestUUID: UUID): Future[Either[Throwable, String]] = {
    val sendEmailRequest = SendEmailRequest(settings.emailFrom, email, 
                           settings.requestInviteConfirmationTitle, 
                           requestInviteConfirmationHtmlTemplate.replaceAll(
                               "queueNumberLink", 
                               settings.emailUrlPrefix
                               + settings.requestInviteOrderNumberURI.replaceAll(
                                               "uuidValue", inviteRequestUUID.toString()))
                           .replaceAll("logoLink", 
                               settings.emailUrlPrefix + "logoname.png"))
    
    sendEmail(sendEmailRequest)
  }
  
  def sendInvite(invite: Invite): Future[Either[Throwable, String]] = {
    val sendEmailRequest = SendEmailRequest(settings.emailFrom, invite.email, 
                           settings.acceptInviteRequestTitle, 
                           acceptInviteRequestHtmlTemplate
                             .replaceAll(
                               "acceptInviteLink", 
                               settings.emailSecureUrlPrefix 
                               + settings.acceptInviteURI
                                   .replaceAll("inviteValue", invite.code.toHexString)
                                   .replaceAll("emailValue", invite.email))
                             .replaceAll("logoLink", settings.emailUrlPrefix + "logoname.png"))
    sendEmail(sendEmailRequest)
  }
  
  private def sendEmail(sendEmailRequest: SendEmailRequest): Future[Either[Throwable, String]] = {
    val mailgunPostWithRequestWithAuth = mailgunPostRequest.as_!("api", settings.mailgunApiKey)
    
    val mailgunPostWithRequestWithAuthAndParameters = 
    mailgunPostWithRequestWithAuth << Map("from" -> sendEmailRequest.from,
                                "to" -> sendEmailRequest.to,
                                "subject" -> sendEmailRequest.subject,
                                "html" -> sendEmailRequest.html)
                                                                
    Http(mailgunPostWithRequestWithAuthAndParameters OK as.String).either
  }
    
  private def getTemplate(templateFileName: String, templateDirectory: Option[String]): String = {
    val source = {
      if (templateDirectory.isDefined)
        scala.io.Source.fromFile(templateDirectory.get + "/" + templateFileName)
      else{
        // Read file from templates directory
        scala.io.Source.fromInputStream(getClass.getResourceAsStream("/templates/" + templateFileName))
      }
    }
    val lines = source.mkString
    source.close()
    lines
  }

}

class MailgunClientImpl(implicit val implSettings: Settings, implicit val implActorRefFactory: ActorRefFactory, 
                        implicit val inj: Injector)
  extends MailgunClient with Injectable {  
  override def actorRefFactory = implActorRefFactory
  override def settings = implSettings
}