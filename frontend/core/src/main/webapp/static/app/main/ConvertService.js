/* Copyright 2013-2015 Extended Mind Technologies Oy
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

 /* global angular, jQuery */
 'use strict';

 function ConvertService($q, BackendClientService, ExtendedItemService, ItemLikeService,
                         ListsService, NotesService, TasksService) {

  var listSlashRegex = /\/list\//;
  var noteSlashRegex = /\/note\//;
  var taskSlashRegex = /\/task\//;
  var listRegex = /\/list/;
  var noteRegex = /\/note/;
  var taskRegex = /\/task/;

  function processTaskToNoteResponse(task, note, ownerUUID) {
    if (task.hist) note.hist = task.hist;
    NotesService.addNote(note, ownerUUID);
    TasksService.removeTask(task.trans.uuid, ownerUUID);
    var taskHistory = getTaskHistory(task);
    updateItemHistConvert(note, taskHistory, 'task', 'note', ownerUUID);
  }

  function processTaskToListResponse(task, list, ownerUUID) {
    if (task.hist) list.hist = task.hist;
    ListsService.addList(list, ownerUUID);
    TasksService.removeTask(task.trans.uuid, ownerUUID);

    var taskHistory = getTaskHistory(task);
    updateItemHistConvert(list, taskHistory, 'task', 'list', ownerUUID);
  }

  function processNoteToTaskResponse(note, task, ownerUUID) {
    if (note.hist) task.hist = note.hist;
    TasksService.addTask(task, ownerUUID);
    NotesService.removeNote(note.trans.uuid, ownerUUID);

    var noteHistory = getNoteHistory(note);
    updateItemHistConvert(task, noteHistory, 'note', 'task', ownerUUID);
  }

  function processNoteToListResponse(note, list, ownerUUID) {
    if (note.hist) list.hist = note.hist;
    ListsService.addList(list, ownerUUID);
    NotesService.removeNote(note.trans.uuid, ownerUUID);

    var noteHistory = getNoteHistory(note);
    updateItemHistConvert(list, noteHistory, 'note', 'list', ownerUUID);
  }

  function processListToTaskResponse(list, task, ownerUUID) {
    if (list.hist) task.hist = list.hist;
    TasksService.addTask(task, ownerUUID);
    ListsService.removeList(list.trans.uuid, ownerUUID);
    updateItemHistConvert(task, undefined, 'list', 'task', ownerUUID);
  }

  function processListToNoteResponse(list, note, ownerUUID) {
    if (list.hist) note.hist = list.hist;
    NotesService.addNote(note, ownerUUID);
    ListsService.removeList(list.trans.uuid, ownerUUID);
    updateItemHistConvert(note, undefined, 'list', 'note', ownerUUID);
  }

  function removeList(item) {
    if (item.trans.list) item.trans.list = undefined;
  }

  function getTaskHistory(task) {
    if (task.trans.due || task.trans.repeating || task.trans.reminders || task.trans.completed) {
      var taskHistory = {};
      if (task.trans.completed) taskHistory.completed = task.trans.completed;
      if (task.trans.due) taskHistory.due = task.trans.due;
      if (task.trans.repeating) taskHistory.repeating = task.trans.repeating;
      if (task.trans.reminders) taskHistory.reminders = task.trans.reminders;
      return taskHistory;
    }
  }

  function getNoteHistory(note) {
    if (note.trans.favorited) return {favorited: note.trans.favorited};
  }

  /**
   * @description Update convert object to item's history.
   *
   * Convert object stores item's history during session.
   *
   * @param {Object}  item          The item to copy to.
   * @param {Object}  convert       The object to copy to item.
   * @param {string}  fromItemType  Type of the item converted from
   * @param {string}  toItemType    Type of the item converted to
   */
   function updateItemHistConvert(item, fromHistory, fromItemType, toItemType, ownerUUID) {

    var hist = item.hist ? item.hist : {};
    // Delete existing 'toItemType' convert object because it may be out of sync
    var updated = false;
    if (hist.convert && hist.convert[toItemType]){
      delete hist.convert[toItemType];
      if (jQuery.isEmptyObject(hist.convert)){
        delete hist.convert;
        if (jQuery.isEmptyObject(hist)){
          hist = undefined;
        }else{
          hist.convert = undefined;
        }
      }
      updated = true;
    }
    // Check that history object is not empty
    if (fromHistory && Object.getOwnPropertyNames(fromHistory).length > 0) {
      if (!hist) hist = {};
      if (!hist.convert) hist.convert = {};
      hist.convert[fromItemType] = fromHistory;
      updated = true;
    }

    if (updated){
      if (toItemType === 'task'){
        TasksService.updateTaskHistProperties(item.trans.uuid, hist, ownerUUID);
      }else if (toItemType === 'note'){
        NotesService.updateNoteHistProperties(item.trans.uuid, hist, ownerUUID);
      }else if (toItemType === 'list'){
        ListsService.updateListHistProperties(item.trans.uuid, hist, ownerUUID);
      }
    }
  }

  function getNewItemSkeleton(item, timestamp){
    var newItem = {
      mod: {
        uuid: item.trans.uuid,
        title: item.trans.title,
        created: item.trans.created,
        modified: timestamp
      }
    };
    if (item.trans.link) newItem.mod.link = item.trans.link;
    if (item.mod && item.mod.hasOwnProperty('relationships')) {
      newItem.mod.relationships = item.mod.relationships;
    }
    else if (item.relationships) newItem.mod.relationships = item.relationships;
    return newItem;
  }

  function createNoteUsingHistConvert(item, timestamp){
    var note = getNewItemSkeleton(item, timestamp);
    if (item.trans.description) note.mod.content = item.trans.description;
    if (item.hist && item.hist.convert && item.hist.convert.note && item.hist.convert.note.favorited) {
      note.mod.favorited = item.hist.convert.note.favorited;
    }
    return note;
  }

  function createListUsingHistConvert(item, timestamp){
    var list = getNewItemSkeleton(item, timestamp);
    if (item.trans.content) list.mod.description = item.trans.content;
    else if (item.trans.description) list.mod.description = item.trans.description;
    return list;
  }

  function createTaskUsingHistConvert(item, timestamp){
    var task = getNewItemSkeleton(item, timestamp);
    if (item.trans.content) task.mod.description = item.trans.content;
    else if (item.trans.description) task.mod.description = item.trans.description;

    if (item.hist && item.hist.convert && item.hist.convert.task) {
      if (item.hist.convert.task.completed) task.mod.completed = item.hist.convert.task.completed;
      if (item.hist.convert.task.due) task.mod.due = item.hist.convert.task.due;
      if (item.hist.convert.task.repeating) task.mod.repeating = item.hist.convert.task.repeating;
      if (item.hist.convert.task.reminders) task.mod.reminders = item.hist.convert.task.reminders;
    }
    return task;
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
      var deferred = $q.defer();
      if (TasksService.getTaskStatus(task) === 'deleted') {
        deferred.reject({type: 'deleted'});
      } else if (task.trans.reminders) {
        deferred.reject({type: 'reminders'});
      } else {
        var path = '/api/' + ownerUUID + '/task/' + task.trans.uuid + '/note';
        var transportTask = ItemLikeService.prepareTransport(task, 'task',
                                                             ownerUUID, TasksService.taskFieldInfos);
        var params = {
          type: 'task', owner: ownerUUID, uuid: task.trans.uuid, lastReplaceable: false
        };
        var fakeTimestamp = BackendClientService.generateFakeTimestamp();
        BackendClientService.postOffline(path, this.convertTaskToNoteRegex,
                                         params, transportTask, fakeTimestamp);
        var note = createNoteUsingHistConvert(task, fakeTimestamp);
        processTaskToNoteResponse(task, note, ownerUUID);
        deferred.resolve(note);
      }
      return deferred.promise;
    },
    finishTaskToListConvert: function(task, ownerUUID) {
      var deferred = $q.defer();

      if (TasksService.getTaskStatus(task) === 'deleted') {
        deferred.reject({type: 'deleted'});
      } else if (task.trans.reminders) {
        deferred.reject({type: 'reminders'});
      } else {
        // NOTE: Currently only one-level lists are supported.
        // Remove pre-existing list before converting to list.
        removeList(task);
        var path = '/api/' + ownerUUID + '/task/' + task.trans.uuid + '/list';
        var transportTask = ItemLikeService.prepareTransport(task, 'task',
                                                             ownerUUID, TasksService.taskFieldInfos);
        var params = {
          type: 'task', owner: ownerUUID, uuid: task.trans.uuid, lastReplaceable: false
        };
        var fakeTimestamp = BackendClientService.generateFakeTimestamp();
        BackendClientService.postOffline(path, this.convertTaskToListRegex,
                                         params, transportTask, fakeTimestamp);
        var list = createListUsingHistConvert(task, fakeTimestamp);
        processTaskToListResponse(task, list, ownerUUID);
        deferred.resolve(list);
      }
      return deferred.promise;
    },
    finishNoteToTaskConvert: function(note, ownerUUID) {
      var deferred = $q.defer();

      if (NotesService.getNoteStatus(note) === 'deleted') {
        deferred.reject({type: 'deleted'});
      } else {
        var path = '/api/' + ownerUUID + '/note/' + note.trans.uuid + '/task';
        var transportNote = ItemLikeService.prepareTransport(note, 'note',
                                                             ownerUUID, NotesService.noteFieldInfos);
        var params = {
          type: 'note', owner: ownerUUID, uuid: note.trans.uuid, lastReplaceable: false
        };
        var fakeTimestamp = BackendClientService.generateFakeTimestamp();
        BackendClientService.postOffline(path, this.convertNoteToTaskRegex,
                                         params, transportNote, fakeTimestamp);
        var task = createTaskUsingHistConvert(note, fakeTimestamp);
        processNoteToTaskResponse(note, task, ownerUUID);
        deferred.resolve(task);
      }
      return deferred.promise;
    },
    finishNoteToListConvert: function(note, ownerUUID) {
      var deferred = $q.defer();
      if (NotesService.getNoteStatus(note) === 'deleted') {
        deferred.reject({type: 'deleted'});
      } else {
        // NOTE: Currently only one-level lists are supported.
        // Remove pre-existing list before convertin to list.
        removeList(note);

        var path = '/api/' + ownerUUID + '/note/' + note.trans.uuid + '/list';
        var transportNote = ItemLikeService.prepareTransport(note, 'note',
                                                             ownerUUID, NotesService.noteFieldInfos);
        var params = {
          type: 'note', owner: ownerUUID, uuid: note.trans.uuid, lastReplaceable: false
        };
        var fakeTimestamp = BackendClientService.generateFakeTimestamp();
        BackendClientService.postOffline(path, this.convertNoteToListRegex,
                                         params, transportNote, fakeTimestamp);
        var list = createListUsingHistConvert(note, fakeTimestamp);
        processNoteToListResponse(note, list, ownerUUID);
        deferred.resolve(list);
      }
      return deferred.promise;
    },
    finishListToTaskConvert: function(list, ownerUUID) {
      var deferred = $q.defer();
      if (ListsService.getListStatus(list) === 'deleted') {
        deferred.reject({type: 'deleted'});
      } else if (TasksService.isTasksWithList(list) ||
                 NotesService.isNotesWithList(list))
      {
        deferred.reject({type: 'parent'});
      } else {
        var path = '/api/' + ownerUUID + '/list/' + list.trans.uuid + '/task';
        var transportList = ItemLikeService.prepareTransport(list, 'list',
                                                             ownerUUID, ListsService.listFieldInfos);
        var params = {
          type: 'list', owner: ownerUUID, uuid: list.trans.uuid, lastReplaceable: false
        };
        var fakeTimestamp = BackendClientService.generateFakeTimestamp();
        BackendClientService.postOffline(path, this.convertListToTaskRegex,
                                         params, transportList, fakeTimestamp);
        var task = createTaskUsingHistConvert(list, fakeTimestamp);
        processListToTaskResponse(list, task, ownerUUID);
        deferred.resolve(task);
      }
      return deferred.promise;
    },
    finishListToNoteConvert: function(list, ownerUUID) {
      var deferred = $q.defer();
      if (ListsService.getListStatus(list) === 'deleted') {
        deferred.reject({type: 'deleted'});
      } else if (TasksService.isTasksWithList(list) ||
                 NotesService.isNotesWithList(list))
      {
        deferred.reject({type: 'parent'});
      } else {
        var path = '/api/' + ownerUUID + '/list/' + list.trans.uuid + '/note';
        var transportList = ItemLikeService.prepareTransport(list, 'list',
                                                             ownerUUID, ListsService.listFieldInfos);
        var params = {
          type: 'list', owner: ownerUUID, uuid: list.trans.uuid, lastReplaceable: false
        };
        var fakeTimestamp = BackendClientService.generateFakeTimestamp();
        BackendClientService.postOffline(path, this.convertListToNoteRegex,
                                         params, transportList, fakeTimestamp);
        var note = createNoteUsingHistConvert(list, fakeTimestamp);
        processListToNoteResponse(list, note, ownerUUID);
        deferred.resolve(note);
      }
      return deferred.promise;
    },
    convertTaskToNoteRegex: new RegExp('^' +
                                       BackendClientService.apiPrefixRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       taskSlashRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       noteRegex.source +
                                       '$'),

    convertTaskToListRegex: new RegExp('^' +
                                       BackendClientService.apiPrefixRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       taskSlashRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       listRegex.source +
                                       '$'),

    convertNoteToTaskRegex: new RegExp('^' +
                                       BackendClientService.apiPrefixRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       noteSlashRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       taskRegex.source +
                                       '$'),

    convertNoteToListRegex: new RegExp('^' +
                                       BackendClientService.apiPrefixRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       noteSlashRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       listRegex.source +
                                       '$'),

    convertListToTaskRegex: new RegExp('^' +
                                       BackendClientService.apiPrefixRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       listSlashRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       taskRegex.source +
                                       '$'),
    convertListToNoteRegex: new RegExp('^' +
                                       BackendClientService.apiPrefixRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       listSlashRegex.source +
                                       BackendClientService.uuidRegex.source +
                                       noteRegex.source +
                                       '$')
  };
}
ConvertService['$inject'] = ['$q', 'BackendClientService', 'ExtendedItemService', 'ItemLikeService',
'ListsService', 'NotesService', 'TasksService'];
angular.module('em.main').factory('ConvertService', ConvertService);
