/*global angular, getJSONFixture, sessionStorage */
'use strict';

function MockListsBackendService($httpBackend, ListsService, UUIDService) {  

  function mockPutNewList(expectResponse){
    $httpBackend.whenPUT(ListsService.putNewListRegex)
      .respond(function(method, url, data, headers) {
        var putNewListResponse = getJSONFixture('putListResponse.json');
        putNewListResponse.uuid = UUIDService.randomUUID();
        return expectResponse(method, url, data, headers, putNewListResponse);
      });
  };
  
  function mockPutExistingList(expectResponse){
    $httpBackend.whenPUT(ListsService.putExistingListRegex)
      .respond(function(method, url, data, headers) {
        var putExistingListResponse = getJSONFixture('putExistingListResponse.json');
        putExistingListResponse.uuid = UUIDService.randomUUID();
        return expectResponse(method, url, data, headers, putExistingListResponse);
      });
  };

  return {
    mockListsBackend: function(expectResponse) {
      mockPutNewList(expectResponse);
      mockPutExistingList(expectResponse);
    }
  };
};

MockListsBackendService.$inject = ['$httpBackend', 'ListsService', 'UUIDService'];
angular.module('em.testApp').factory('MockListsBackendService', MockListsBackendService);
