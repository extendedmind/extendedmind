/*global beforeEach, getJSONFixture, module, inject, describe, afterEach, it, expect */
'use strict';

describe('TaskService', function() {

  // INJECTS 

  var $httpBackend;
  var TasksService, BackendClientService, HttpBasicAuthenticationService, HttpClientService, ListsService;

  // MOCKS

  var now = new Date();
  var putNewTaskResponse = getJSONFixture('putTaskResponse.json');
  putNewTaskResponse.modified = now.getTime();
  var putExistingTaskResponse = getJSONFixture('putExistingTaskResponse.json');
  putExistingTaskResponse.modified = now.getTime();
  var deleteTaskResponse = getJSONFixture('deleteTaskResponse.json');
  deleteTaskResponse.result.modified = now.getTime();
  var undeleteTaskResponse = getJSONFixture('undeleteTaskResponse.json');
  undeleteTaskResponse.modified = now.getTime();
  var completeTaskResponse = getJSONFixture('completeTaskResponse.json');
  completeTaskResponse.result.modified = now.getTime();
  var uncompleteTaskResponse = getJSONFixture('uncompleteTaskResponse.json');
  uncompleteTaskResponse.modified = now.getTime();

  var MockUserSessionService = {
      latestModified: undefined,
      getCredentials: function () {
        return '123456789';
      },
      getActiveUUID: function () {
        return '6be16f46-7b35-4b2d-b875-e13d19681e77';
      },
      getLatestModified: function () {
        return this.latestModified;
      },
      setLatestModified: function (modified) {
        this.latestModified = modified;
      }
    };

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    module('em.services', function ($provide){
      $provide.value('UserSessionService', MockUserSessionService);
    });

    inject(function (_$httpBackend_, _TasksService_, _BackendClientService_, _HttpBasicAuthenticationService_, _HttpClientService_, _ListsService_) {
      $httpBackend = _$httpBackend_;
      TasksService = _TasksService_;
      BackendClientService = _BackendClientService_;
      HttpBasicAuthenticationService = _HttpBasicAuthenticationService_;
      HttpClientService = _HttpClientService_;
      ListsService = _ListsService_;
      TasksService.setTasks(
        [{
          'uuid': '7a612ca2-7de0-45ad-a758-d949df37f51e',
          'modified': 1391278509745,
          'title': 'write essay body',
          'due': '2014-03-09',
          'relationships': {
            'parent': '0a9a7ba1-3f1c-4541-842d-cff4d226628e'
          }
        }, {
          'uuid': '7b53d509-853a-47de-992c-c572a6952629',
          'modified': 1391278509698,
          'title': 'clean closet'
        }, {
          'uuid': '9a1ce3aa-f476-43c4-845e-af59a9a33760',
          'modified': 1391278509717,
          'title': 'print tickets',
          'link': 'http://www.finnair.fi',
          'due': '2014-01-02',
          'reminder': '10:00',
          'relationships': {
            'parent': 'dbff4507-927d-4f99-940a-ee0cfcf6e84c',
            'tags': ['8bd8376c-6257-4623-9c8f-7ca8641d2cf5']
          }
        }]);
    });
  });

  afterEach(function() {
    MockUserSessionService.setLatestModified(undefined);
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // TESTS

  it('should get tasks', function () {
    var tasks = TasksService.getTasks();
    expect(tasks.length)
      .toBe(3);
    // Tasks should be in modified order
    expect(tasks[0].title).toBe('clean closet');
    expect(tasks[1].title).toBe('print tickets');
    expect(tasks[2].title).toBe('write essay body');
  });

  it('should find task by uuid', function () {
    expect(TasksService.getTaskByUUID('7b53d509-853a-47de-992c-c572a6952629'))
      .toBeDefined();
  });

  it('should not find task by unknown uuid', function () {
    expect(TasksService.getTaskByUUID('bf726d03-8fee-4614-8b68-f9f885938a50'))
      .toBeUndefined();
  });

  it('should save new task', function () {
    var testTask = {
      'title': 'test task'
    };
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/task', testTask)
       .respond(200, putNewTaskResponse);
    TasksService.saveTask(testTask);
    $httpBackend.flush();
    expect(TasksService.getTaskByUUID(putNewTaskResponse.uuid))
      .toBeDefined();

    // Should go to the end of the array
    var tasks = TasksService.getTasks();
    expect(tasks.length)
      .toBe(4);
    expect(tasks[3].uuid)
      .toBe(putNewTaskResponse.uuid);
  });

  it('should update existing task', function () {
    var cleanCloset = TasksService.getTaskByUUID('7b53d509-853a-47de-992c-c572a6952629');
    cleanCloset.title = 'clean closet now';
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/task/' + cleanCloset.uuid, cleanCloset)
       .respond(200, putExistingTaskResponse);
    TasksService.saveTask(cleanCloset);
    $httpBackend.flush();
    expect(TasksService.getTaskByUUID(cleanCloset.uuid).modified)
      .toBe(putExistingTaskResponse.modified);

    // Should move to the end of the array
    var tasks = TasksService.getTasks();
    expect(tasks.length)
      .toBe(3);
    expect(tasks[2].uuid)
      .toBe(cleanCloset.uuid);
  });

  it('should delete and undelete task', function () {
    var cleanCloset = TasksService.getTaskByUUID('7b53d509-853a-47de-992c-c572a6952629');
    $httpBackend.expectDELETE('/api/' + MockUserSessionService.getActiveUUID() + '/task/' + cleanCloset.uuid)
       .respond(200, deleteTaskResponse);
    TasksService.deleteTask(cleanCloset);
    $httpBackend.flush();
    expect(TasksService.getTaskByUUID(cleanCloset.uuid))
      .toBeUndefined();

    // There should be just two left
    var tasks = TasksService.getTasks();
    expect(tasks.length)
      .toBe(2);

    // Undelete the task
    $httpBackend.expectPOST('/api/' + MockUserSessionService.getActiveUUID() + '/task/' + cleanCloset.uuid + '/undelete')
       .respond(200, undeleteTaskResponse);
    TasksService.undeleteTask(cleanCloset);
    $httpBackend.flush();
    expect(TasksService.getTaskByUUID(cleanCloset.uuid).modified)
      .toBe(undeleteTaskResponse.modified);

    // There should be three left with the undeleted cleanCloset the last
    tasks = TasksService.getTasks();
    expect(tasks.length)
      .toBe(3);
    expect(tasks[2].uuid)
      .toBe(cleanCloset.uuid);
  });


  it('should complete and uncomplete task', function () {
    // Complete
    var cleanCloset = TasksService.getTaskByUUID('7b53d509-853a-47de-992c-c572a6952629');
    expect(TasksService.getCompletedTasks().length)
      .toBe(0);
    
    $httpBackend.expectPOST('/api/' + MockUserSessionService.getActiveUUID() + '/task/' + cleanCloset.uuid + '/complete')
       .respond(200, completeTaskResponse);
    TasksService.completeTask(cleanCloset);
    $httpBackend.flush();
    
    // The task should still be active and in its old place, but with the complete flag set
    expect(TasksService.getTaskByUUID(cleanCloset.uuid).completed)
      .toBeDefined();
    expect(TasksService.getTasks()[0].uuid)
      .toBe(cleanCloset.uuid);
    expect(TasksService.getTasks().length)
      .toBe(3);
    expect(TasksService.getCompletedTasks().length)
      .toBe(1);

    // Uncomplete
    $httpBackend.expectPOST('/api/' + MockUserSessionService.getActiveUUID() + '/task/' + cleanCloset.uuid + '/uncomplete')
       .respond(200, uncompleteTaskResponse);
    TasksService.uncompleteTask(cleanCloset);
    $httpBackend.flush();

    // The task should be back as last element
    expect(TasksService.getTaskByUUID(cleanCloset.uuid))
      .toBeDefined();
    var tasks = TasksService.getTasks();
    expect(tasks.length)
      .toBe(3);
    expect(TasksService.getCompletedTasks().length)
      .toBe(0);
    expect(tasks[2].uuid)
      .toBe(cleanCloset.uuid);
    expect(tasks[2].modified)
      .toBe(uncompleteTaskResponse.modified);
  });

  it('should convert task to list', function () {
    var cleanCloset = TasksService.getTaskByUUID('7b53d509-853a-47de-992c-c572a6952629');
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/list/' + cleanCloset.uuid)
       .respond(200, putExistingTaskResponse);
    TasksService.taskToList(cleanCloset);
    $httpBackend.flush();
    expect(TasksService.getTaskByUUID(cleanCloset.uuid))
      .toBeUndefined();

    // There should be just two left
    expect(TasksService.getTasks().length)
      .toBe(2);

    // Lists should have the new item
    expect(ListsService.getListByUUID(cleanCloset.uuid))
      .toBeDefined();
    expect(ListsService.getLists().length)
      .toBe(1);
  });
});
