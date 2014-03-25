package org.extendedmind.api

import spray.json._
import java.util.UUID
import org.extendedmind.domain._
import org.extendedmind._
import org.extendedmind.security._

object JsonImplicits extends DefaultJsonProtocol {

  // Create custom formatters
  import spray.json._

  implicit object UUIDJsonFormat extends JsonFormat[UUID] {
    def write(x: UUID) = JsString(x.toString())
    def read(value: JsValue) = value match {
      case JsString(x) => java.util.UUID.fromString(x)
      case x => deserializationError("Expected UUID as JsString, but got " + x)
    }
  }
  implicit object TagTypeJsonFormat extends JsonFormat[TagType] {
    def write(x: TagType) = JsString(
        x match {
          case CONTEXT => "context"
          case KEYWORD => "keyword"
          case HISTORY => "history"
        })
    def read(value: JsValue) = value match {
      case JsString(x) => {
        if (x == "keyword") KEYWORD
        else if (x == "context") CONTEXT 
        else if (x == "history") HISTORY 
        else deserializationError("Expected 'context', 'keyword' or 'history' but got " + x)
      }
      case x => deserializationError("Expected TagType as JsString, but got " + x)
    }
  }
  implicit object InviteRequestResultTypeJsonFormat extends JsonFormat[InviteRequestResultType] {
    def write(x: InviteRequestResultType) = JsString(
        x match {
          case NEW_INVITE_REQUEST_RESULT => "newInviteRequest"
          case INVITE_REQUEST_RESULT => "inviteRequest"
          case INVITE_RESULT => "invite"
          case USER_RESULT => "user"
        })
    def read(value: JsValue) = value match {
      case JsString(x) => {
        if (x == "newInviteRequest") NEW_INVITE_REQUEST_RESULT
        else if (x == "inviteRequest") INVITE_REQUEST_RESULT 
        else if (x == "invite") INVITE_RESULT 
        else if (x == "user") USER_RESULT 

        else deserializationError("Expected 'context', 'keyword' or 'history' but got " + x)
      }
      case x => deserializationError("Expected TagType as JsString, but got " + x)
    }
  }

  implicit val implSetResult = jsonFormat2(SetResult.apply)
  implicit val implDeleteItemResult = jsonFormat2(DeleteItemResult.apply)
  implicit val implDestroyResult = jsonFormat1(DestroyResult.apply)
  implicit val implSignUp = jsonFormat3(SignUp.apply)
  implicit val implLogoutPayload = jsonFormat1(LogoutPayload.apply)
  implicit val implNewPassword = jsonFormat1(NewPassword.apply)
  implicit val implCountResult = jsonFormat1(CountResult.apply)
  implicit val implInviteRequest = jsonFormat3(InviteRequest.apply)
  implicit val implInviteRequestResult = jsonFormat3(InviteRequestResult.apply)
  implicit val implInviteRequests = jsonFormat1(InviteRequests.apply)
  implicit val implInviteRequestQueueNumber = jsonFormat1(InviteRequestQueueNumber.apply)
  implicit val implInviteRequestAcceptDetails = jsonFormat1(InviteRequestAcceptDetails.apply)
  implicit val implInvite = jsonFormat5(Invite.apply)
  implicit val implInvites = jsonFormat1(Invites.apply)
  implicit val implUserAccessRight = jsonFormat1(UserAccessRight.apply)
  implicit val implPublicUser = jsonFormat1(PublicUser.apply)
  implicit val implForgotPasswordResult = jsonFormat1(ForgotPasswordResult.apply)
  implicit val implUserEmail = jsonFormat1(UserEmail.apply)
  implicit val implVisibility = jsonFormat2(SharedItemVisibility.apply)
  implicit val implRelationships = jsonFormat3(ExtendedItemRelationships.apply)
  implicit val implItem = jsonFormat6(Item.apply)
  implicit val implTask = jsonFormat15(Task.apply)
  implicit val implNote = jsonFormat10(Note.apply)
  implicit val implList = jsonFormat13(List.apply)  
  implicit val implTag = jsonFormat9(Tag.apply)  
  implicit val implItems = jsonFormat5(Items.apply)
  implicit val implCollective = jsonFormat7(Collective.apply)
  implicit val implUser = jsonFormat6(User.apply)
  implicit val implSecurityContext = jsonFormat8(SecurityContext.apply)
  implicit val implAuthenticatePayload = jsonFormat2(AuthenticatePayload.apply)
  implicit val implCompleteTaskResult = jsonFormat3(CompleteTaskResult.apply)
  implicit val implArchiveListResult = jsonFormat4(ArchiveListResult.apply)

}