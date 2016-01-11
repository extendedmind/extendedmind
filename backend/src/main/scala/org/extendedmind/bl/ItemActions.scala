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

package org.extendedmind.bl

import org.extendedmind.domain._
import org.extendedmind.db._
import org.extendedmind.security.Authorization._
import scaldi.Injector
import scaldi.Injectable
import org.extendedmind.domain.Item
import java.util.UUID
import org.extendedmind._
import org.extendedmind.Response._
import akka.actor.ActorRefFactory
import scala.concurrent.Future
import akka.event.LoggingAdapter

trait ItemActions {

  def db: GraphDatabase;
  def actorRefFactory: ActorRefFactory
  implicit val implicitActorRefFactory = actorRefFactory
  implicit val implicitExecutionContext = actorRefFactory.dispatcher

  def putNewItem(owner: Owner, item: Item)(implicit log: LoggingAdapter): Response[SetResult] = {
    db.putNewItem(owner, item)
  }

  def putExistingItem(owner: Owner, itemUUID: UUID, item: Item)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("putExistingItem: item {}", itemUUID)
    db.putExistingItem(owner, itemUUID, item)
  }

  def getItems(owner: Owner, modified: Option[Long], active: Boolean, deleted: Boolean, archived: Boolean, completed: Boolean, tagsOnly: Boolean)(implicit log: LoggingAdapter): Response[Items] = {
    log.info("getItems")

    // When using shared lists, archived needs to always be true to make sure archiving list
    // does not break sharing
    val overrideArchived = if (owner.isLimitedAccess) true else archived
    val ownerItems = db.getItems(owner, modified, active, deleted, overrideArchived, completed, tagsOnly)

    if (ownerItems.isRight) {
      if (owner.isLimitedAccess){
        // Filter array to contain only tasks, notes and lists in shared lists
        val fullListsTasksAndNotes = ownerItems.right.get.copy(tags = None, items = None,
            lists =
              if (ownerItems.right.get.lists.isDefined){
                Some(ownerItems.right.get.lists.get.filter(list => {
                  owner.sharedLists.get.find(sharedListInfo => {
                    sharedListInfo._1 == list.uuid.get
                  }).isDefined}))
              }else{
                None
              },
            tasks =
              if (ownerItems.right.get.tasks.isDefined){
                Some(ownerItems.right.get.tasks.get.filter(task => {
                  task.relationships.isDefined &&  task.relationships.get.parent.isDefined &&
                  owner.sharedLists.get.find(sharedListInfo => {
                    sharedListInfo._1 == task.relationships.get.parent.get
                  }).isDefined}))
              }else{
                None
              },
            notes =
              if (ownerItems.right.get.notes.isDefined){
                Some(ownerItems.right.get.notes.get.filter(note => {
                  note.relationships.isDefined &&  note.relationships.get.parent.isDefined &&
                  owner.sharedLists.get.find(sharedListInfo => {
                    sharedListInfo._1 == note.relationships.get.parent.get
                  }).isDefined}))
              }else{
                None
              })
        // Filter lists, tasks and notes to contain only limited fields
        val limitedListsTasksAndNotes = fullListsTasksAndNotes.copy(
          lists = stripLists(owner, fullListsTasksAndNotes.lists),
          tasks = stripTasks(fullListsTasksAndNotes.tasks),
          notes = stripNotes(fullListsTasksAndNotes.notes))

        Right(limitedListsTasksAndNotes)
      }else{
        // Destroy old deleted items
        val futureDestroyResponse = Future[Response[CountResult]] {
          db.destroyDeletedItems(owner)
        }
        futureDestroyResponse onSuccess {
          case Right(CountResult(deleteCount)) => {
            log.info("Destroyed {} deleted items for {}",
              deleteCount, owner)
          } case Left(errors) =>
            log.error("Could not destroy deleted items for {} with the following errors", owner)
            errors foreach (e => log.error(e.responseType + ": " + e.description, e.throwable))
        }
        ownerItems
      }
    }else{
      ownerItems
    }
  }

  def getItem(owner: Owner, itemUUID: UUID)(implicit log: LoggingAdapter): Response[Item] = {
    log.info("getItem")
    db.getItem(owner, itemUUID)
  }

  def deleteItem(owner: Owner, itemUUID: UUID)(implicit log: LoggingAdapter): Response[DeleteItemResult] = {
    log.info("deleteItem")
    db.deleteItem(owner, itemUUID)
  }

  def undeleteItem(owner: Owner, itemUUID: UUID)(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("undeleteItem")
    db.undeleteItem(owner, itemUUID)
  }

  def putNewItemToInbox(inboxId: String, fields: Seq[(String,String)])(implicit log: LoggingAdapter): Response[SetResult] = {
    log.info("putNewItemToInbox")
    var title: String = null;
    var description: String = null;
    var link: String = null;
    var checkConnection: Boolean = false;
    for (i <- 0 until fields.length){
      if (fields(i)._1 == "Subject"){
        if (fields(i)._2 == null || fields(i)._2.trim.length == 0){
          title = "untitled"
        }else{
          val trimmedTitle = fields(i)._2.trim
          val titleMaxLength =
            if (trimmedTitle.length < Validators.TITLE_MAX_LENGTH) trimmedTitle.length
            else Validators.TITLE_MAX_LENGTH
          title = trimmedTitle.substring(0, titleMaxLength)
        }
      }else if (fields(i)._1 == "stripped-text"){
        if (fields(i)._2 != null && fields(i)._2.length > 0){
          // Tokenize with whitespace
          val tokenized = fields(i)._2.split("\\s+");
          if (!tokenized.isEmpty){
            try{
              val url = new java.net.URL(tokenized(0))
              // Success, the first part is an URL
              link = tokenized(0)
              if (tokenized.size > 1){
                // There is more after the link, use it as the description
                description = getValidDescriptionOrNull(fields(i)._2.substring(tokenized(0).length))
              }
            }catch {
              case e: java.net.MalformedURLException => {
                // The content does not start with an URL, use it as a description
                description = getValidDescriptionOrNull(fields(i)._2)
              }
            }
          }
        }
      }else if (fields(i)._1 == "check-connection"){
        checkConnection = true;
      }
    }
    if (title == null && !checkConnection){
      fail(INVALID_PARAMETER, ERR_ITEM_MISSING_SUBJECT, "could not find subject in inbox parameters")
    }else if (checkConnection){
      db.isInboxValid(inboxId)
    }else {
      db.putNewItemToInbox(inboxId, Item(title, if (description==null) None else Some(description),
                                if (link==null) None else Some(link)))
    }
  }

  def getPublicItems(handle: String, modified: Option[Long])(implicit log: LoggingAdapter): Response[PublicItems] = {
    log.info("getPublicItems")
    db.getPublicItems(handle, modified)
  }

  def getPublicItem(handle: String, path: String)(implicit log: LoggingAdapter): Response[PublicItem] = {
    log.info("getPublicItem")
    db.getPublicItem(handle, path)
  }

  private def getValidDescriptionOrNull(descriptionSeed: String): String = {
    val trimmedDescription = descriptionSeed.trim
    if (trimmedDescription.length > 0){
      val descriptionMaxLength =
        if (trimmedDescription.length < Validators.DESCRIPTION_MAX_LENGTH)
          trimmedDescription.length
        else Validators.DESCRIPTION_MAX_LENGTH
      val trimmedShortDescription = trimmedDescription.substring(0, descriptionMaxLength)
      // If the description contains only --, it is most likely the signature, so we just remove it
      if (trimmedShortDescription == "--") null
      else trimmedShortDescription
    }else {
      null
    }
  }

  private def stripLists(owner: Owner, lists: Option[scala.List[List]]): Option[scala.List[List]] = {
    if (lists.isDefined && lists.get.size > 0){
      Some(lists.get.map(list => {
        list.copy(
          archived = None,
          due = None,
          visibility =
            if (list.visibility.isDefined && list.visibility.get.agreements.isDefined){
              val agreementsForCurrentUser = list.visibility.get.agreements.get.filter(agreement => {
                agreement.proposedTo.get.uuid.get == owner.userUUID
              })
              val strippedAgreementsForCurrentUser = agreementsForCurrentUser.map(agreement => {
                // No need to include the users own email/uuid into the agreement
                agreement.copy(proposedTo = None)
              })
              if (strippedAgreementsForCurrentUser.isEmpty){
                None
              }else{
                Some(SharedItemVisibility(None, None, None,
                    Some(strippedAgreementsForCurrentUser)))
              }
            }else{
              None
            },
          relationships = None)
      }))
    }else{
      None
    }
  }

  private def stripTasks(tasks: Option[scala.List[Task]]): Option[scala.List[Task]] = {
    if (tasks.isDefined && tasks.get.size > 0){
      Some(tasks.get.map(task => {
        task.copy(
          archived = None,
          due = None,
          reminders = None,
          visibility = None,
          relationships = Some(task.relationships.get.copy(origin=None, tags=None)))
      }))
    }else{
      None
    }
  }

  private def stripNotes(notes: Option[scala.List[Note]]): Option[scala.List[Note]] = {
    if (notes.isDefined && notes.get.size > 0){
      Some(notes.get.map(note => {
        note.copy(
          archived = None,
          favorited = None,
          visibility = None,
          relationships = Some(note.relationships.get.copy(origin=None, tags=None)))
      }))
    }else{
      None
    }
  }
}

class ItemActionsImpl(implicit val implSettings: Settings, implicit val inj: Injector,
  implicit val implActorRefFactory: ActorRefFactory)
  extends ItemActions with Injectable {
  override def db = inject[GraphDatabase]
  override def actorRefFactory = implActorRefFactory
}
