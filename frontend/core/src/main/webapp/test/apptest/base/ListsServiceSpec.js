/*global beforeEach, module, inject, describe, afterEach, it */
'use strict';

describe('ListService', function() {

  var ListsService, BackendClientService, $httpBackend;
  var mockUserSessionService;
  var MockBackendService;
  beforeEach(function() { 
    module('em.testApp');
    
    mockUserSessionService = {
      getCredentials: function () {
        return '123456789';
      },
      getActiveUUID: function () {
        return "6be16f46-7b35-4b2d-b875-e13d19681e77";
      }
    };

    module('em.services', function ($provide){
      $provide.value('UserSessionService', mockUserSessionService);
    });

    inject(function (_ListsService_, _BackendClientService_, _MockBackendService_) {
      ListsService = _ListsService_;
      BackendClientService = _BackendClientService_;
      MockBackendService = _MockBackendService_

      ListsService.setLists([{
        "uuid": "0da0bff6-3bd7-4884-adba-f47fab9f270d",
        "modified": 1390912600957,
        "title": "extended mind technologies",
        "link": "http://ext.md"
      }, {
        "uuid": "bf726d03-8fee-4614-8b68-f9f885938a51",
        "modified": 1390912600947,
        "title": "trip to Dublin",
        "completable": true,
        "due": "2013-10-31"
      }, {
        "uuid": "07bc96d1-e8b2-49a9-9d35-1eece6263f98",
        "modified": 1390912600983,
        "title": "write essay on cognitive biases",
        "completable": true
      }]);
    });

    MockBackendService.mockListsBackend();
  });

  it('should get lists', function () {
    expect(ListsService.getLists().length)
      .toBe(3);
  });
  it('should find list by uuid', function () {
    expect(ListsService.getListByUUID("bf726d03-8fee-4614-8b68-f9f885938a51"))
      .toBeDefined();
  });
  it('should not find list by unknown uuid', function () {
    expect(ListsService.getListByUUID("bf726d03-8fee-4614-8b68-f9f885938a50"))
      .toBeUndefined();
  });
  it('should save new list', function () {
    var testList = {
      "title": "test list"
    };
    expect(ListsService.saveList(testList))
      .toBeDefined();
  });
});
