/**
 * Copyright (c) 2013-2014 Extended Mind Technologies Oy
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

  def getItems(owner: Owner, modified: Option[Long], active: Boolean, deleted: Boolean, archived: Boolean, completed: Boolean)(implicit log: LoggingAdapter): Response[Items] = {
    log.info("getItems")
    
    // When using shared lists, archived needs to always be true to make sure archiving list
    // does not break sharing
    val overrideArchived = if (owner.sharedLists.isDefined) true else archived
    val ownerItems = db.getItems(owner, modified, active, deleted, overrideArchived, completed)

    if (ownerItems.isRight) {
      if (owner.sharedLists.isDefined){
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
  
  private def stripLists(owner: Owner, lists: Option[scala.List[List]]): Option[scala.List[List]] = {
    if (lists.isDefined && lists.get.size > 0){
      Some(lists.get.map(list => {
        list.copy(
          archived = None,
          due = None,
          assignee = None,
          assigner = None,
          visibility =
            if (list.visibility.isDefined && list.visibility.get.agreements.isDefined){
              val agreementForCurrentUser = list.visibility.get.agreements.get.filter(agreement => {
                agreement.proposedTo.get.uuid.get == owner.userUUID
              })
              if (agreementForCurrentUser.isEmpty){
                None
              }else{
                Some(SharedItemVisibility(None, Some(agreementForCurrentUser)))
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
          assignee = None,
          assigner = None,
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
