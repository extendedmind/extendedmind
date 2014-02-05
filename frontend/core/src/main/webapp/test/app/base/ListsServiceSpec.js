/*global beforeEach, getJSONFixture, module, inject, describe, afterEach, it, expect */
'use strict';

describe('ListService', function() {

  // INJECTS 

  var $httpBackend;
  var ListsService,
      ArrayService,
      TagsService,
      BackendClientService,
      HttpBasicAuthenticationService,
      HttpClientService;

  // MOCKS

  var now = new Date();
  var putNewListResponse = getJSONFixture('putListResponse.json');
  putNewListResponse.modified = now.getTime();
  var putExistingListResponse = getJSONFixture('putExistingListResponse.json');
  putExistingListResponse.modified = now.getTime();
  var deleteListResponse = getJSONFixture('deleteListResponse.json');
  deleteListResponse.result.modified = now.getTime();
  var undeleteListResponse = getJSONFixture('undeleteListResponse.json');
  undeleteListResponse.modified = now.getTime();
  var archiveListResponse = getJSONFixture('archiveListResponse.json');
  archiveListResponse.result.modified = now.getTime();

  var testOwnerUUID = '6be16f46-7b35-4b2d-b875-e13d19681e77';

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    inject(function (_$httpBackend_, _ListsService_, _ArrayService_, _TagsService_, _BackendClientService_, _HttpBasicAuthenticationService_, _HttpClientService_) {
      $httpBackend = _$httpBackend_;
      ListsService = _ListsService_;
      ArrayService = _ArrayService_;
      TagsService = _TagsService_;
      BackendClientService = _BackendClientService_;
      HttpBasicAuthenticationService = _HttpBasicAuthenticationService_;
      HttpClientService = _HttpClientService_;
      ListsService.setLists(
        [{
            'uuid': '0da0bff6-3bd7-4884-adba-f47fab9f270d',
            'modified': 1390912600957,
            'title': 'extended mind technologies',
            'link': 'http://ext.md'
          }, {
            'uuid': 'bf726d03-8fee-4614-8b68-f9f885938a51',
            'modified': 1390912600947,
            'title': 'trip to Dublin',
            'completable': true,
            'due': '2013-10-31'
          }, {
            'uuid': '07bc96d1-e8b2-49a9-9d35-1eece6263f98',
            'modified': 1390912600983,
            'title': 'write essay on cognitive biases',
            'completable': true
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
    expect(ListsService.getListByUUID('bf726d03-8fee-4614-8b68-f9f885938a51', testOwnerUUID))
      .toBeDefined();
  });

  it('should not find list by unknown uuid', function () {
    expect(ListsService.getListByUUID('bf726d03-8fee-4614-8b68-f9f885938a50', testOwnerUUID))
      .toBeUndefined();
  });

  it('should save new list', function () {
    var testList = {
      'title': 'test list'
    };
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/list', testList)
       .respond(200, putNewListResponse);
    ListsService.saveList(testList, testOwnerUUID);
    $httpBackend.flush();
    expect(ListsService.getListByUUID(putNewListResponse.uuid, testOwnerUUID))
      .toBeDefined();
    // Should go to the end of the array
    var lists = ListsService.getLists(testOwnerUUID);
    expect(lists.length)
      .toBe(4);
    expect(lists[3].uuid)
      .toBe(putNewListResponse.uuid);
  });

  it('should update existing list', function () {
    var tripToDublin = ListsService.getListByUUID('bf726d03-8fee-4614-8b68-f9f885938a51', testOwnerUUID);
    tripToDublin.title = 'another trip to Dublin';
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/list/' + tripToDublin.uuid, tripToDublin)
       .respond(200, putExistingListResponse);
    ListsService.saveList(tripToDublin, testOwnerUUID);
    $httpBackend.flush();

    expect(ListsService.getListByUUID(tripToDublin.uuid, testOwnerUUID).modified)
      .toBe(putExistingListResponse.modified);

    // Should move to the end of the array
    var lists = ListsService.getLists(testOwnerUUID, testOwnerUUID);
    expect(lists.length)
      .toBe(3);
    expect(lists[2].uuid)
      .toBe(tripToDublin.uuid);
  });

  it('should delete and undelete list', function () {
    var tripToDublin = ListsService.getListByUUID('bf726d03-8fee-4614-8b68-f9f885938a51', testOwnerUUID);
    $httpBackend.expectDELETE('/api/' + testOwnerUUID + '/list/' + tripToDublin.uuid)
       .respond(200, deleteListResponse);
    ListsService.deleteList(tripToDublin, testOwnerUUID);
    $httpBackend.flush();
    expect(ListsService.getListByUUID(tripToDublin.uuid, testOwnerUUID))
      .toBeUndefined();

    // There should be just two left
    var lists = ListsService.getLists(testOwnerUUID);
    expect(lists.length)
      .toBe(2);

    // Undelete the list
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/list/' + tripToDublin.uuid + '/undelete')
       .respond(200, undeleteListResponse);
    ListsService.undeleteList(tripToDublin, testOwnerUUID);
    $httpBackend.flush();
    expect(ListsService.getListByUUID(tripToDublin.uuid, testOwnerUUID).modified)
      .toBe(undeleteListResponse.modified);

    // There should be three left with trip to dublin the last
    lists = ListsService.getLists(testOwnerUUID);
    expect(lists.length)
      .toBe(3);
    expect(lists[2].uuid)
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
    var tripToDublin = ListsService.getListByUUID('bf726d03-8fee-4614-8b68-f9f885938a51', testOwnerUUID);
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
    expect(ListsService.getListByUUID(tripToDublin.uuid,testOwnerUUID))
      .toBeUndefined();
    expect(ListsService.getLists(testOwnerUUID).length)
      .toBe(2);
    expect(ListsService.getArchivedLists(testOwnerUUID).length)
      .toBe(1);

    // TagsService should have the new generated tag
    expect(TagsService.getTagByUUID(archiveListResponse.history.uuid, testOwnerUUID))
      .toBeDefined();
  });

});
