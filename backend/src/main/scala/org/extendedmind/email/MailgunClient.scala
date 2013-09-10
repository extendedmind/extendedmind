package org.extendedmind.email

import scala.util.{Success, Failure}
import org.extendedmind.domain._
import org.extendedmind._
import org.extendedmind.Response._
import spray.client.pipelining._
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

case class SendEmailRequest(from: String, to: String, subject: String, html: String)
case class SendEmailResponse(message: String, id: String)

object MailgunProtocol  extends DefaultJsonProtocol{
  implicit val sendEmailRequestMarshaller = 
      Marshaller.delegate[SendEmailRequest, FormData](`application/x-www-form-urlencoded`) { (sendEmailRequest, contentType) =>
        new FormData(getCCParams(sendEmailRequest))
      }
  implicit val sendEmailResponseFormat = jsonFormat2(SendEmailResponse)
   
  def getCCParams(cc: AnyRef): Map[String, String] =
    (Map[String, String]() /: cc.getClass.getDeclaredFields) {(a, f) =>
      f.setAccessible(true)
      a + (f.getName -> f.get(cc).asInstanceOf[String])
    }
}

trait MailgunClient{

  import MailgunProtocol._

  def settings: Settings
  def actorRefFactory: ActorRefFactory

  val requestInviteConfirmationHtml = getTemplate("requestInviteConfirmation.html", settings.emailTemplateDir)

  // Prepare pipeline
  implicit val implicitActorRefFactory = actorRefFactory
  implicit val implicitContext =  actorRefFactory.dispatcher 
  val sendEmailPipeline = sendReceive ~> unmarshal[SendEmailResponse]
  
  def sendRequestInviteConfirmation(email: String): Future[SendEmailResponse] = {
    val sendEmailRequest = SendEmailRequest(settings.emailFrom, email, 
                           settings.requestInviteConfirmationTitle, requestInviteConfirmationHtml)
    implicit val timeout = Timeout(5 seconds)
    sendEmailPipeline {
      Post("https://api.mailgun.net/v2/" + settings.mailgunDomain + "/messages",
          marshal(sendEmailRequest).right.get
              ) ~> addHeader("Content-Type", `application/x-www-form-urlencoded`.toString
              ) ~> addCredentials(BasicHttpCredentials("api", settings.mailgunApiKey))  
    }
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