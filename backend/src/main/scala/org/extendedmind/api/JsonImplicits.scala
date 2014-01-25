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
        })
    def read(value: JsValue) = value match {
      case JsString(x) => {
        if (x == "keyword") KEYWORD
        else if (x == "context") CONTEXT 
        else deserializationError("Expected 'context' or 'keyword' but got " + x)
      }
      case x => deserializationError("Expected TagType as JsString, but got " + x)
    }
  }
  implicit object RepeatingTypeJsonFormat extends JsonFormat[RepeatingType] {
    def write(x: RepeatingType) = JsString(
        x match {
          case DAILY => "daily"
          case WEEKLY => "weekly"
          case BIWEEKLY => "biweekly"
          case MONTHLY => "monthly"
          case BIMONTHLY => "bimonthly"
          case YEARLY => "yearly"
        })
    def read(value: JsValue) = value match {
      case JsString(x) => {
        if (x == "daily") DAILY
        else if (x == "weekly") WEEKLY 
        else if (x == "biweekly") BIWEEKLY
        else if (x == "monthly") MONTHLY
        else if (x == "bimonthly") BIMONTHLY
        else if (x == "monthly") YEARLY
        else deserializationError("Expected 'daily', 'weekly', 'biweekly', 'monthly', 'bimonthly', 'yearly' but got " + x)
      }
      case x => deserializationError("Expected RepeatingType as JsString, but got " + x)
    }
  }

  implicit val implSetResult = jsonFormat2(SetResult.apply)
  implicit val implDeleteItemResult = jsonFormat2(DeleteItemResult.apply)
  implicit val implDestroyResult = jsonFormat1(DestroyResult.apply)
  implicit val implSignUp = jsonFormat2(SignUp.apply)
  implicit val implLogoutPayload = jsonFormat1(LogoutPayload.apply)
  implicit val implNewPassword = jsonFormat1(NewPassword.apply)
  implicit val implCountResult = jsonFormat1(CountResult.apply)
  implicit val implInviteRequest = jsonFormat3(InviteRequest.apply)
  implicit val implInviteRequests = jsonFormat1(InviteRequests.apply)
  implicit val implInviteRequestQueueNumber = jsonFormat1(InviteRequestQueueNumber.apply)
  implicit val implInviteRequestAcceptDetails = jsonFormat1(InviteRequestAcceptDetails.apply)
  implicit val implInvite = jsonFormat5(Invite.apply)
  implicit val implInvites = jsonFormat1(Invites.apply)
  implicit val implUserAccessRight = jsonFormat1(UserAccessRight.apply)
  implicit val implPublicUser = jsonFormat1(PublicUser.apply)
  implicit val implVisibility = jsonFormat2(SharedItemVisibility.apply)
  implicit val implRelationships = jsonFormat2(ExtendedItemRelationships.apply)
  implicit val implItem = jsonFormat6(Item.apply)
  implicit val implTask = jsonFormat14(Task.apply)
  implicit val implNote = jsonFormat9(Note.apply)
  implicit val implList = jsonFormat13(List.apply)  
  implicit val implTag = jsonFormat9(Tag.apply)  
  implicit val implItems = jsonFormat5(Items.apply)
  implicit val implCollective = jsonFormat7(Collective.apply)
  implicit val implUser = jsonFormat5(User.apply)
  implicit val implSecurityContext = jsonFormat4(SecurityContext.apply)
  implicit val implAuthenticatePayload = jsonFormat1(AuthenticatePayload.apply)
  implicit val implCompleteTaskResult = jsonFormat2(CompleteTaskResult.apply)
}