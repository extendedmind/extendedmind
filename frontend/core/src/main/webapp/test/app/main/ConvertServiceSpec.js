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
  var ConvertService, ListsService, NotesService, TagsService, TasksService, UserSessionService;

  // MOCKS

  var testOwnerUUID = '6be16f46-7b35-4b2d-b875-e13d19681e77';
  var now = new Date();

  var noteToTaskResponse = getJSONFixture('noteToTaskResponse.json');
  noteToTaskResponse.modified = now.getTime();

  var noteToListResponse = getJSONFixture('noteToListResponse.json');
  noteToListResponse.modified = now.getTime();

  var taskToNoteResponse = getJSONFixture('taskToNoteResponse.json');
  taskToNoteResponse.modified = now.getTime();

  var taskToListResponse = getJSONFixture('taskToListResponse.json');
  taskToListResponse.modified = now.getTime();

  var listToNoteResponse = getJSONFixture('listToNoteResponse.json');
  listToNoteResponse.modified = now.getTime();

  var listToTaskResponse = getJSONFixture('listToTaskResponse.json');
  listToTaskResponse.modified = now.getTime();

  var deleteTaskResponse = getJSONFixture('deleteTaskResponse.json');
  deleteTaskResponse.result.modified = now.getTime();

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    inject(function(_$httpBackend_, _ConvertService_, _ListsService_, _NotesService_, _TagsService_,
           _TasksService_, _UserSessionService_) {
      $httpBackend = _$httpBackend_;
      ConvertService = _ConvertService_;
      ListsService = _ListsService_;
      NotesService = _NotesService_;
      TagsService = _TagsService_;
      TasksService = _TasksService_;
      UserSessionService = _UserSessionService_;
      UserSessionService.executeNotifyOwnerCallbacks(testOwnerUUID);

      ListsService.setLists(
        [{
          'uuid': '0da0bff6-3bd7-4884-adba-f47fab9f270d',
          'created': 1390912600957,
          'modified': 1390912600957,
          'title': 'extended mind technologies',
          'link': 'http://ext.md'
        }, {
          'uuid': 'bf726d03-8fee-4614-8b68-f9f885938a51',
          'created': 1390912600947,
          'modified': 1390912600947,
          'title': 'trip to Dublin',
          'completable': true,
          'due': '2013-10-31'
        }, {
          'uuid': '07bc96d1-e8b2-49a9-9d35-1eece6263f98',
          'created': 1390912600983,
          'modified': 1390912600983,
          'title': 'write essay on cognitive biases',
          'completable': true
        }], testOwnerUUID);

      TagsService.setTags(
        [{
          'uuid': '1208d45b-3b8c-463e-88f3-f7ef19ce87cd',
          'created': 1391066914167,
          'modified': 1391066914167,
          'title': 'home',
          'tagType': 'context'
        }, {
          'uuid': '81daf688-d34d-4551-9a24-564a5861ace9',
          'created': 1391066914032,
          'modified': 1391066914032,
          'title': 'email',
          'tagType': 'context',
          'parent': 'e1bc540a-97fe-4c9f-9a44-ffcd7a8563e8'
        }, {
          'uuid': 'c933e120-90e7-488b-9f15-ea2ee2887e67',
          'created': 1391066914132,
          'modified': 1391066914132,
          'title': 'secret',
          'tagType': 'keyword'
        }, {
          'uuid': '6350affa-1acf-4969-851a-9bf2b17806d6',
          'created': 1391066914132,
          'modified': 1391066914132,
          'title': 'productivity',
          'tagType': 'keyword'
        }], testOwnerUUID);

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
        }, {
          'uuid': '848cda60-d725-40cc-b756-0b1e9fa5b7d8',
          'created': 1391627811059,
          'modified': 1391627811059,
          'title': 'notes on productivity',
          'content': '##what I\'ve learned about productivity \n ' +
          '#focus \n' +
          'to get things done, you need to have uninterrupted time \n' +
          '#rhythm \n' +
          'work in high intensity sprints of 90 minutes, then break for 15 minutes \n' +
          '#rest \n' +
          'without ample rest and sleep, your productivity will decline rapidly' +
          '#tools \n' +
          'use the best possible tools for your work \n' +
          '#process \n' +
          'increasing your productivity doesn\'t happen overnight',
          'relationships': {
            'parent': '0da0bff6-3bd7-4884-adba-f47fab9f270d',
            'tags': ['6350affa-1acf-4969-851a-9bf2b17806d6']
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
      'tags': ['1208d45b-3b8c-463e-88f3-f7ef19ce87cd']
    }
  }], testOwnerUUID);
});
});

afterEach(function() {
  $httpBackend.verifyNoOutstandingExpectation();
  $httpBackend.verifyNoOutstandingRequest();
});

// TESTS

it('should convert existing task to note', function() {
  // SETUP
  var cleanCloset = TasksService.getTaskInfo('7b53d509-853a-47de-992c-c572a6952629', testOwnerUUID).task;
  var taskToNotePath = '/api/' + testOwnerUUID + '/task/' + cleanCloset.uuid + '/note';
  $httpBackend.expectPOST(taskToNotePath).respond(200, taskToNoteResponse);

  // EXECUTE
  ConvertService.finishTaskToNoteConvert(cleanCloset, testOwnerUUID);
  $httpBackend.flush();

  // TESTS
  expect(TasksService.getTaskInfo(cleanCloset.uuid, testOwnerUUID))
  .toBeUndefined();

  // There should be just two tasks left
  expect(TasksService.getTasks(testOwnerUUID).length)
  .toBe(2);

  // Notes should have the new item
  expect(NotesService.getNoteInfo(taskToNoteResponse.uuid, testOwnerUUID))
  .toBeDefined();
  expect(NotesService.getNotes(testOwnerUUID).length)
  .toBe(4);
});

it('should convert existing task to list', function() {
  // SETUP
  var cleanCloset = TasksService.getTaskInfo('7b53d509-853a-47de-992c-c572a6952629', testOwnerUUID).task;
  var taskToListPath = '/api/' + testOwnerUUID + '/task/' + cleanCloset.uuid + '/list';
  $httpBackend.expectPOST(taskToListPath).respond(200, taskToListResponse);

  // EXECUTE
  ConvertService.finishTaskToListConvert(cleanCloset, testOwnerUUID);
  $httpBackend.flush();

  // TESTS
  expect(TasksService.getTaskInfo(cleanCloset.uuid, testOwnerUUID))
  .toBeUndefined();

  // There should be just two left
  expect(TasksService.getTasks(testOwnerUUID).length)
  .toBe(2);

  // Lists should have the new item
  expect(ListsService.getListInfo(taskToListResponse.uuid, testOwnerUUID))
  .toBeDefined();
  expect(ListsService.getLists(testOwnerUUID).length)
  .toBe(4);
});

it('should convert existing note to task', function() {
  // SETUP
  var notesOnProductivity = NotesService.getNoteInfo('848cda60-d725-40cc-b756-0b1e9fa5b7d8', testOwnerUUID).note;
  var noteToTaskPath = '/api/' + testOwnerUUID + '/note/' + notesOnProductivity.uuid + '/task';
  $httpBackend.expectPOST(noteToTaskPath).respond(200, noteToTaskResponse);

  // EXECUTE
  ConvertService.finishNoteToTaskConvert(notesOnProductivity, testOwnerUUID);
  $httpBackend.flush();

  // TESTS

  // There should not be a note with converted note's UUID
  expect(NotesService.getNoteInfo(notesOnProductivity.uuid, testOwnerUUID))
  .toBeUndefined();

  // Note should not be in notes array
  expect(NotesService.getNotes(testOwnerUUID).length)
  .toBe(2);

  var convertedTask = TasksService.getTaskInfo(noteToTaskResponse.uuid, testOwnerUUID).task;

  expect(convertedTask)
  .toBeDefined();
  expect(TasksService.getTasks(testOwnerUUID).length)
  .toBe(4);
});

it('should convert existing note to list', function() {
  // SETUP
  var notesOnProductivity = NotesService.getNoteInfo('848cda60-d725-40cc-b756-0b1e9fa5b7d8', testOwnerUUID).note;
  var noteToListPath = '/api/' + testOwnerUUID + '/note/' + notesOnProductivity.uuid + '/list';
  $httpBackend.expectPOST(noteToListPath).respond(200, noteToListResponse);

  // EXECUTE
  ConvertService.finishNoteToListConvert(notesOnProductivity, testOwnerUUID);
  $httpBackend.flush();

  // TESTS

  // There should not be a note with converted note's UUID
  expect(NotesService.getNoteInfo(notesOnProductivity.uuid, testOwnerUUID))
  .toBeUndefined();

  // Note should not be in notes array
  expect(NotesService.getNotes(testOwnerUUID).length)
  .toBe(2);

  var convertedList = ListsService.getListInfo(noteToListResponse.uuid, testOwnerUUID).list;

  expect(convertedList)
  .toBeDefined();
  expect(ListsService.getLists(testOwnerUUID).length)
  .toBe(4);
});

it('should convert existing list to task', function() {
  // SETUP
  var tripToDublin = ListsService.getListInfo('bf726d03-8fee-4614-8b68-f9f885938a51', testOwnerUUID).list;
  var listToTaskPath = '/api/' + testOwnerUUID + '/list/' + tripToDublin.uuid + '/task';
  $httpBackend.expectPOST(listToTaskPath).respond(200, listToTaskResponse);

  // EXECUTE
  ConvertService.finishListToTaskConvert(tripToDublin, testOwnerUUID);
  $httpBackend.flush();

  // TESTS
  expect(ListsService.getListInfo(tripToDublin.uuid, testOwnerUUID))
  .toBeUndefined();

  // There should be just two left
  expect(ListsService.getLists(testOwnerUUID).length)
  .toBe(2);

  // Tasks should have the new item
  expect(TasksService.getTaskInfo(listToTaskResponse.uuid, testOwnerUUID))
  .toBeDefined();
  expect(TasksService.getTasks(testOwnerUUID).length)
  .toBe(4);
});

it('should convert existing list to note', function() {
  // SETUP
  var extendedMindTechnologies = ListsService.getListInfo('0da0bff6-3bd7-4884-adba-f47fab9f270d',
                                                          testOwnerUUID).list;
  var listToNotePath = '/api/' + testOwnerUUID + '/list/' + extendedMindTechnologies.uuid + '/note';
  $httpBackend.expectPOST(listToNotePath).respond(200, listToNoteResponse);

  // EXECUTE
  ConvertService.finishListToNoteConvert(extendedMindTechnologies, testOwnerUUID);
  $httpBackend.flush();

  // TESTS
  expect(ListsService.getListInfo(extendedMindTechnologies.uuid, testOwnerUUID))
  .toBeUndefined();

  // There should be just two left
  expect(ListsService.getLists(testOwnerUUID).length)
  .toBe(2);

  // Notes should have the new item
  expect(NotesService.getNoteInfo(listToNoteResponse.uuid, testOwnerUUID))
  .toBeDefined();
  expect(NotesService.getNotes(testOwnerUUID).length)
  .toBe(4);
});

it('should not convert deleted task to list', function() {
  // SETUP
  var cleanCloset = TasksService.getTaskInfo('7b53d509-853a-47de-992c-c572a6952629', testOwnerUUID).task;
  // var taskToListPath = '/api/' + testOwnerUUID + '/task/' + cleanCloset.uuid + '/list';
  // TasksService.deleteTask(cleanCloset.uuid, testOwnerUUID);
  $httpBackend.expectDELETE('/api/' + testOwnerUUID + '/task/' + cleanCloset.uuid)
  .respond(200, deleteTaskResponse);
  TasksService.deleteTask(cleanCloset, testOwnerUUID);
  $httpBackend.flush();
  expect(TasksService.getTaskInfo(cleanCloset.uuid, testOwnerUUID).type)
  .toBe('deleted');

  // EXECUTE
  ConvertService.finishTaskToListConvert(cleanCloset, testOwnerUUID);

  // Task should be deleted
  expect(TasksService.getTaskInfo(cleanCloset.uuid, testOwnerUUID).type)
  .toBe('deleted');

  // There should not be a new list
  expect(ListsService.getLists(testOwnerUUID).length)
  .toBe(3);
});

it('should remove pre-existing parent from task when converting existing task to list', function() {
  // SETUP
  var writeEssayBody = TasksService.getTaskInfo('7a612ca2-7de0-45ad-a758-d949df37f51e', testOwnerUUID).task;
  var taskToListPath = '/api/' + testOwnerUUID + '/task/' + writeEssayBody.uuid + '/list';
  delete taskToListResponse.relationships.parent;
  $httpBackend.expectPOST(taskToListPath).respond(200, taskToListResponse);

  // EXECUTE
  ConvertService.finishTaskToListConvert(writeEssayBody, testOwnerUUID);
  $httpBackend.flush();

  // TESTS
  var convertedList = ListsService.getListInfo(taskToListResponse.uuid, testOwnerUUID).list;

  expect(convertedList.relationships.parent).
  toBeUndefined();
});

it('should set convert object with \'task\' property in transient properties ' +
  'when converting existing task with persistent values to list', function() {
  // SETUP
  var printTickets = TasksService.getTaskInfo('9a1ce3aa-f476-43c4-845e-af59a9a33760', testOwnerUUID).task;
  var taskToListPath = '/api/' + testOwnerUUID + '/task/' + printTickets.uuid + '/list';
  $httpBackend.expectPOST(taskToListPath).respond(200, taskToListResponse);

  // EXECUTE
  ConvertService.finishTaskToListConvert(printTickets, testOwnerUUID);
  $httpBackend.flush();

  // TESTS
  var convertedList = ListsService.getListInfo(taskToListResponse.uuid, testOwnerUUID).list;

  expect(convertedList.trans.convert.task)
  .toBeDefined();

  expect(convertedList.trans.convert.task.due).toEqual('2014-01-02');
  expect(convertedList.trans.convert.task.reminder).toEqual('10:00');
});

it('should set convert object with \'note\' property in transient properties ' +
 'when converting existing note with persistent values to task', function() {
  // SETUP
  var notesOnProductivity = NotesService.getNoteInfo('848cda60-d725-40cc-b756-0b1e9fa5b7d8', testOwnerUUID).note;

  // add persistent property to note
  var favoritedTimestamp = Date.now();
  notesOnProductivity.favorited = favoritedTimestamp;

  var noteToTaskPath = '/api/' + testOwnerUUID + '/note/' + notesOnProductivity.uuid + '/task';
  $httpBackend.expectPOST(noteToTaskPath).respond(200, noteToTaskResponse);

  // EXECUTE
  ConvertService.finishNoteToTaskConvert(notesOnProductivity, testOwnerUUID);
  $httpBackend.flush();

  // TESTS
  var convertedTask = TasksService.getTaskInfo(noteToTaskResponse.uuid, testOwnerUUID).task;

  expect(convertedTask.trans.convert.note)
  .toBeDefined();

  expect(convertedTask.trans.convert.note.favorited).toBe(favoritedTimestamp);
});

it('should set transient properties object with \'date\' property to task ' +
  'when converting existing list which has previously been a task to task', function() {
  // SETUP
  var writeEssayOnCognitiveBiases = ListsService.getListInfo('07bc96d1-e8b2-49a9-9d35-1eece6263f98',
                                                             testOwnerUUID).list;
  // add persistent property to task
  listToTaskResponse.due = '2014-08-29';
  var listToTaskPath = '/api/' + testOwnerUUID + '/list/' + writeEssayOnCognitiveBiases.uuid + '/task';
  $httpBackend.expectPOST(listToTaskPath).respond(200, listToTaskResponse);

  // EXECUTE
  ConvertService.finishListToTaskConvert(writeEssayOnCognitiveBiases, testOwnerUUID);
  $httpBackend.flush();

  // TESTS
  var convertedTask = TasksService.getTaskInfo(listToTaskResponse.uuid, testOwnerUUID).task;

  expect(convertedTask.trans.due)
  .toEqual('2014-08-29');
});

it('should convert new task to note and move description to content', function() {
  /*
  // SETUP
  var newTaskToNote = {
    title: 'print tickets',
    link: 'http://www.ext.md',
    due: '2014-01-02',
    description: 'to oxygen accelerator',
    reminder: '10:00',
    relationships: {
      parent: 'dbff4507-927d-4f99-940a-ee0cfcf6e84c',
      tags: ['1208d45b-3b8c-463e-88f3-f7ef19ce87cd']
    }
  };

  // EXECUTE
  ConvertService.finishTaskToNoteConvert(newTaskToNote, testOwnerUUID);

  // TESTS
  expect(newTaskToNote.description)
  .toBeUndefined();

  expect(newTaskToNote.content)
  .toEqual('to oxygen accelerator');
  */
});

});
