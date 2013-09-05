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

case class SendEmailRequest(from: String, to: String, subject: String, html: String)
case class SendEmailResponse(message: String, id: String)

object MailgunProtocol  extends DefaultJsonProtocol{
  implicit val sendEmailRequestMarshaller = 
      Marshaller.delegate[SendEmailRequest, FormData](`application/x-www-form-urlencoded`) { (sendMailRequest, contentType) =>
        new FormData(getCCParams(SendEmailRequest))
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
  val requestInviteConfirmationHtml = getFileContent(settings.emailTemplateDir + "/requestInviteConfirmation.html")

  // Prepare pipeline
  implicit val system = ActorSystem("MailgunClient")
  import system.dispatcher // execution context for futures below
  val sendEmailPipeline = sendReceive ~> unmarshal[SendEmailResponse]
  
  def sendRequestInviteConfirmation(email: String): Response[String] = {
    val sendEmailRequest = SendEmailRequest(settings.emailFrom, email, 
                           settings.requestInviteConfirmationTitle, requestInviteConfirmationHtml)
    val responseFuture = sendEmailPipeline {
      Post("https://api.mailgun.net/v2/" + settings.mailgunDomain + "/messages",
          marshal(sendEmailRequest).right.get
              ) ~> addHeader("Content-Type", `application/x-www-form-urlencoded`.toString
              ) ~> addCredentials(BasicHttpCredentials("api", settings.mailgunApiKey))  
    }
    responseFuture onComplete {
      case Success(SendEmailResponse(message, id)) =>
        return Right(id)
      case Failure(error) =>
        return fail(INTERNAL_SERVER_ERROR, "Sending email to " + email + " failed", error)
      case _ =>
        return fail(INTERNAL_SERVER_ERROR, "Unknown response for sending email to " + email)
    }
    fail(INTERNAL_SERVER_ERROR, "Unknown error while sending email to " + email)
  }
  
  private def getFileContent(fileLocation: String): String = {
    val source = scala.io.Source.fromFile("file.txt")
    val lines = source.mkString
    source.close()
    lines
  }

}

class MailgunClientImpl(implicit val implSettings: Settings, implicit val inj: Injector)
  extends MailgunClient with Injectable {
  override def settings = implSettings
}