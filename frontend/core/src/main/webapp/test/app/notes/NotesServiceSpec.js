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

describe('NotesService', function() {

  // INJECTS

  var $httpBackend;
  var NotesService, BackendClientService, HttpClientService, ListsService;

  // MOCKS

  var now = new Date();
  var putNewNoteResponse = getJSONFixture('putNoteResponse.json');
  putNewNoteResponse.created = putNewNoteResponse.modified = now.getTime();
  var putExistingNoteResponse = getJSONFixture('putExistingNoteResponse.json');
  putExistingNoteResponse.modified = now.getTime();
  var deleteNoteResponse = getJSONFixture('deleteNoteResponse.json');
  deleteNoteResponse.result.modified = now.getTime();
  var undeleteNoteResponse = getJSONFixture('undeleteNoteResponse.json');
  undeleteNoteResponse.modified = now.getTime();

  var testOwnerUUID = '6be16f46-7b35-4b2d-b875-e13d19681e77';

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    inject(function (_$httpBackend_, _NotesService_, _BackendClientService_, _HttpClientService_, _ListsService_) {
      $httpBackend = _$httpBackend_;
      NotesService = _NotesService_;
      BackendClientService = _BackendClientService_;
      HttpClientService = _HttpClientService_;
      ListsService = _ListsService_;
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
    });
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // TESTS

  it('should get notes', function () {
    var notes = NotesService.getNotes(testOwnerUUID);
    expect(notes.length)
      .toBe(3);
    // Notes should be in modified order
    expect(notes[0].title).toBe('office door code');
    expect(notes[1].title).toBe('notes on productivity');
    expect(notes[2].title).toBe('contexts could be used to prevent access to data');
  });

  it('should find note by uuid', function () {
    expect(NotesService.getNoteByUUID('848cda60-d725-40cc-b756-0b1e9fa5b7d8', testOwnerUUID))
      .toBeDefined();
  });

  it('should not find note by unknown uuid', function () {
    expect(NotesService.getNoteByUUID('848c3a60-d725-40cc-b756-0b1e9fa5b7d8', testOwnerUUID))
      .toBeUndefined();
  });

  it('should save new note', function () {
    var testNote = {
      'title': 'test note'
    };
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/note', testNote)
       .respond(200, putNewNoteResponse);
    NotesService.saveNote(testNote, testOwnerUUID);
    $httpBackend.flush();
    expect(NotesService.getNoteByUUID(putNewNoteResponse.uuid, testOwnerUUID))
      .toBeDefined();

    // Should move to the end of the array
    var notes = NotesService.getNotes(testOwnerUUID);
    expect(notes.length)
      .toBe(4);
    expect(notes[3].uuid)
      .toBe(putNewNoteResponse.uuid);
  });

  it('should update existing note', function () {
    var officeDoorCode = NotesService.getNoteByUUID('c2cd149a-a287-40a0-86d9-0a14462f22d6', testOwnerUUID);
    officeDoorCode.content = '1234';
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/note/' + officeDoorCode.uuid, officeDoorCode)
       .respond(200, putExistingNoteResponse);
    NotesService.saveNote(officeDoorCode, testOwnerUUID);
    $httpBackend.flush();
    expect(NotesService.getNoteByUUID(officeDoorCode.uuid, testOwnerUUID).modified)
      .toBe(putExistingNoteResponse.modified);

    // Should stay in its old place
    var notes = NotesService.getNotes(testOwnerUUID);
    expect(notes.length)
      .toBe(3);
    expect(notes[0].uuid)
      .toBe(officeDoorCode.uuid);
  });

  it('should delete and undelete note', function () {
    var officeDoorCode = NotesService.getNoteByUUID('c2cd149a-a287-40a0-86d9-0a14462f22d6', testOwnerUUID);
    $httpBackend.expectDELETE('/api/' + testOwnerUUID + '/note/' + officeDoorCode.uuid)
       .respond(200, deleteNoteResponse);
    NotesService.deleteNote(officeDoorCode, testOwnerUUID);
    $httpBackend.flush();
    expect(NotesService.getNoteByUUID(officeDoorCode.uuid, testOwnerUUID))
      .toBeUndefined();

    // There should be just two left
    var notes = NotesService.getNotes(testOwnerUUID);
    expect(notes.length)
      .toBe(2);

    // Undelete the note
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/note/' + officeDoorCode.uuid + '/undelete')
       .respond(200, undeleteNoteResponse);
    NotesService.undeleteNote(officeDoorCode, testOwnerUUID);
    $httpBackend.flush();
    expect(NotesService.getNoteByUUID(officeDoorCode.uuid, testOwnerUUID).modified)
      .toBe(undeleteNoteResponse.modified);

    // There should be three left with the undeleted officeDoorCode in its old place
    notes = NotesService.getNotes(testOwnerUUID);
    expect(notes.length)
      .toBe(3);
    expect(notes[0].uuid)
      .toBe(officeDoorCode.uuid);
  });

  it('should reset note', function () {
    var notesOnProductivity = NotesService.getNoteByUUID('848cda60-d725-40cc-b756-0b1e9fa5b7d8', testOwnerUUID);

    // Change transient values
    notesOnProductivity.relationships.list = '1da0bff6-3bd7-4884-adba-f47fab9f270d'

    // Reset note
    NotesService.resetNote(notesOnProductivity, testOwnerUUID);

    // Values should be back to their original values
    expect(notesOnProductivity.relationships.list).toBe('0da0bff6-3bd7-4884-adba-f47fab9f270d');
  });

});