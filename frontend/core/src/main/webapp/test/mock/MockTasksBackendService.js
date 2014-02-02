/*global angular, getJSONFixture */
'use strict';

function MockTasksBackendService($httpBackend, TasksService, UUIDService) {

  function mockPutNewTask(expectResponse){
    $httpBackend.whenPUT(TasksService.putNewTaskRegex)
      .respond(function(method, url, data, headers) {
        var putNewTaskResponse = getJSONFixture('putTaskResponse.json');
        putNewTaskResponse.uuid = UUIDService.randomUUID();
        putNewTaskResponse.modified = (new Date()).getTime();
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
        completeTaskResponse.result.modified = (new Date()).getTime();
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

MockTasksBackendService.$inject = ['$httpBackend', 'TasksService', 'UUIDService'];
angular.module('em.appTest').factory('MockTasksBackendService', MockTasksBackendService);
