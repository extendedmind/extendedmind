/* Copyright 2013-2016 Extended Mind Technologies Oy
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

 /*global angular */
 'use strict';

 function MockConvertBackendService($httpBackend, ConvertService, TasksService, NotesService, ListsService) {

  function mockConvertTaskToNote(expectResponse) {
    $httpBackend.whenPOST(ConvertService.convertTaskToNoteRegex)
    .respond(function(method, url, data, headers) {
      var ownerUUID = url.substr(5, 36);
      var taskUUID = url.substr(47, 36);
      var task = TasksService.getTaskInfo(taskUUID, ownerUUID) ?
                    TasksService.getTaskInfo(taskUUID, ownerUUID).task :
                    NotesService.getNoteInfo(taskUUID, ownerUUID).note;
      var note = {
        uuid: task.trans.uuid,
        title: task.trans.title,
        created: task.trans.created,
        modified:  Date.now()
      };
      if (task.trans.description) note.content = task.trans.description;
      if (task.mod && task.mod.relationships) note.relationships = task.mod.relationships;
      else if (task.relationships) note.relationships = task.relationships;
      return expectResponse(method, url, data, headers, note);
    });
  }

  function mockConvertTaskToList(expectResponse) {
    $httpBackend.whenPOST(ConvertService.convertTaskToListRegex)
    .respond(function(method, url, data, headers) {
      var ownerUUID = url.substr(5, 36);
      var taskUUID = url.substr(47, 36);
      var task = TasksService.getTaskInfo(taskUUID, ownerUUID) ?
                    TasksService.getTaskInfo(taskUUID, ownerUUID).task :
                    ListsService.getListInfo(taskUUID, ownerUUID).list;
      var list = {
        uuid: task.trans.uuid,
        title: task.trans.title,
        created: task.trans.created,
        modified:  Date.now()
      };
      if (task.trans.description) list.description = task.trans.description;
      if (task.mod && task.mod.relationships) list.relationships = task.mod.relationships;
      else if (task.relationships) list.relationships = task.relationships;
      return expectResponse(method, url, data, headers, list);
    });
  }

  function mockConvertNoteToTask(expectResponse) {
    $httpBackend.whenPOST(ConvertService.convertNoteToTaskRegex)
    .respond(function(method, url, data, headers) {
      var ownerUUID = url.substr(5, 36);
      var noteUUID = url.substr(47, 36);
      var note = NotesService.getNoteInfo(noteUUID, ownerUUID) ?
                    NotesService.getNoteInfo(noteUUID, ownerUUID).task :
                    TasksService.getTaskInfo(noteUUID, ownerUUID).task;
      var task = {
        uuid: note.trans.uuid,
        title: note.trans.title,
        created: note.trans.created,
        modified:  Date.now()
      };
      if (note.trans.content) task.description = note.trans.content;
      if (note.mod && note.mod.relationships) task.relationships = note.mod.relationships;
      else if (note.relationships) task.relationships = note.relationships;
      return expectResponse(method, url, data, headers, note);
    });
  }

  function mockConvertNoteToList(expectResponse) {
    $httpBackend.whenPOST(ConvertService.convertNoteToListRegex)
    .respond(function(method, url, data, headers) {
      var ownerUUID = url.substr(5, 36);
      var noteUUID = url.substr(47, 36);
      var note = NotesService.getNoteInfo(noteUUID, ownerUUID) ?
                    NotesService.getNoteInfo(noteUUID, ownerUUID).note :
                    ListsService.getListInfo(noteUUID, ownerUUID).list;
      var list = {
        uuid: note.trans.uuid,
        title: note.trans.title,
        created: note.trans.created,
        modified:  Date.now()
      };
      if (note.trans.content) list.description = note.trans.content;
      if (note.mod && note.mod.relationships) list.relationships = note.mod.relationships;
      else if (note.relationships) list.relationships = note.relationships;
      return expectResponse(method, url, data, headers, list);
    });
  }

  function mockConvertListToTask(expectResponse) {
    $httpBackend.whenPOST(ConvertService.convertListToTaskRegex)
    .respond(function(method, url, data, headers) {
      var ownerUUID = url.substr(5, 36);
      var listUUID = url.substr(47, 36);
      var list = ListsService.getListInfo(listUUID, ownerUUID) ?
                    ListsService.getListInfo(listUUID, ownerUUID).list :
                    TasksService.getTaskInfo(listUUID, ownerUUID).task;
      var task = {
        uuid: list.trans.uuid,
        title: list.trans.title,
        created: list.trans.created,
        modified:  Date.now()
      };
      if (list.trans.description) task.description = list.trans.description;
      if (list.mod && list.mod.relationships) task.relationships = list.mod.relationships;
      else if (list.relationships) task.relationships = list.relationships;
      return expectResponse(method, url, data, headers, task);
    });
  }

  function mockConvertListToNote(expectResponse) {
    $httpBackend.whenPOST(ConvertService.convertListToNoteRegex)
    .respond(function(method, url, data, headers) {
      var ownerUUID = url.substr(5, 36);
      var listUUID = url.substr(47, 36);
      var list = ListsService.getListInfo(listUUID, ownerUUID) ?
                    ListsService.getListInfo(listUUID, ownerUUID).list :
                    NotesService.getNoteInfo(listUUID, ownerUUID).note;
      var note = {
        uuid: list.trans.uuid,
        title: list.trans.title,
        created: list.trans.created,
        modified:  Date.now()
      };
      if (list.trans.description) note.content = list.trans.description;
      if (list.mod && list.mod.relationships) note.relationships = list.mod.relationships;
      else if (list.relationships) note.relationships = list.relationships;
      return expectResponse(method, url, data, headers, note);
    });
  }

  return {
    mockConvertBackend: function(expectResponse) {
      mockConvertTaskToNote(expectResponse);
      mockConvertTaskToList(expectResponse);
      mockConvertNoteToTask(expectResponse);
      mockConvertNoteToList(expectResponse);
      mockConvertListToTask(expectResponse);
      mockConvertListToNote(expectResponse);
    }
  };
}

MockConvertBackendService['$inject'] = ['$httpBackend', 'ConvertService', 'TasksService', 'NotesService',
'ListsService'];
angular.module('em.appTest').factory('MockConvertBackendService', MockConvertBackendService);
