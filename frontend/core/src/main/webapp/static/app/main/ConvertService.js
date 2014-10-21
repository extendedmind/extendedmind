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

  var convertTaskToNoteRegexp = new RegExp(
    BackendClientService.apiPrefixRegex.source +
    BackendClientService.uuidRegex.source +
    taskSlashRegex.source +
    BackendClientService.uuidRegex.source +
    noteRegex.source),

  convertTaskToListRegexp = new RegExp(
    BackendClientService.apiPrefixRegex.source +
    BackendClientService.uuidRegex.source +
    taskSlashRegex.source +
    BackendClientService.uuidRegex.source +
    listRegex.source),

  convertNoteToTaskRegexp = new RegExp(
    BackendClientService.apiPrefixRegex.source +
    BackendClientService.uuidRegex.source +
    noteSlashRegex.source +
    BackendClientService.uuidRegex.source +
    taskRegex.source),

  convertNoteToListRegexp = new RegExp(
    BackendClientService.apiPrefixRegex.source +
    BackendClientService.uuidRegex.source +
    noteSlashRegex.source +
    BackendClientService.uuidRegex.source +
    listRegex.source),

  convertListToTaskRegexp = new RegExp(
    BackendClientService.apiPrefixRegex.source +
    BackendClientService.uuidRegex.source +
    listSlashRegex.source +
    BackendClientService.uuidRegex.source +
    taskRegex.source),

  convertListToNoteRegexp = new RegExp(
    BackendClientService.apiPrefixRegex.source +
    BackendClientService.uuidRegex.source +
    listSlashRegex.source +
    BackendClientService.uuidRegex.source +
    noteRegex.source);

  function postConvertTaskToNote(task, ownerUUID) {
    var path = '/api/' + ownerUUID + '/task/' + task.uuid + '/note';
    return BackendClientService.postOnline(path, convertTaskToNoteRegexp, task);
  }
  function postConvertTaskToList(task, ownerUUID) {
    var path = '/api/' + ownerUUID + '/task/' + task.uuid + '/list';
    return BackendClientService.postOnline(path, convertTaskToListRegexp, task);
  }
  function postConvertNoteToTask(note, ownerUUID) {
    var path = '/api/' + ownerUUID + '/note/' + note.uuid + '/task';
    return BackendClientService.postOnline(path, convertNoteToTaskRegexp, note);
  }
  function postConvertNoteToList(note, ownerUUID) {
    var path = '/api/' + ownerUUID + '/note/' + note.uuid + '/list';
    return BackendClientService.postOnline(path, convertNoteToListRegexp, note);
  }
  function postConvertListToTask(list, ownerUUID) {
    var path = '/api/' + ownerUUID + '/list/' + list.uuid + '/task';
    return BackendClientService.postOnline(path, convertListToTaskRegexp, list);
  }
  function postConvertListToNote(list, ownerUUID) {
    var path = '/api/' + ownerUUID + '/list/' + list.uuid + '/note';
    return BackendClientService.postOnline(path, convertListToNoteRegexp, list);
  }

  function processTaskToNoteResponse(task, note, ownerUUID) {
    var copyConvertToNoteTransientPropertiesFn;
    var convert = copyTaskPersistentPropertiesToConvert(task);
    // NOTE: No need to pass 'this' to the target function.
    if (convert) copyConvertToNoteTransientPropertiesFn = copyConvertToItemTransientProperties
      .bind(undefined, note, convert, 'task', 'note');

    NotesService.addTransientProperties(note, ownerUUID, copyConvertToNoteTransientPropertiesFn);
    NotesService.addNote(note, ownerUUID);
    TasksService.removeTask(task, ownerUUID);
  }

  function processTaskToListResponse(task, list, ownerUUID) {
    var copyConvertToListTransientPropertiesFn;
    var convert = copyTaskPersistentPropertiesToConvert(task);
    // NOTE: No need to pass 'this' to the target function.
    if (convert) copyConvertToListTransientPropertiesFn = copyConvertToItemTransientProperties
      .bind(undefined, list, convert, 'task', 'list');

    ListsService.addTransientProperties([list], ownerUUID, copyConvertToListTransientPropertiesFn);
    ListsService.addList(list, ownerUUID);
    TasksService.removeTask(task, ownerUUID);
  }

  function processNoteToTaskResponse(note, task, ownerUUID) {
    var copyConvertToTaskTransientPropertiesFn;
    var convert = copyNotePersistentPropertiesToConvert(note);
    // NOTE: No need to pass 'this' to the target function.
    if (convert) copyConvertToTaskTransientPropertiesFn = copyConvertToItemTransientProperties
      .bind(undefined, task, convert, 'note', 'task');

    TasksService.addTransientProperties([task], ownerUUID, copyConvertToTaskTransientPropertiesFn);
    TasksService.addTask(task, ownerUUID);
    NotesService.removeNote(note, ownerUUID);
  }

  function processNoteToListResponse(note, list, ownerUUID) {
    var copyConvertToListTransientPropertiesFn;
    var convert = copyNotePersistentPropertiesToConvert(note);
    // NOTE: No need to pass 'this' to the target function.
    if (convert) copyConvertToListTransientPropertiesFn = copyConvertToItemTransientProperties
      .bind(undefined, list, convert, 'note', 'list');

    ListsService.addTransientProperties(list, ownerUUID, copyConvertToListTransientPropertiesFn);
    ListsService.addList(list, ownerUUID);
    NotesService.removeNote(note, ownerUUID);
  }

  function processListToTaskResponse(list, task, ownerUUID) {
    TasksService.addTransientProperties([task], ownerUUID);
    TasksService.addTask(task, ownerUUID);
    ListsService.removeList(list, ownerUUID);
  }

  function processListToNoteResponse(list, note, ownerUUID) {
    NotesService.addTransientProperties(note, ownerUUID);
    NotesService.addNote(note, ownerUUID);
    ListsService.removeList(list, ownerUUID);
  }

  function removeList(item) {
    if (item.transientProperties && item.transientProperties.list) delete item.transientProperties.list;
  }

  function copyTaskPersistentPropertiesToConvert(task) {
    if (task.due || task.repeating || task.reminder) {
      var convert = {};
      if (task.due) convert.due = task.due;
      if (task.repeating) convert.repeating = task.repeating;
      if (task.reminder) convert.reminder = task.reminder;
      return convert;
    }
  }

  function copyNotePersistentPropertiesToConvert(note) {
    if (note.favorited) return {favorited: note.favorited};
  }

  /**
   * @description Copy convert object to item's transient properties object.
   *
   * Convert object stores item's history during session.
   *
   * @param {Object}  item          The item to copy to.
   * @param {Object}  convert       The object to copy to item.
   * @param {string}  fromItemType  Type of the item converted from
   * @param {string}  toItemType    Type of the item converted to
   */
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
    * PERSISTENT ITEM CONVERSION
    *
    * i.    verify that item to be converted exists
    * ii.   convert item to new type
    * iii.  remove old item from memory and add new item to memory
    */
    finishTaskToNoteConvert: function(task, ownerUUID) {
      if (TasksService.getTaskStatus(task, ownerUUID) === 'deleted') return;
      TasksService.detachTransientProperties(task, ownerUUID);
      postConvertTaskToNote(task, ownerUUID).then(function(result) {
        processTaskToNoteResponse(task, result.data, ownerUUID);
      });
    },
    finishTaskToListConvert: function(task, ownerUUID) {
      // TODO: should cleanRecentlyCompletedTasks(ownerUUID) be called first?
      if (TasksService.getTaskStatus(task, ownerUUID) === 'deleted') return;
      // NOTE: Currently only one-level lists are supported. Remove pre-existing list before convertin to list.
      removeList(task);
      TasksService.detachTransientProperties(task, ownerUUID);

      postConvertTaskToList(task, ownerUUID).then(function(result) {
        processTaskToListResponse(task, result.data, ownerUUID);
      });
    },
    finishNoteToTaskConvert: function(note, ownerUUID) {
      if (note.uuid) {
        if (NotesService.getNoteStatus(note, ownerUUID) === 'deleted') return;

        NotesService.detachTransientProperties(note, ownerUUID);
        postConvertNoteToTask(note, ownerUUID).then(function(result) {
          processNoteToTaskResponse(note, result.data, ownerUUID);
        });
      } else {
        // TODO: Convert new note to task.
      }
    },
    finishNoteToListConvert: function(note, ownerUUID) {
      if (NotesService.getNoteStatus(note, ownerUUID) === 'deleted') return;
      // NOTE: Currently only one-level lists are supported. Remove pre-existing list before convertin to list.
      removeList(note);
      NotesService.detachTransientProperties(note, ownerUUID);
      postConvertNoteToList(note, ownerUUID).then(function(result) {
        processNoteToListResponse(note, result.data, ownerUUID);
      });
    },
    finishListToTaskConvert: function(list, ownerUUID) {
      if (ListsService.getListStatus(list, ownerUUID) === 'deleted') return;
      postConvertListToTask(list, ownerUUID).then(function(result) {
        processListToTaskResponse(list, result.data, ownerUUID);
      });
    },
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
