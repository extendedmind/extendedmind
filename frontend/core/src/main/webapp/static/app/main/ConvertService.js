/* Copyright 2013-2014 Extended Mind Technologies Oy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 /* global angular */
 'use strict';

 function ConvertService(BackendClientService, ExtendedItemService, ListsService, NotesService, TasksService) {

  // TODO: Should these be public getter functions in corresponding services?
  var listSlashRegex = /\/list\//;
  var noteSlashRegex = /\/note\//;
  var taskSlashRegex = /\/task\//;
  var listRegex = /\/list/;
  var noteRegex = /\/note/;
  var taskRegex = /\/task/;

  var convertNoteToTaskRegexp = new RegExp(
    BackendClientService.apiPrefixRegex.source +
    BackendClientService.uuidRegex.source +
    noteSlashRegex.source +
    BackendClientService.uuidRegex.source +
    taskRegex.source),

  convertTaskToListRegexp = new RegExp(
    BackendClientService.apiPrefixRegex.source +
    BackendClientService.uuidRegex.source +
    taskSlashRegex.source +
    BackendClientService.uuidRegex.source +
    listRegex.source),

  convertListToNoteRegexp = new RegExp(
    BackendClientService.apiPrefixRegex.source +
    BackendClientService.uuidRegex.source +
    listSlashRegex.source +
    BackendClientService.uuidRegex.source +
    noteRegex.source);

  function postConvertNoteToTask(note, ownerUUID) {
    var path = '/api/' + ownerUUID + '/note/' + note.uuid + '/task';
    return BackendClientService.postOnline(path, convertNoteToTaskRegexp, note);
  }
  function postConvertTaskToList(task, ownerUUID) {
    var path = '/api/' + ownerUUID + '/task/' + task.uuid + '/list';
    return BackendClientService.postOnline(path, convertTaskToListRegexp, task);
  }
  function postConvertListToNote(list, ownerUUID) {
    var path = '/api/' + ownerUUID + '/list/' + list.uuid + '/note';
    return BackendClientService.postOnline(path, convertListToNoteRegexp, list);
  }

  function processNoteToTaskResponse(note, task, ownerUUID) {
    var copyConvertToTaskTransientPropertiesFn;

    if (note.favorited) {
      var convert = {
        favorited: note.favorited
      };
      // NOTE: No need to pass 'this' to the target function.
      copyConvertToTaskTransientPropertiesFn = copyConvertToItemTransientProperties
      .bind(undefined, task, convert, 'note', 'task');
    }

    TasksService.attachTransientProperties(task, ownerUUID, copyConvertToTaskTransientPropertiesFn);
    NotesService.removeNote(note, ownerUUID);
    TasksService.addTask(task, ownerUUID);
  }

  function processTaskToListResponse(task, list, ownerUUID) {
    var copyConvertToListTransientPropertiesFn;

    if (task.due || task.repeating || task.reminder) {
      var convert = {};
      if (task.due) convert.due = task.due;
      if (task.repeating) convert.repeating = task.repeating;
      if (task.reminder) convert.reminder = task.reminder;
      // NOTE: No need to pass this to the target function
      copyConvertToListTransientPropertiesFn = copyConvertToItemTransientProperties
      .bind(undefined, list, convert, 'task', 'list');
    }

    ListsService.attachTransientProperties(list, ownerUUID, copyConvertToListTransientPropertiesFn);
    TasksService.removeTask(task, ownerUUID);
    ListsService.addList(list, ownerUUID);
  }

  function processListToNoteResponse(list, note, ownerUUID) {
    ListsService.removeList(list, ownerUUID);
    NotesService.addNote(note, ownerUUID);
  }

  function copyConvertToItemTransientProperties(item, convert, fromItemType, toItemType) {
    // NOTE:  Delete existing 'toItemType' convert object
    //        because it may be out of sync before full offline implementation.
    if (item.transientProperties && item.transientProperties.convert) {
      if (item.transientProperties.convert[toItemType]) delete item.transientProperties.convert[toItemType];
    }
    // Check that convert object is not empty
    if (convert && Object.getOwnPropertyNames(convert).length > 0) {
      if (!item.transientProperties) item.transientProperties = {};
      if (!item.transientProperties.convert) item.transientProperties.convert = {};
      item.transientProperties.convert[fromItemType] = convert;
    }
  }

  return {
    /*
    * i.    verify that note exists
    * ii.   convert note to task
    * iii.  remove old note and add new task
    */
    finishNoteToTaskConvert: function(note, ownerUUID) {
      if (note.uuid) {
        if (NotesService.getNoteStatus(note, ownerUUID) === 'deleted') return;

        NotesService.detachTransientProperties(note, ownerUUID);
        postConvertNoteToTask(note, ownerUUID).then(function(result) {
          processNoteToTaskResponse(note, result.data, ownerUUID);
        });
      } else {  // new note
        // convert note to task
      }
    },
    /*
    * i.    verify that task exists
    * ii.   convert task to list
    * iii.  remove old task and add new list
    *
    * TODO: should cleanRecentlyCompletedTasks(ownerUUID) be called first?
    */
    finishTaskToListConvert: function(task, ownerUUID) {
      if (TasksService.getTaskStatus(task, ownerUUID) === 'deleted') return;

      // NOTE: Currently only one-level lists are supported. Remove pre-existing list before saving.
      if (task.transientProperties && task.transientProperties.list) delete task.transientProperties.list;
      TasksService.detachTransientProperties(task, ownerUUID);

      postConvertTaskToList(task, ownerUUID).then(function(result) {
        processTaskToListResponse(task, result.data, ownerUUID);
      });
    },
    /*
    * i.    verify that list exists
    * ii.   convert list to note
    * iii.  remove old list and add new note
    */
    finishListToNoteConvert: function(list, ownerUUID) {
      if (ListsService.getListStatus(list, ownerUUID) === 'deleted') return;

      postConvertListToNote(list, ownerUUID).then(function(result) {
        processListToNoteResponse(list, result.data, ownerUUID);
      });
    },

    convertNoteToTaskRegexp: new RegExp(
      BackendClientService.apiPrefixRegex.source +
      BackendClientService.uuidRegex.source +
      noteSlashRegex.source +
      BackendClientService.uuidRegex.source +
      taskRegex.source)
  };
}
ConvertService['$inject'] = ['BackendClientService', 'ExtendedItemService', 'ListsService', 'NotesService', 'TasksService'];
angular.module('em.main').factory('ConvertService', ConvertService);
