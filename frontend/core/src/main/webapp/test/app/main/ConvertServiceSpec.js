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

 describe('ConvertService', function() {

  // INJECTS

  var $httpBackend;
  var ConvertService, ListsService, NotesService, TasksService;

  // MOCKS

  var testOwnerUUID = '6be16f46-7b35-4b2d-b875-e13d19681e77';
  var now = new Date();

  var noteToTaskResponse = getJSONFixture('noteToTaskResponse.json');
  noteToTaskResponse.modified = now.getTime();

  var putExistingTaskResponse = getJSONFixture('putExistingTaskResponse.json');
  putExistingTaskResponse.modified = now.getTime();

  var putNewTaskResponse = getJSONFixture('putTaskResponse.json');
  putNewTaskResponse.created = putNewTaskResponse.modified = now.getTime();

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    inject(function(_$httpBackend_, _ConvertService_, _ListsService_, _NotesService_, _TasksService_) {
      $httpBackend = _$httpBackend_;
      ConvertService = _ConvertService_;
      ListsService = _ListsService_;
      NotesService = _NotesService_;
      TasksService = _TasksService_;

      NotesService.setNotes(
        [{
          'uuid': 'a1cd149a-a287-40a0-86d9-0a14462f22d6',
          'created': 1391627811070,
          'modified': 1391627811070,
          'title': 'contexts could be used to prevent access to data'
        },{
          'uuid': 'c2cd149a-a287-40a0-86d9-0a14462f22d6',
          'created': 1391627811050,
          'modified': 1391627811050,
          'title': 'office door code',
          'content': '4321',
          'relationships': {
            'tags': ['c933e120-90e7-488b-9f15-ea2ee2887e67']
          }
        }], testOwnerUUID);

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

it('should convert existing note to task', function() {
  // SETUP
  var officeDoorCode = NotesService.getNoteByUUID('c2cd149a-a287-40a0-86d9-0a14462f22d6', testOwnerUUID);
  var noteToTaskPath = '/api/' + testOwnerUUID + '/note/' + officeDoorCode.uuid + '/task';
  noteToTaskResponse.uuid = officeDoorCode.uuid;
  $httpBackend.expectPOST(noteToTaskPath).respond(200, noteToTaskResponse);

  // EXECUTE
  ConvertService.finishNoteToTaskConvert(officeDoorCode, testOwnerUUID);
  $httpBackend.flush();

  // TESTS
  var notes = NotesService.getNotes(testOwnerUUID);

  // There should not be a note with converted note's UUID
  expect(NotesService.getNoteByUUID(officeDoorCode.uuid, testOwnerUUID))
  .toBeUndefined();

  // Note should not be in notes array
  expect(notes.length)
  .toBe(1);

  expect(TasksService.getTaskByUUID(noteToTaskResponse.uuid, testOwnerUUID))
  .toBeDefined();
  expect(TasksService.getTasks(testOwnerUUID).length)
  .toBe(4);
});

it('should convert task to list', function () {
  var cleanCloset = TasksService.getTaskByUUID('7b53d509-853a-47de-992c-c572a6952629', testOwnerUUID);
  var taskToListPath = '/api/' + testOwnerUUID + '/list/' + cleanCloset.uuid;
  $httpBackend.expectPUT(taskToListPath).respond(200, putExistingTaskResponse);

  // Convert task to list
  ConvertService.taskToList(cleanCloset, testOwnerUUID);
  $httpBackend.flush();

  expect(TasksService.getTaskByUUID(cleanCloset.uuid, testOwnerUUID))
  .toBeUndefined();

  // There should be just two left
  expect(TasksService.getTasks(testOwnerUUID).length)
  .toBe(2);

  // Lists should have the new item
  expect(ListsService.getListByUUID(cleanCloset.uuid, testOwnerUUID))
  .toBeDefined();
  expect(ListsService.getLists(testOwnerUUID).length)
  .toBe(1);
});

});
