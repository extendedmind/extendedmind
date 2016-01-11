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

 /*global angular, getJSONFixture */
'use strict';

function MockTasksBackendService($httpBackend, TasksService, UUIDService) {

  function mockPutNewTask(expectResponse){
    $httpBackend.whenPUT(TasksService.putNewTaskRegex)
    .respond(function(method, url, data, headers) {
      var putNewTaskResponse = getJSONFixture('putTaskResponse.json');
      putNewTaskResponse.uuid = UUIDService.randomUUID();
      putNewTaskResponse.created = putNewTaskResponse.modified = (new Date()).getTime();
      return expectResponse(method, url, data, headers, putNewTaskResponse);
    });
  }

  function mockPutExistingTask(expectResponse){
    $httpBackend.whenPUT(TasksService.putExistingTaskRegex)
    .respond(function(method, url, data, headers) {
      var putExistingTaskResponse = getJSONFixture('putExistingTaskResponse.json');
      putExistingTaskResponse.modified = (new Date()).getTime();
      return expectResponse(method, url, data, headers, putExistingTaskResponse);
    });
  }

  function mockDeleteTask(expectResponse){
    $httpBackend.whenDELETE(TasksService.deleteTaskRegex)
    .respond(function(method, url, data, headers) {
      var deleteTaskResponse = getJSONFixture('deleteTaskResponse.json');
      deleteTaskResponse.result.modified = (new Date()).getTime();
      return expectResponse(method, url, data, headers, deleteTaskResponse);
    });
  }

  function mockUndeleteTask(expectResponse){
    $httpBackend.whenPOST(TasksService.undeleteTaskRegex)
    .respond(function(method, url, data, headers) {
      var undeleteTaskResponse = getJSONFixture('undeleteTaskResponse.json');
      undeleteTaskResponse.modified = (new Date()).getTime();
      return expectResponse(method, url, data, headers, undeleteTaskResponse);
    });
  }

  function mockCompleteTask(expectResponse){
    $httpBackend.whenPOST(TasksService.completeTaskRegex)
    .respond(function(method, url, data, headers) {
      var completeTaskResponse = getJSONFixture('completeTaskResponse.json');
      completeTaskResponse.result.modified = Date.now();
      completeTaskResponse.completed = Date.now();

      // Add generated to repeating task to better test task repeat logic
      var ownerUUID = url.substr(5, 36);
      var taskUUID = url.substr(47, 36);
      var task = TasksService.getTaskInfo(taskUUID, ownerUUID).task;
      if (task.hist && task.hist.generatedUUID){
        var modifiedTasks = TasksService.getModifiedTasks(ownerUUID);
        if (modifiedTasks){
          for (var i=0; i<modifiedTasks.length; i++){
            if (!modifiedTasks[i].uuid && modifiedTasks[i].mod &&
                modifiedTasks[i].mod.title === task.trans.title){
              completeTaskResponse.generated = modifiedTasks[i].mod;
              completeTaskResponse.generated.uuid = UUIDService.randomUUID();
              completeTaskResponse.generated.modified = Date.now();
              completeTaskResponse.generated.created = Date.now();
              break;
            }
          }
        }
      }

      return expectResponse(method, url, data, headers, completeTaskResponse);
    });
  }

  function mockUncompleteTask(expectResponse){
    $httpBackend.whenPOST(TasksService.uncompleteTaskRegex)
    .respond(function(method, url, data, headers) {
      var uncompleteTaskResponse = getJSONFixture('uncompleteTaskResponse.json');
      uncompleteTaskResponse.modified = (new Date()).getTime();
      return expectResponse(method, url, data, headers, uncompleteTaskResponse);
    });
  }

  return {
    mockTasksBackend: function(expectResponse) {
      mockPutNewTask(expectResponse);
      mockPutExistingTask(expectResponse);
      mockDeleteTask(expectResponse);
      mockUndeleteTask(expectResponse);
      mockCompleteTask(expectResponse);
      mockUncompleteTask(expectResponse);
    }
  };
}

MockTasksBackendService['$inject'] = ['$httpBackend', 'TasksService', 'UUIDService'];
angular.module('em.appTest').factory('MockTasksBackendService', MockTasksBackendService);
