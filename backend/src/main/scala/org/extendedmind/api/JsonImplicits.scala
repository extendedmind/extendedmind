/**
 * Copyright (c) 2013-2016 Extended Mind Technologies Oy
 *
 * This file is part of Extended Mind.
 *
 * Extended Mind is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

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

  implicit val implIdToUUID = jsonFormat2(IdToUUID.apply)
  implicit val implSetResult = jsonFormat5(SetResult.apply)
  implicit val implErrorResult = jsonFormat3(ErrorResult.apply)
  implicit val implDeleteItemResult = jsonFormat2(DeleteItemResult.apply)
  implicit val implDestroyResult = jsonFormat1(DestroyResult.apply)
  implicit val implSignUp = jsonFormat8(SignUp.apply)
  implicit val implLogoutPayload = jsonFormat1(LogoutPayload.apply)
  implicit val implNewPassword = jsonFormat1(NewPassword.apply)
  implicit val implCountResult = jsonFormat1(CountResult.apply)
  implicit val implUserAccessRight = jsonFormat1(UserAccessRight.apply)
  implicit val implPublicUser = jsonFormat1(PublicUser.apply)
  implicit val implForgotPasswordResult = jsonFormat1(ForgotPasswordResult.apply)
  implicit val implUserEmail = jsonFormat1(UserEmail.apply)
  implicit val implAgreementUser = jsonFormat2(AgreementUser.apply)
  implicit val implAgreementTarget = jsonFormat2(AgreementTarget.apply)
  implicit val implAgreement = jsonFormat9(Agreement.apply)
  implicit val implVisibility = jsonFormat5(SharedItemVisibility.apply)
  implicit val implExtendedItemRelationships = jsonFormat6(ExtendedItemRelationships.apply)
  implicit val implItem = jsonFormat9(Item.apply)
  implicit val implReminder = jsonFormat7(Reminder.apply)
  implicit val implTask = jsonFormat17(Task.apply)
  implicit val implNote = jsonFormat16(Note.apply)
  implicit val implList = jsonFormat14(List.apply)
  implicit val implTag = jsonFormat12(Tag.apply)
  implicit val implAssignedItems = jsonFormat4(AssignedItems.apply)
  implicit val implItems = jsonFormat6(Items.apply)
  implicit val implCollective = jsonFormat15(Collective.apply)
  implicit val implUserPreferences = jsonFormat2(UserPreferences.apply)
  implicit val implAuthor = jsonFormat2(Assignee.apply)
  implicit val implUser = jsonFormat15(User.apply)
  implicit val implUsers = jsonFormat1(Users.apply)
  implicit val implSubscription = jsonFormat9(Subscription.apply)
  implicit val implStatistics = jsonFormat2(Statistics.apply)
  implicit val implSecurityContext = jsonFormat17(SecurityContext.apply)
  implicit val implAuthenticatePayload = jsonFormat2(AuthenticatePayload.apply)
  implicit val implCompleteTaskResult = jsonFormat3(CompleteTaskResult.apply)
  implicit val implReminderModification = jsonFormat2(ReminderModification.apply)
  implicit val implFavoriteNoteResult = jsonFormat2(FavoriteNoteResult.apply)
  implicit val implArchivePayload = jsonFormat1(ArchivePayload.apply)
  implicit val implArchiveListResult = jsonFormat4(ArchiveListResult.apply)
  implicit val implUnarchiveListResult = jsonFormat3(UnarchiveListResult.apply)
  implicit val implItemStatistics = jsonFormat2(NodeStatistics.apply)
  implicit val implItemProperty = jsonFormat3(NodeProperty.apply)
  implicit val implPreviewPayload = jsonFormat1(PreviewPayload.apply)
  implicit val implPreviewNoteResult = jsonFormat3(PreviewNoteResult.apply)
  implicit val implPublishPayload = jsonFormat2(PublishPayload.apply)
  implicit val implPublishNoteResult = jsonFormat2(PublishNoteResult.apply)
  implicit val implPublicItems = jsonFormat9(PublicItems.apply)
  implicit val implPublicItem = jsonFormat5(PublicItem.apply)
  implicit val implVersionInfo = jsonFormat2(VersionInfo.apply)
  implicit val implInfo = jsonFormat2(Info.apply)
}