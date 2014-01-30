/*global beforeEach, getJSONFixture, module, inject, describe, afterEach, it, expect */
'use strict';

describe('ListService', function() {

  // INJECTS 

  var $httpBackend;
  var ListsService, BackendClientService, HttpBasicAuthenticationService, HttpClientService;

  // TEST DATA

  var putNewListResponse = getJSONFixture('putListResponse.json');
  var putExistingListResponse = getJSONFixture('putExistingListResponse.json');
  var MockUserSessionService = {
      getCredentials: function () {
        return '123456789';
      },
      getActiveUUID: function () {
        return '6be16f46-7b35-4b2d-b875-e13d19681e77';
      }
    };
  var testListData = [{
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
  }];

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    module('em.services', function ($provide){
      $provide.value('UserSessionService', MockUserSessionService);
    });

    inject(function (_$httpBackend_, _ListsService_, _BackendClientService_, _HttpBasicAuthenticationService_, _HttpClientService_) {
      $httpBackend = _$httpBackend_;
      ListsService = _ListsService_;
      BackendClientService = _BackendClientService_;
      HttpBasicAuthenticationService = _HttpBasicAuthenticationService_;
      HttpClientService = _HttpClientService_;
      ListsService.setLists(testListData);
    });
  });


  afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });

  // TESTS

  it('should get lists', function () {
    expect(ListsService.getLists().length)
      .toBe(3);
  });

  it('should find list by uuid', function () {
    expect(ListsService.getListByUUID('bf726d03-8fee-4614-8b68-f9f885938a51'))
      .toBeDefined();
  });

  it('should not find list by unknown uuid', function () {
    expect(ListsService.getListByUUID('bf726d03-8fee-4614-8b68-f9f885938a50'))
      .toBeUndefined();
  });

  it('should save new list', function () {
    var testList = {
      'title': 'test list'
    };
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/list', testList)
       .respond(200, putNewListResponse);
    ListsService.saveList(testList);
    $httpBackend.flush();
    expect(ListsService.getListByUUID(putNewListResponse.uuid))
      .toBeDefined();
  });

  it('should update existing list', function () {
    var tripToDublin = ListsService.getListByUUID('bf726d03-8fee-4614-8b68-f9f885938a51');
    tripToDublin.title = 'another trip to Dublin';
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/list/' + tripToDublin.uuid, tripToDublin)
       .respond(200, putExistingListResponse);
    ListsService.saveList(tripToDublin);
    $httpBackend.flush();
    expect(ListsService.getListByUUID(tripToDublin.uuid).modified)
      .toBe(putExistingListResponse.modified);
  });
});
