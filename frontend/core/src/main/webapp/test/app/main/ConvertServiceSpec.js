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
  var ConvertService, NotesService;

  // MOCKS

  var now = new Date();
  var noteToTaskResponse = getJSONFixture('noteToTaskResponse.json');
  noteToTaskResponse.modified = now.getTime();

  var testOwnerUUID = '6be16f46-7b35-4b2d-b875-e13d19681e77';

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    inject(function(_$httpBackend_, _ConvertService_, _NotesService_) {
      $httpBackend = _$httpBackend_;
      ConvertService = _ConvertService_;
      NotesService = _NotesService_;

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

    });
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // TESTS

  it('should convert note to task', function() {
    var officeDoorCode = NotesService.getNoteByUUID('c2cd149a-a287-40a0-86d9-0a14462f22d6', testOwnerUUID);
    var noteToTaskPath = '/api/' + testOwnerUUID + '/note/' + officeDoorCode.uuid + '/task';

    // Convert note to task
    $httpBackend.expectPOST(noteToTaskPath).respond(200, noteToTaskResponse);

    ConvertService.convertNoteToTask(officeDoorCode, testOwnerUUID);
    $httpBackend.flush();

    // Note should not be in notes array
    var notes = NotesService.getNotes(testOwnerUUID);
    expect(notes.length).toBe(2);

    // There should not be a note with converted note's UUID
    expect(NotesService.getNoteByUUID(officeDoorCode.uuid, testOwnerUUID)).toBeUndefined();
  });

});
