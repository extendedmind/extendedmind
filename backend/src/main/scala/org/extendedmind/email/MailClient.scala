package org.extendedmind.email

import org.extendedmind._
import org.extendedmind.domain._
import scala.concurrent.Future
import akka.actor.ActorRefFactory

case class SendEmailRequest(from: String, to: String, subject: String, html: String)
case class SendEmailResponse(message: String, id: String)

trait MailClient {

  def settings: Settings
  def actorRefFactory: ActorRefFactory

  // Prepare pipeline
  implicit val implicitActorRefFactory = actorRefFactory
  implicit val implicitContext = actorRefFactory.dispatcher

  val shareListHtmlTemplate = getTemplate("shareList.html", settings.emailTemplateDir)
  val resetPasswordHtmlTemplate = getTemplate("resetPassword.html", settings.emailTemplateDir)
  val verifyEmailHtmlTemplate = getTemplate("verifyEmail.html", settings.emailTemplateDir)
  val inviteHtmlTemplate = getTemplate("invite.html", settings.emailTemplateDir)

  def sendShareListAgreement(agreement: Agreement, acceptCode: Long, sharedListTitle: String, proposedByDisplayName: String): Future[SendEmailResponse] = {
    val sendEmailRequest = SendEmailRequest(settings.emailFrom, agreement.proposedTo.get.email.get,
      settings.shareListTitle.replaceAll(
          "proposedByDisplayName",
          proposedByDisplayName),
      shareListHtmlTemplate
        .replaceAll(
          "acceptLink",
          settings.emailUrlOrigin
            + settings.acceptShareURI
            .replaceAll("shareValue", acceptCode.toHexString)
            .replaceAll("emailValue", agreement.proposedTo.get.email.get))
        .replaceAll("logoLink", settings.emailUrlOrigin + "/static/img/logo-text.png")
        .replaceAll("proposedByDisplayName", proposedByDisplayName)
        .replaceAll("sharedListTitle", xml.Utility.escape(sharedListTitle))
        )
    sendEmail(sendEmailRequest)
  }

  def sendInvite(invite: Invite, inviterDisplayName: String): Future[SendEmailResponse] = {
    val sendEmailRequest = SendEmailRequest(settings.emailFrom, invite.email,
      settings.inviteTitle.replaceAll(
          "inviterDisplayName",
          inviterDisplayName),
      shareListHtmlTemplate
        .replaceAll(
          "joinLink",
          settings.emailUrlOrigin
            + settings.joinInviteURI
            .replaceAll("inviteValue", invite.code.get.toHexString)
            .replaceAll("emailValue", invite.email))
        .replaceAll("logoLink", settings.emailUrlOrigin + "/static/img/logo-text.png")
        .replaceAll("inviterDisplayName", inviterDisplayName)
        )
    sendEmail(sendEmailRequest)
  }

  def sendPasswordResetLink(email: String, resetCode: Long): Future[SendEmailResponse] = {
    val sendEmailRequest = SendEmailRequest(settings.emailFrom, email,
      settings.resetPasswordTitle,
      resetPasswordHtmlTemplate
        .replaceAll(
          "resetPasswordLink",
          settings.emailUrlOrigin
            + settings.resetPasswordURI
            .replaceAll("resetCodeValue", resetCode.toHexString)
            .replaceAll("emailValue", email))
        .replaceAll("logoLink", settings.emailUrlOrigin + "/static/img/logo-text.png"))
    sendEmail(sendEmailRequest)
  }

  def sendEmailVerificationLink(email: String, emailVerificationCode: Long): Future[SendEmailResponse] = {
    val sendEmailRequest = SendEmailRequest(settings.emailFrom, email,
      settings.verifyEmailTitle,
      verifyEmailHtmlTemplate
        .replaceAll(
          "verifyEmailLink",
          settings.emailUrlOrigin
            + settings.verifyEmailURI
            .replaceAll("verifyCodeValue", emailVerificationCode.toHexString)
            .replaceAll("emailValue", email))
        .replaceAll("logoLink", settings.emailUrlOrigin + "/static/img/logo-text.png"))
    sendEmail(sendEmailRequest)
  }

  // Override this
  def sendEmail(sendEmailRequest: SendEmailRequest): Future[SendEmailResponse]

  private def getTemplate(templateFileName: String, templateDirectory: Option[String]): String = {
    val source = {
      if (templateDirectory.isDefined)
        scala.io.Source.fromFile(templateDirectory.get + "/" + templateFileName)
      else {
        // Read file from templates directory
        scala.io.Source.fromInputStream(getClass.getResourceAsStream("/templates/" + templateFileName))
      }
    }
    val lines = source.mkString
    source.close()
    lines
  }

}