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
      case x => deserializationError("Expected UUID as JsString, but got " + x)
    }
  }

  implicit val implSetResult = jsonFormat2(SetResult.apply)
  implicit val implDeleteItemResult = jsonFormat2(DeleteItemResult.apply)
  implicit val implDestroyResult = jsonFormat1(DestroyResult.apply)
  implicit val implSignUp = jsonFormat2(SignUp.apply)
  implicit val implInviteRequest = jsonFormat2(InviteRequest.apply)
  implicit val implInviteRequests = jsonFormat1(InviteRequests.apply)
  implicit val implInviteRequestQueueNumber = jsonFormat1(InviteRequestQueueNumber.apply)
  implicit val implInviteRequestAcceptDetails = jsonFormat1(InviteRequestAcceptDetails.apply)
  implicit val implInvite = jsonFormat4(Invite.apply)
  implicit val implInvites = jsonFormat1(Invites.apply)
  implicit val implUserAccessRight = jsonFormat1(UserAccessRight.apply)
  implicit val implPublicUser = jsonFormat1(PublicUser.apply)
  implicit val implVisibility = jsonFormat2(SharedItemVisibility.apply)
  implicit val implRelationships = jsonFormat3(ExtendedItemRelationships.apply)
  implicit val implItem = jsonFormat5(Item.apply)
  implicit val implTask = jsonFormat14(Task.apply)
  implicit val implNote = jsonFormat10(Note.apply)
  implicit val implTag = jsonFormat9(Tag.apply)  
  implicit val implItems = jsonFormat4(Items.apply)
  implicit val implCollective = jsonFormat7(Collective.apply)
  implicit val implUser = jsonFormat4(User.apply)
  implicit val implSecurityContext = jsonFormat5(SecurityContext.apply)
  implicit val implAuthenticatePayload = jsonFormat1(AuthenticatePayload.apply)
  implicit val implCompleteTaskResult = jsonFormat2(CompleteTaskResult.apply)
}