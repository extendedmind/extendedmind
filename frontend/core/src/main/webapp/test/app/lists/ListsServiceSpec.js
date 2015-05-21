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

describe('ListsService', function() {

  // INJECTS

  var $httpBackend;
  var ListsService,
      ArrayService,
      TagsService,
      TasksService,
      NotesService,
      BackendClientService,
      HttpClientService,
      UserSessionService;

  // MOCKS

  var now = new Date();
  var putNewListResponse = getJSONFixture('putListResponse.json');
  putNewListResponse.created = putNewListResponse.modified = now.getTime();
  var putExistingListResponse = getJSONFixture('putExistingListResponse.json');
  putExistingListResponse.modified = now.getTime();
  var deleteListResponse = getJSONFixture('deleteListResponse.json');
  deleteListResponse.result.modified = now.getTime();
  var undeleteListResponse = getJSONFixture('undeleteListResponse.json');
  undeleteListResponse.modified = now.getTime();
  var archiveListResponse = getJSONFixture('archiveListResponse.json');
  archiveListResponse.result.modified = now.getTime();
  var completeTaskResponse = getJSONFixture('completeTaskResponse.json');
  completeTaskResponse.result.modified = now.getTime();

  var testOwnerUUID = '6be16f46-7b35-4b2d-b875-e13d19681e77';

  var MockUUIDService = {
    mockIndex: 0,
    mockFakeUUIDs: ['00000000-0000-4629-8552-96671b730000',
                    '00000000-0000-4629-8552-96671b730001',
                    '00000000-0000-4629-8552-96671b730002',
                    '00000000-0000-4629-8552-96671b730003'],
    s4: function(){
      return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
    },
    randomUUID: function() {
      return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
      this.s4() + '-' + this.s4() + this.s4() + this.s4();
    },
    generateFakeUUID: function() {
      var mockFakeUUID = this.mockFakeUUIDs[this.mockIndex];
      this.mockIndex++;
      return mockFakeUUID;
    },
    isFakeUUID: function(uuid) {
      if (uuid && uuid.startsWith('00000000-0000-'))
        return true;
    },
    getShortIdFromFakeUUID: function(fakeUUID) {
      return fakeUUID.substr(14, 4) + fakeUUID.substr(19, 4) + fakeUUID.substr(24, 12);
    },
  };

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');


    module('common', function($provide){
      $provide.constant('UUIDService', MockUUIDService);
    });

    inject(function (_$httpBackend_, _ListsService_, _ArrayService_, _TagsService_, _TasksService_,
                     _BackendClientService_, _HttpClientService_, _UserSessionService_, _NotesService_) {
      $httpBackend = _$httpBackend_;
      ListsService = _ListsService_;
      ArrayService = _ArrayService_;
      TagsService = _TagsService_;
      TasksService = _TasksService_;
      NotesService = _NotesService_;
      BackendClientService = _BackendClientService_;
      HttpClientService = _HttpClientService_;
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
            'due': '2013-10-31'
          }, {
            'uuid': '07bc96d1-e8b2-49a9-9d35-1eece6263f98',
            'created': 1390912600983,
            'modified': 1390912600983,
            'title': 'write essay on cognitive biases',
        }], testOwnerUUID);
      TasksService.setTasks(
        [{
          'uuid': '9a1ce3aa-f476-43c4-845e-af59a9a33760',
          'created': 1391278509717,
          'modified': 1391278509717,
          'title': 'print tickets',
          'link': 'http://www.finnair.fi',
          'due': '2014-01-02',
          'reminders': [{
            'packaging': 'ios-cordova',
            'notification': 1429255890410,
            'uuid': '51ff61b2-2a07-4b69-b149-d58b0510a1cd',
            'reminderType': 'ln',
            'modified': 1391278509717,
            'id': '12345678901234567',
            'device': 'iPhone6',
            'created': 1391278509717
          }],
          'relationships': {
            'parent': 'bf726d03-8fee-4614-8b68-f9f885938a51'
          }
        }], testOwnerUUID);
      NotesService.setNotes(
        [{'uuid': 'b2cd149a-a287-40a0-86d9-0a14462f22d8',
          'created': 1391627811075,
          'modified': 1391627811075,
          'title': 'booth number A23',
          'relationships': {
            'parent': 'bf726d03-8fee-4614-8b68-f9f885938a51'
          }
        }], testOwnerUUID);
    });

    var sessionStore = {};
    spyOn(sessionStorage, 'getItem').andCallFake(function(key) {
      return sessionStore[key];
    });
    spyOn(sessionStorage, 'setItem').andCallFake(function(key, value) {
      sessionStore[key] = value + '';
    });
    spyOn(sessionStorage, 'removeItem').andCallFake(function(key) {
      delete sessionStore[key];
    });
    spyOn(sessionStorage, 'clear').andCallFake(function() {
      sessionStore = {};
    });
  });


  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // TESTS

  it('should get lists', function () {
    var lists = ListsService.getLists(testOwnerUUID);
    expect(lists.length)
      .toBe(3);
    // Lists should be in modified order
    expect(lists[0].title).toBe('trip to Dublin');
    expect(lists[1].title).toBe('extended mind technologies');
    expect(lists[2].title).toBe('write essay on cognitive biases');
  });

  it('should find list by uuid', function () {
    expect(ListsService.getListInfo('bf726d03-8fee-4614-8b68-f9f885938a51', testOwnerUUID))
      .toBeDefined();
  });

  it('should not find list by unknown uuid', function () {
    expect(ListsService.getListInfo('bf726d03-8fee-4614-8b68-f9f885938a50', testOwnerUUID))
      .toBeUndefined();
  });

  it('should save new list', function () {
    var testListValues = {
      'id': MockUUIDService.getShortIdFromFakeUUID(MockUUIDService.mockFakeUUIDs[0]),
      'title': 'test list'
    };
    var testList = ListsService.getNewList(testListValues, testOwnerUUID);

    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/list', testListValues)
       .respond(200, putNewListResponse);
    ListsService.saveList(testList);
    $httpBackend.flush();
    expect(ListsService.getListInfo(MockUUIDService.mockFakeUUIDs[0], testOwnerUUID))
      .toBeDefined();
    // Should go to the end of the array
    var lists = ListsService.getLists(testOwnerUUID);
    expect(lists.length)
      .toBe(4);
    expect(lists[3].mod.uuid)
      .toBe(MockUUIDService.mockFakeUUIDs[0]);
    expect(lists[3].mod.title)
      .toBe('test list');
    expect(lists[3].mod)
      .toBeDefined();
  });

  it('should update existing list', function () {
    var tripToDublin = ListsService.getListInfo('bf726d03-8fee-4614-8b68-f9f885938a51', testOwnerUUID).list;
    tripToDublin.trans.title = 'another trip to Dublin';
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/list/' + tripToDublin.uuid,
                          {title: tripToDublin.trans.title,
                           due: tripToDublin.due,
                           modified: tripToDublin.modified})
       .respond(200, putExistingListResponse);
    ListsService.saveList(tripToDublin);
    $httpBackend.flush();

    expect(ListsService.getListInfo(tripToDublin.uuid, testOwnerUUID).list.mod.modified)
      .toBeGreaterThan(tripToDublin.modified);

    // Should not change place
    var lists = ListsService.getLists(testOwnerUUID, testOwnerUUID);
    expect(lists.length)
      .toBe(3);
    expect(lists[0].uuid)
      .toBe(tripToDublin.uuid);
    expect(lists[0].mod.title)
      .toBe('another trip to Dublin');
    expect(lists[0].mod)
      .toBeDefined();
  });

  it('should delete and undelete list', function () {
    var tripToDublin = ListsService.getListInfo('bf726d03-8fee-4614-8b68-f9f885938a51', testOwnerUUID).list;
    $httpBackend.expectDELETE('/api/' + testOwnerUUID + '/list/' + tripToDublin.uuid)
       .respond(200, deleteListResponse);
    ListsService.deleteList(tripToDublin);
    $httpBackend.flush();
    expect(ListsService.getListInfo(tripToDublin.uuid, testOwnerUUID).type)
      .toBe('deleted');

    // There should be just two left
    var lists = ListsService.getLists(testOwnerUUID);
    expect(lists.length)
      .toBe(2);

    // Undelete the list
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/list/' + tripToDublin.uuid + '/undelete')
       .respond(200, undeleteListResponse);
    ListsService.undeleteList(tripToDublin);
    $httpBackend.flush();
    expect(ListsService.getListInfo(tripToDublin.uuid, testOwnerUUID).list.mod.modified)
      .toBeGreaterThan(tripToDublin.modified);

    // There should be three left with trip to dublin in the same place
    lists = ListsService.getLists(testOwnerUUID);
    expect(lists.length)
      .toBe(3);
    expect(lists[0].uuid)
      .toBe(tripToDublin.uuid);
  });

  it('should archive list', function () {
    // First register callback to list service
    var childItems, archivedTimestamp, callBackUUID;
    var testArchiveItemCallback = function(children, archived, modified, uuid){
      childItems = children;
      archivedTimestamp = archived;
      callBackUUID = uuid;
    };
    ListsService.registerItemArchiveCallback(testArchiveItemCallback, 'test');

    // Make call
    var tripToDublin = ListsService.getListInfo('bf726d03-8fee-4614-8b68-f9f885938a51', testOwnerUUID).list;
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/list/' + tripToDublin.uuid + '/archive')
       .respond(200, archiveListResponse);
    ListsService.archiveList(tripToDublin);
    $httpBackend.flush();

    // Validate that callback was called
    expect(childItems.length)
      .toBe(archiveListResponse.children.length);
    expect(archivedTimestamp)
      .toBe(archiveListResponse.archived);
    expect(callBackUUID)
      .toBe(testOwnerUUID);

    // The list should not be active anymore
    expect(ListsService.getListInfo(tripToDublin.uuid,testOwnerUUID).type)
      .toBe('archived');
    expect(ListsService.getLists(testOwnerUUID).length)
      .toBe(2);
    expect(ListsService.getArchivedLists(testOwnerUUID).length)
      .toBe(1);

    // TagsService should have the new generated tag
    expect(TagsService.getTagInfo(archiveListResponse.history.uuid, testOwnerUUID))
      .toBeDefined();
  });

  it('should archive tasks and notes alongside list, then unarchive them', function () {
    var modified = now.getTime();
    var archiveTripToDublinResponse = {
      'archived': modified,
      'children': [{
        'uuid': '9a1ce3aa-f476-43c4-845e-af59a9a33760',
        'modified': modified
      }, {
        'uuid': 'b2cd149a-a287-40a0-86d9-0a14462f22d8',
        'modified': modified
      }],
      'history': {
        'uuid': '3fab3a32-3933-4b00-bf7e-9f2f516fae5f',
        'modified': modified,
        'title': 'bf726d03-8fee-4614-8b68-f9f885938a51',
        'tagType': 'history',
        'created': modified
      },
      'result': {
        'modified': modified
      }
    };

    // Initial situation
    expect(TasksService.getTasks(testOwnerUUID).length)
      .toBe(1);
    expect(TasksService.getArchivedTasks(testOwnerUUID).length)
      .toBe(0);

    expect(NotesService.getNotes(testOwnerUUID).length)
      .toBe(1);
    expect(NotesService.getArchivedNotes(testOwnerUUID).length)
      .toBe(0);

    // First complete the task
    var printTickets = TasksService.getTaskInfo('9a1ce3aa-f476-43c4-845e-af59a9a33760', testOwnerUUID).task;
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/task/' + printTickets.uuid + '/complete')
       .respond(200, completeTaskResponse);
    TasksService.completeTask(printTickets, testOwnerUUID);
    $httpBackend.flush();

    // The task should be completed task
    expect(printTickets.mod.completed).toBeDefined();

    // Archive list
    var tripToDublin = ListsService.getListInfo('bf726d03-8fee-4614-8b68-f9f885938a51', testOwnerUUID).list;
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/list/' + tripToDublin.uuid + '/archive')
       .respond(200, archiveTripToDublinResponse);
    ListsService.archiveList(tripToDublin);
    $httpBackend.flush();

    // The list should not be active anymore
    expect(ListsService.getListInfo(tripToDublin.uuid, testOwnerUUID).type)
      .toBe('archived');
    expect(ListsService.getLists(testOwnerUUID).length)
      .toBe(2);
    expect(ListsService.getArchivedLists(testOwnerUUID).length)
      .toBe(1);

    // TagsService should have the new generated tag
    expect(TagsService.getTagInfo(archiveTripToDublinResponse.history.uuid, testOwnerUUID))
      .toBeDefined();

    // There should be one new archived task
    expect(TasksService.getArchivedTasks(testOwnerUUID).length)
      .toBe(1);
    expect(TasksService.getArchivedTasks(testOwnerUUID)[0].trans.archived).toBeDefined();
    expect(TasksService.getTasks(testOwnerUUID).length)
      .toBe(0);

    // There should be one new archived note
    expect(NotesService.getArchivedNotes(testOwnerUUID).length)
      .toBe(1);
    expect(NotesService.getArchivedNotes(testOwnerUUID)[0].trans.archived).toBeDefined();
    expect(NotesService.getNotes(testOwnerUUID).length)
      .toBe(0);

    // Unarchive archived list
    var newModified = Date.now();
    var unarchiveTripToDublinResponse = {
      'children': [{
        'uuid': '9a1ce3aa-f476-43c4-845e-af59a9a33760',
        'modified': newModified
      }, {
        'uuid': 'b2cd149a-a287-40a0-86d9-0a14462f22d8',
        'modified': newModified
      }],
      'history': {
        'deleted': newModified,
        'result':{
          'uuid': '3fab3a32-3933-4b00-bf7e-9f2f516fae5f',
          'created': modified,
          'modified': newModified
        }
      },
      'result': {
        'modified': modified
      }
    };

    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/list/' + tripToDublin.uuid + '/unarchive')
       .respond(200, unarchiveTripToDublinResponse);
    ListsService.unarchiveList(tripToDublin);
    $httpBackend.flush();

    // The list should be active again
    expect(ListsService.getListInfo(tripToDublin.uuid, testOwnerUUID).type)
      .toBe('active');
    expect(ListsService.getLists(testOwnerUUID).length)
      .toBe(3);
    expect(ListsService.getArchivedLists(testOwnerUUID).length)
      .toBe(0);

    // TagsService should have a deleted history tag
    expect(TagsService.getTagInfo(archiveTripToDublinResponse.history.uuid, testOwnerUUID).type)
      .toBe('deleted');

    // There should be no archived tasks
    expect(TasksService.getArchivedTasks(testOwnerUUID).length)
      .toBe(0);
    expect(TasksService.getTasks(testOwnerUUID).length)
      .toBe(1);

    // There should be no archived notes
    expect(NotesService.getArchivedNotes(testOwnerUUID).length)
      .toBe(0);
    expect(NotesService.getNotes(testOwnerUUID).length)
      .toBe(1);
  });
});
