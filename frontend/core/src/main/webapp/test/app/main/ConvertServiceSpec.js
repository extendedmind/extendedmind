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
  /*
  * Running 'mvn install' throws "TypeError: 'undefined' is not a function"
  * because Function.prototype.bind is not present.
  *
  * Polyfill 'bind' here since it is currently not needed anywhere else.
  *
  * From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
  *
  * TODO: Is PhantomJS causing this? In that case, explain current version (and its ECMAScript version)
  * and related issues on GitHub
  */
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
      fToBind = this,
      fNOP = function () {},
      fBound = function () {
        return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
         aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();

      return fBound;
    };
  }

  // INJECTS

  var $httpBackend;
  var ConvertService, ListsService, NotesService, TagsService, TasksService;

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

    inject(function(_$httpBackend_, _ConvertService_, _ListsService_, _NotesService_, _TagsService_, _TasksService_) {
      $httpBackend = _$httpBackend_;
      ConvertService = _ConvertService_;
      ListsService = _ListsService_;
      NotesService = _NotesService_;
      TagsService = _TagsService_;
      TasksService = _TasksService_;

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
  var notesOnProductivity = NotesService.getNoteByUUID('848cda60-d725-40cc-b756-0b1e9fa5b7d8', testOwnerUUID);
  var noteToTaskPath = '/api/' + testOwnerUUID + '/note/' + notesOnProductivity.uuid + '/task';
  $httpBackend.expectPOST(noteToTaskPath).respond(200, noteToTaskResponse);

  // EXECUTE
  ConvertService.finishNoteToTaskConvert(notesOnProductivity, testOwnerUUID);
  $httpBackend.flush();

  // TESTS
  var convertedTask = TasksService.getTaskByUUID(noteToTaskResponse.uuid, testOwnerUUID);

  expect(convertedTask)
  .toBeDefined();
  expect(TasksService.getTasks(testOwnerUUID).length)
  .toBe(4);
});

it('should delete note when converting existing note to task', function() {
  // SETUP
  var notesOnProductivity = NotesService.getNoteByUUID('848cda60-d725-40cc-b756-0b1e9fa5b7d8', testOwnerUUID);
  var noteToTaskPath = '/api/' + testOwnerUUID + '/note/' + notesOnProductivity.uuid + '/task';
  $httpBackend.expectPOST(noteToTaskPath).respond(200, noteToTaskResponse);

  // EXECUTE
  ConvertService.finishNoteToTaskConvert(notesOnProductivity, testOwnerUUID);
  $httpBackend.flush();

  // TEST
  var notes = NotesService.getNotes(testOwnerUUID);

  // There should not be a note with converted note's UUID
  expect(NotesService.getNoteByUUID(notesOnProductivity.uuid, testOwnerUUID))
  .toBeUndefined();

  // Note should not be in notes array
  expect(notes.length)
  .toBe(2);
});

it('should set convert object with \'note\' property in transientProperties ' +
 'when converting existing note with persistent values to task', function() {
  // SETUP
  var notesOnProductivity = NotesService.getNoteByUUID('848cda60-d725-40cc-b756-0b1e9fa5b7d8', testOwnerUUID);

  // add transient property to note
  notesOnProductivity.transientProperties = {
    starred: true
  };

  var noteToTaskPath = '/api/' + testOwnerUUID + '/note/' + notesOnProductivity.uuid + '/task';
  $httpBackend.expectPOST(noteToTaskPath).respond(200, noteToTaskResponse);

  // EXECUTE
  ConvertService.finishNoteToTaskConvert(notesOnProductivity, testOwnerUUID);
  $httpBackend.flush();

  // TESTS
  var convertedTask = TasksService.getTaskByUUID(noteToTaskResponse.uuid, testOwnerUUID);

  expect(convertedTask.transientProperties.convert.note)
  .toBeDefined();

  expect(convertedTask.transientProperties.convert.note.favorited).toBe(true);
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
