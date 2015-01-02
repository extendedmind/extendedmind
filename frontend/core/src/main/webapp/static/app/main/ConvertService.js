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

 function ConvertService(BackendClientService, ExtendedItemService, ListsService, NotesService,
                         TasksService) {

  // TODO: Should these be public getter functions in corresponding services?
  var listSlashRegex = /\/list\//;
  var noteSlashRegex = /\/note\//;
  var taskSlashRegex = /\/task\//;
  var listRegex = /\/list/;
  var noteRegex = /\/note/;
  var taskRegex = /\/task/;

  var convertTaskToNoteRegexp = new RegExp('^' +
                                           BackendClientService.apiPrefixRegex.source +
                                           BackendClientService.uuidRegex.source +
                                           taskSlashRegex.source +
                                           BackendClientService.uuidRegex.source +
                                           noteRegex.source +
                                           '$'),

  convertTaskToListRegexp = new RegExp('^' +
                                       BackendClientService.apiPrefixRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       taskSlashRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       listRegex.source +
                                       '$'),

  convertNoteToTaskRegexp = new RegExp('^' +
                                       BackendClientService.apiPrefixRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       noteSlashRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       taskRegex.source +
                                       '$'),

  convertNoteToListRegexp = new RegExp('^' +
                                       BackendClientService.apiPrefixRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       noteSlashRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       listRegex.source +
                                       '$'),

  convertListToTaskRegexp = new RegExp('^' +
                                       BackendClientService.apiPrefixRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       listSlashRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       taskRegex.source +
                                       '$'),

  convertListToNoteRegexp = new RegExp('^' +
                                       BackendClientService.apiPrefixRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       listSlashRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       noteRegex.source +
                                       '$');

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
    NotesService.addNote(note, ownerUUID);
    TasksService.removeTask(task.trans.uuid, ownerUUID);

    var convert = copyTaskPersistentPropertiesToConvert(task);
    if (convert) copyConvertToItemTransientProperties(note, convert, 'task', 'note');
  }

  function processTaskToListResponse(task, list, ownerUUID) {
    ListsService.addList(list, ownerUUID);
    TasksService.removeTask(task.trans.uuid, ownerUUID);

    var convert = copyTaskPersistentPropertiesToConvert(task);
    if (convert) copyConvertToItemTransientProperties(list, convert, 'task', 'list');
  }

  function processNoteToTaskResponse(note, task, ownerUUID) {
    TasksService.addTask(task, ownerUUID);
    NotesService.removeNote(note.trans.uuid, ownerUUID);

    var convert = copyNotePersistentPropertiesToConvert(note);
    if (convert) copyConvertToItemTransientProperties(task, convert, 'note', 'task');
  }

  function processNoteToListResponse(note, list, ownerUUID) {
    ListsService.addList(list, ownerUUID);
    NotesService.removeNote(note.trans.uuid, ownerUUID);

    var convert = copyNotePersistentPropertiesToConvert(note);
    if (convert) copyConvertToItemTransientProperties(list, convert, 'note', 'list');
  }

  function processListToTaskResponse(list, task, ownerUUID) {
    TasksService.addTask(task, ownerUUID);
    ListsService.removeList(list.trans.uuid, ownerUUID);
  }

  function processListToNoteResponse(list, note, ownerUUID) {
    NotesService.addNote(note, ownerUUID);
    ListsService.removeList(list.trans.uuid, ownerUUID);
  }

  function removeList(item) {
    if (item.trans.list) delete item.trans.list;
  }

  function copyTaskPersistentPropertiesToConvert(task) {
    if (task.due || task.repeating || task.reminder) {
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
    if (item.trans.convert) {
      if (item.trans.convert[toItemType]) delete item.trans.convert[toItemType];
    }
    // Check that convert object is not empty
    if (convert && Object.getOwnPropertyNames(convert).length > 0) {
      if (!item.trans.convert) item.trans.convert = {};
      item.trans.convert[fromItemType] = convert;
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
      return postConvertTaskToNote(task, ownerUUID).then(function(response) {
        processTaskToNoteResponse(task, response, ownerUUID);
        return response;
      });
    },
    finishTaskToListConvert: function(task, ownerUUID) {
      // TODO: should cleanRecentlyCompletedTasks(ownerUUID) be called first?
      if (TasksService.getTaskStatus(task, ownerUUID) === 'deleted') return;
      // NOTE: Currently only one-level lists are supported.
      // Remove pre-existing list before converting to list.
      removeList(task);

      return postConvertTaskToList(task, ownerUUID).then(function(response) {
        processTaskToListResponse(task, response, ownerUUID);
        return response;
      });
    },
    finishNoteToTaskConvert: function(note, ownerUUID) {
      if (note.uuid) {
        if (NotesService.getNoteStatus(note, ownerUUID) === 'deleted') return;

        return postConvertNoteToTask(note, ownerUUID).then(function(response) {
          processNoteToTaskResponse(note, response, ownerUUID);
          return response;
        });
      } else {
        // TODO: Convert new note to task.
      }
    },
    finishNoteToListConvert: function(note, ownerUUID) {
      if (NotesService.getNoteStatus(note, ownerUUID) === 'deleted') return;
      // NOTE: Currently only one-level lists are supported.
      // Remove pre-existing list before convertin to list.
      removeList(note);
      return postConvertNoteToList(note, ownerUUID).then(function(response) {
        processNoteToListResponse(note, response, ownerUUID);
        return response;
      });
    },
    finishListToTaskConvert: function(list, ownerUUID) {
      if (ListsService.getListStatus(list, ownerUUID) === 'deleted') return;
      return postConvertListToTask(list, ownerUUID).then(function(response) {
        processListToTaskResponse(list, response, ownerUUID);
        return response;
      });
    },
    finishListToNoteConvert: function(list, ownerUUID) {
      if (ListsService.getListStatus(list, ownerUUID) === 'deleted') return;

      return postConvertListToNote(list, ownerUUID).then(function(response) {
        processListToNoteResponse(list, response, ownerUUID);
        return response;
      });
    },

    convertTaskToNoteRegex: convertTaskToNoteRegexp,
    convertTaskToListRegex: convertTaskToListRegexp,
    convertNoteToTaskRegex: convertNoteToTaskRegexp,
    convertNoteToListRegex: convertNoteToListRegexp,
    convertListToTaskRegex: convertListToTaskRegexp,
    convertListToNoteRegex: convertListToNoteRegexp
  };
}
ConvertService['$inject'] = ['BackendClientService', 'ExtendedItemService', 'ListsService', 'NotesService',
'TasksService'];
angular.module('em.main').factory('ConvertService', ConvertService);
