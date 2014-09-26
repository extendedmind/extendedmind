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
 /*global beforeEach, getJSONFixture, module, inject, describe, afterEach, it, expect */
 'use strict';

 describe('TasksService', function() {

  // INJECTS

  var $httpBackend;
  var TasksService, BackendClientService, HttpClientService, ListsService;

  // MOCKS

  var now = new Date();
  var putNewTaskResponse = getJSONFixture('putTaskResponse.json');
  putNewTaskResponse.created = putNewTaskResponse.modified = now.getTime();
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

  var testOwnerUUID = '6be16f46-7b35-4b2d-b875-e13d19681e77';

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    inject(function (_$httpBackend_, _TasksService_, _BackendClientService_, _HttpClientService_, _ListsService_) {
      $httpBackend = _$httpBackend_;
      TasksService = _TasksService_;
      BackendClientService = _BackendClientService_;
      HttpClientService = _HttpClientService_;
      ListsService = _ListsService_;
      TasksService.setTasks(
        [{
          'uuid': '7a612ca2-7de0-45ad-a758-d949df37f51e',
          'created': 1391278509745,
          'modified': 1391278509745,
          'title': 'write essay body',
          'due': '2014-03-09',
          'relationships': {
            'parent': '0a9a7ba1-3f1c-4541-842d-cff4d226628e'
          }
        }, {
          'uuid': '7b53d509-853a-47de-992c-c572a6952629',
          'created': 1391278509698,
          'modified': 1391278509698,
          'title': 'clean closet'
        }, {
          'uuid': '9a1ce3aa-f476-43c4-845e-af59a9a33760',
          'created': 1391278509717,
          'modified': 1391278509717,
          'title': 'print tickets',
          'link': 'http://www.finnair.fi',
          'due': '2014-01-02',
          'reminder': '10:00',
          'relationships': {
            'parent': 'dbff4507-927d-4f99-940a-ee0cfcf6e84c',
            'tags': ['8bd8376c-6257-4623-9c8f-7ca8641d2cf5']
          }
        }], testOwnerUUID);
    });
});

afterEach(function() {
  $httpBackend.verifyNoOutstandingExpectation();
  $httpBackend.verifyNoOutstandingRequest();
});

  // TESTS

  it('should get tasks', function () {
    var tasks = TasksService.getTasks(testOwnerUUID);
    expect(tasks.length)
    .toBe(3);
    // Tasks should be in modified order
    expect(tasks[0].title).toBe('clean closet');
    expect(tasks[1].title).toBe('print tickets');
    expect(tasks[2].title).toBe('write essay body');
  });

  it('should find task by uuid', function () {
    expect(TasksService.getTaskByUUID('7b53d509-853a-47de-992c-c572a6952629', testOwnerUUID))
    .toBeDefined();
  });

  it('should not find task by unknown uuid', function () {
    expect(TasksService.getTaskByUUID('bf726d03-8fee-4614-8b68-f9f885938a50', testOwnerUUID))
    .toBeUndefined();
  });

  it('should save new task', function () {
    var testTask = {
      'title': 'test task'
    };
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/task', testTask)
    .respond(200, putNewTaskResponse);
    TasksService.saveTask(testTask, testOwnerUUID);
    $httpBackend.flush();
    expect(TasksService.getTaskByUUID(putNewTaskResponse.uuid, testOwnerUUID))
    .toBeDefined();

    // Should go to the end of the array
    var tasks = TasksService.getTasks(testOwnerUUID);
    expect(tasks.length)
    .toBe(4);
    expect(tasks[3].uuid)
    .toBe(putNewTaskResponse.uuid);
  });

  it('should update existing task', function () {
    var cleanCloset = TasksService.getTaskByUUID('7b53d509-853a-47de-992c-c572a6952629', testOwnerUUID);
    cleanCloset.title = 'clean closet now';
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/task/' + cleanCloset.uuid, cleanCloset)
    .respond(200, putExistingTaskResponse);
    TasksService.saveTask(cleanCloset, testOwnerUUID);
    $httpBackend.flush();
    expect(TasksService.getTaskByUUID(cleanCloset.uuid, testOwnerUUID).modified)
    .toBe(putExistingTaskResponse.modified);

    // Should stay iin its old place
    var tasks = TasksService.getTasks(testOwnerUUID);
    expect(tasks.length)
    .toBe(3);
    expect(tasks[0].uuid)
    .toBe(cleanCloset.uuid);
  });

  it('should delete and undelete task', function () {
    var cleanCloset = TasksService.getTaskByUUID('7b53d509-853a-47de-992c-c572a6952629', testOwnerUUID);
    $httpBackend.expectDELETE('/api/' + testOwnerUUID + '/task/' + cleanCloset.uuid)
    .respond(200, deleteTaskResponse);
    TasksService.deleteTask(cleanCloset, testOwnerUUID);
    $httpBackend.flush();
    expect(TasksService.getTaskByUUID(cleanCloset.uuid, testOwnerUUID))
    .toBeUndefined();

    // There should be just two left
    var tasks = TasksService.getTasks(testOwnerUUID);
    expect(tasks.length)
    .toBe(2);

    // Undelete the task
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/task/' + cleanCloset.uuid + '/undelete')
    .respond(200, undeleteTaskResponse);
    TasksService.undeleteTask(cleanCloset, testOwnerUUID);
    $httpBackend.flush();
    expect(TasksService.getTaskByUUID(cleanCloset.uuid, testOwnerUUID).modified)
    .toBe(undeleteTaskResponse.modified);

    // There should be three left with the undeleted cleanCloset in its old place
    tasks = TasksService.getTasks(testOwnerUUID);
    expect(tasks.length)
    .toBe(3);
    expect(tasks[0].uuid)
    .toBe(cleanCloset.uuid);
  });


it('should complete and uncomplete task', function () {
    // Complete
    var cleanCloset = TasksService.getTaskByUUID('7b53d509-853a-47de-992c-c572a6952629', testOwnerUUID);

    expect(TasksService.getTasks(testOwnerUUID).length)
    .toBe(3);

    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/task/' + cleanCloset.uuid + '/complete')
    .respond(200, completeTaskResponse);
    TasksService.completeTask(cleanCloset, testOwnerUUID);
    $httpBackend.flush();

    // The task should be active and in its old place, but with the complete flag set
    expect(TasksService.getTaskByUUID(cleanCloset.uuid, testOwnerUUID).completed)
    .toBeDefined();
    expect(TasksService.getTasks(testOwnerUUID)[0].uuid)
    .toBe(cleanCloset.uuid);
    expect(TasksService.getTasks(testOwnerUUID).length)
    .toBe(3);

    // Uncomplete
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/task/' + cleanCloset.uuid + '/uncomplete')
    .respond(200, uncompleteTaskResponse);
    TasksService.uncompleteTask(cleanCloset, testOwnerUUID);
    $httpBackend.flush();

    expect(TasksService.getTaskByUUID(cleanCloset.uuid, testOwnerUUID).completed)
        .toBeUndefined();
    var tasks = TasksService.getTasks(testOwnerUUID);
    expect(tasks.length)
    .toBe(3);

    expect(tasks[0].uuid)
    .toBe(cleanCloset.uuid);
    expect(tasks[0].modified)
    .toBe(cleanCloset.modified);
  });

it('should reset task', function () {
  var printTickets = TasksService.getTaskByUUID('9a1ce3aa-f476-43c4-845e-af59a9a33760', testOwnerUUID);

    // Change transient values
    printTickets.transientProperties.date = '3014-01-02';
    printTickets.transientProperties.list = 'ebff4507-927d-4f99-940a-ee0cfcf6e84c';

    // Reset task
    TasksService.resetTask(printTickets, testOwnerUUID);

    // Values should be back to their original values
    expect(printTickets.transientProperties.date).toBe('2014-01-02');
    expect(printTickets.transientProperties.list).toBe('dbff4507-927d-4f99-940a-ee0cfcf6e84c');
  });
});
