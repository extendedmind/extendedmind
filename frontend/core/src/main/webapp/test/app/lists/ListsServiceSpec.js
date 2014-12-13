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

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    inject(function (_$httpBackend_, _ListsService_, _ArrayService_, _TagsService_, _TasksService_,
                     _BackendClientService_, _HttpClientService_, _UserSessionService_) {
      $httpBackend = _$httpBackend_;
      ListsService = _ListsService_;
      ArrayService = _ArrayService_;
      TagsService = _TagsService_;
      TasksService = _TasksService_;
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
          'reminder': '10:00',
          'relationships': {
            'parent': 'bf726d03-8fee-4614-8b68-f9f885938a51'
          }
        }], testOwnerUUID);
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
      'title': 'test list'
    };
    var testList = ListsService.getNewList(testListValues, testOwnerUUID);

    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/list', testListValues)
       .respond(200, putNewListResponse);
    ListsService.saveList(testList, testOwnerUUID);
    $httpBackend.flush();
    expect(ListsService.getListInfo(putNewListResponse.uuid, testOwnerUUID))
      .toBeDefined();
    // Should go to the end of the array
    var lists = ListsService.getLists(testOwnerUUID);
    expect(lists.length)
      .toBe(4);
    expect(lists[3].uuid)
      .toBe(putNewListResponse.uuid);
  });

  it('should update existing list', function () {
    var tripToDublin = ListsService.getListInfo('bf726d03-8fee-4614-8b68-f9f885938a51', testOwnerUUID).list;
    tripToDublin.trans.title = 'another trip to Dublin';
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/list/' + tripToDublin.uuid,
                          {title: tripToDublin.trans.title,
                           due: tripToDublin.due,
                           modified: tripToDublin.modified})
       .respond(200, putExistingListResponse);
    ListsService.saveList(tripToDublin, testOwnerUUID);
    $httpBackend.flush();

    expect(ListsService.getListInfo(tripToDublin.uuid, testOwnerUUID).list.modified)
      .toBe(putExistingListResponse.modified);

    // Should not change place
    var lists = ListsService.getLists(testOwnerUUID, testOwnerUUID);
    expect(lists.length)
      .toBe(3);
    expect(lists[0].uuid)
      .toBe(tripToDublin.uuid);
  });

  it('should delete and undelete list', function () {
    var tripToDublin = ListsService.getListInfo('bf726d03-8fee-4614-8b68-f9f885938a51', testOwnerUUID).list;
    $httpBackend.expectDELETE('/api/' + testOwnerUUID + '/list/' + tripToDublin.uuid)
       .respond(200, deleteListResponse);
    ListsService.deleteList(tripToDublin, testOwnerUUID);
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
    ListsService.undeleteList(tripToDublin, testOwnerUUID);
    $httpBackend.flush();
    expect(ListsService.getListInfo(tripToDublin.uuid, testOwnerUUID).list.modified)
      .toBe(undeleteListResponse.modified);

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
    var testArchiveItemCallback = function(children, archived, uuid){
      childItems = children;
      archivedTimestamp = archived;
      callBackUUID = uuid;
    };
    ListsService.registerItemArchiveCallback(testArchiveItemCallback, 'test');

    // Make call
    var tripToDublin = ListsService.getListInfo('bf726d03-8fee-4614-8b68-f9f885938a51', testOwnerUUID).list;
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/list/' + tripToDublin.uuid + '/archive')
       .respond(200, archiveListResponse);
    ListsService.archiveList(tripToDublin, testOwnerUUID);
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

  it('should archive tasks alongside list', function () {
    var modified = now.getTime();
    var archiveTripToDublinResponse = {
      'archived': modified,
      'children': [{
        'uuid': '9a1ce3aa-f476-43c4-845e-af59a9a33760',
        'modified': modified
      }, {
        'uuid': '1a1ce3aa-f476-43c4-845e-af59a9a33760',
        'modified': modified
      }],
      'history': {
        'uuid': '3fab3a32-3933-4b00-bf7e-9f2f516fae5f',
        'modified': modified,
        'title': 'bf726d03-8fee-4614-8b68-f9f885938a51',
        'tagType': 'history'
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

    // First complete one of the tasks, but not the other
    var printTickets = TasksService.getTaskInfo('9a1ce3aa-f476-43c4-845e-af59a9a33760', testOwnerUUID).task;
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/task/' + printTickets.uuid + '/complete')
       .respond(200, completeTaskResponse);
    TasksService.completeTask(printTickets, testOwnerUUID);
    $httpBackend.flush();

    // The task should be completed task
    expect(printTickets.completed).toBeDefined();

    // Archive list
    var tripToDublin = ListsService.getListInfo('bf726d03-8fee-4614-8b68-f9f885938a51', testOwnerUUID).list;
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/list/' + tripToDublin.uuid + '/archive')
       .respond(200, archiveTripToDublinResponse);
    ListsService.archiveList(tripToDublin, testOwnerUUID);
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

    // There should be two new archived task
    expect(TasksService.getArchivedTasks(testOwnerUUID).length)
      .toBe(1);
    expect(TasksService.getTasks(testOwnerUUID).length)
      .toBe(0);
  });
});
