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

 function ConvertService(BackendClientService) {
  var noteSlashRegex = /\/note\//;
  var taskRegex = /\/task/;

  return {
    convertNoteToTask: function(note, ownerUUID) {
      // NOTE: should initializeArrays be called?

      // removeNote
      // addNote

      var path = '/api/' + ownerUUID + '/note/' + note.uuid + '/task';
      var params = {type: 'note', owner: ownerUUID, uuid: note.uuid};
      BackendClientService.postOnline(path, this.convertNoteToTaskRegex, params).then(function(/*result*/) {
        // TODO: something with the resutl
      });
    },
    taskToList: function(/*task, ownerUUID*/) {
      // initializeArrays(ownerUUID);
      // Check that task is not deleted before trying to turn it into a list
      // if (tasks[ownerUUID].deletedTasks.indexOf(task) > -1) {
        // return;
      // }

      // cleanRecentlyCompletedTasks(ownerUUID);
      // var index = tasks[ownerUUID].activeTasks.findFirstIndexByKeyValue('uuid', task.uuid);
      // if (index !== undefined && !task.reminder && !task.repeating && !task.completed) {
        // Save as list and remove from the activeTasks array
        // ListsService.saveList(task, ownerUUID);
        // tasks[ownerUUID].activeTasks.splice(index, 1);
      // }
    },

    convertNoteToTaskRegex: new RegExp(
      BackendClientService.apiPrefixRegex.source +
      BackendClientService.uuidRegex.source +
      noteSlashRegex.source +
      BackendClientService.uuidRegex.source +
      taskRegex.source)
  };
}
ConvertService['$inject'] = ['BackendClientService'];
angular.module('em.services').factory('ConvertService', ConvertService);
