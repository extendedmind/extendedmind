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
  var noteSlashRegex = /\/note\//;
  var taskRegex = /\/task/;

  var convertNoteToTaskRegexp = new RegExp(
    BackendClientService.apiPrefixRegex.source +
    BackendClientService.uuidRegex.source +
    noteSlashRegex.source +
    BackendClientService.uuidRegex.source +
    taskRegex.source);

  function noteExistsAndIsNotDeleted(note, ownerUUID) {
    var noteArrays = NotesService.getNoteArrays(ownerUUID);
    var noteIndex;

    // Find note from array
    for (var noteArray in noteArrays) {
      if (noteArrays.hasOwnProperty(noteArray)) {
        noteIndex = noteArrays[noteArray].findFirstIndexByKeyValue('uuid', note.uuid);
        // Return found note if it is not deleted.
        if (noteIndex !== undefined) return !NotesService.isNoteDeleted(noteArrays[noteArray][noteIndex]);
      }
    }
  }

  function postConvertNoteToTask(note, ownerUUID) {
    var path = '/api/' + ownerUUID + '/note/' + note.uuid + '/task';
    var params = {type: 'note', owner: ownerUUID, uuid: note.uuid};
    return BackendClientService.postOnline(path, convertNoteToTaskRegexp, params);
  }

  function processNoteToTaskResponse(note, task/*, transientProperties*/, ownerUUID) {

    var copyConvertToTaskTransientPropertiesFn;

    if (note.favorited) {
      var convert = {
        favorited: note.favorited
      };
      // NOTE: no need to pass this to the target function
      copyConvertToTaskTransientPropertiesFn = copyConvertToTaskTransientProperties.bind(undefined, task, convert);
    }

    function copyConvertToTaskTransientProperties(task, convert) {
      // NOTE: Delete task convert object because it may be out of sync before full offline implementation.
      if (task.transientProperties && task.transientProperties.convert) {
        if (task.transientProperties.convert.task) delete task.transientProperties.convert.task;
      }
      // Check that convert object is not empty
      if (convert && Object.getOwnPropertyNames(convert).length > 0) {
        if (!task.transientProperties) task.transientProperties = {};
        if (!task.transientProperties.convert) task.transientProperties.convert = {};
        task.transientProperties.convert.note = convert;
      }
    }

    TasksService.attachTransientProperties(task, ownerUUID, copyConvertToTaskTransientPropertiesFn);
    NotesService.removeNote(note, ownerUUID);
    TasksService.addTask(task, ownerUUID);
  }

  return {
    finishNoteToTaskConvert: function(note, ownerUUID) {
      // i. verify that note exists
      if (note.uuid) {
        if (noteExistsAndIsNotDeleted(note, ownerUUID)) {
          /*var transientProperties = */NotesService.detachTransientProperties(note, ownerUUID);
          // ii. convert to task
          postConvertNoteToTask(note, ownerUUID).then(function(result) {
            // iii. remove note and add task
            processNoteToTaskResponse(note, result.data/*, transientProperties*/, ownerUUID);
          });
        }
      } else {  // new note
        // convert note to task
      }
    },
    taskToList: function(task, ownerUUID) {
      // i.   verify that task exists
      // ii.  convert to list
      // iii. remove task and add list

      // initializeArrays(ownerUUID);
      // Check that task is not deleted before trying to turn it into a list
      // if (tasks[ownerUUID].deletedTasks.indexOf(task) > -1) {
        // return;
      // }

      // cleanRecentlyCompletedTasks(ownerUUID);
      // var index = tasks[ownerUUID].activeTasks.findFirstIndexByKeyValue('uuid', task.uuid);
      // if (index !== undefined && !task.reminder && !task.repeating && !task.completed) {
        // Save as list and remove from the activeTasks array
        ListsService.saveList(task, ownerUUID);
        TasksService.removeTask(task, ownerUUID);
        // tasks[ownerUUID].activeTasks.splice(index, 1);
      // }
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
