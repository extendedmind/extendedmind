/*global angular, getJSONFixture, sessionStorage */
'use strict';

function MockListsBackendService($httpBackend, ListsService, UUIDService) {  

  function mockPutNewList(expectResponse){
    $httpBackend.whenPUT(ListsService.putNewListRegex)
      .respond(function(method, url, data, headers) {
        var putNewListResponse = getJSONFixture('putListResponse.json');
        putNewListResponse.modified = (new Date()).getTime();
        putNewListResponse.uuid = UUIDService.randomUUID();
        return expectResponse(method, url, data, headers, putNewListResponse);
      });
  };
  
  function mockPutExistingList(expectResponse){
    $httpBackend.whenPUT(ListsService.putExistingListRegex)
      .respond(function(method, url, data, headers) {
        var putExistingListResponse = getJSONFixture('putExistingListResponse.json');
        putExistingListResponse.modified = (new Date()).getTime();
        return expectResponse(method, url, data, headers, putExistingListResponse);
      });
  };

  function mockDeleteList(expectResponse){
    $httpBackend.whenDELETE(ListsService.deleteListRegex)
      .respond(function(method, url, data, headers) {
        var deleteListResponse = getJSONFixture('deleteListResponse.json');
        deleteListResponse.result.modified = (new Date()).getTime();
        return expectResponse(method, url, data, headers, deleteListResponse);
      });    
  };

  function mockUndeleteList(expectResponse){
    $httpBackend.whenPOST(ListsService.undeleteListRegex)
      .respond(function(method, url, data, headers) {
        var undeleteListResponse = getJSONFixture('undeleteListResponse.json');
        undeleteListResponse.modified = (new Date()).getTime();
        return expectResponse(method, url, data, headers, undeleteListResponse);
      });    
  };

  function mockArchiveList(expectResponse){
    $httpBackend.whenPOST(ListsService.undeleteListRegex)
      .respond(function(method, url, data, headers) {
        var archiveListResponse = getJSONFixture('archiveListResponse.json');
        archiveListResponse.result.modified = (new Date()).getTime();
        return expectResponse(method, url, data, headers, archiveListResponse);
      });    
  };

  return {
    mockListsBackend: function(expectResponse) {
      mockPutNewList(expectResponse);
      mockPutExistingList(expectResponse);
      mockDeleteList(expectResponse);
      mockUndeleteList(expectResponse);
      mockArchiveList(expectResponse);
    }
  };
};

MockListsBackendService.$inject = ['$httpBackend', 'ListsService', 'UUIDService'];
angular.module('em.appTest').factory('MockListsBackendService', MockListsBackendService);
