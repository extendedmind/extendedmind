/*global angular, getJSONFixture */
'use strict';

function MockAccountBackendService($httpBackend, AccountService) {

  function mockGetAccount(expectResponse){
    $httpBackend.whenGET(AccountService.getAccountRegex)
    .respond(function(method, url, data, headers) {
      var accountResponse = getJSONFixture('accountResponse.json');
      return expectResponse(method, url, data, headers, accountResponse);
    });
  }

  function mockPutAccount(expectResponse) {
    $httpBackend.whenPUT(AccountService.putAccountRegex)
    .respond(function(method, url, data, headers) {
      var putAccountResponse = getJSONFixture('putAccountResponse.json');
      return expectResponse(method, url, data, headers, putAccountResponse);
    });
  }
  
  return {
    mockAccountBackend: function(expectResponse) {
      mockGetAccount(expectResponse);
      mockPutAccount(expectResponse);
    }
  };
}

MockAccountBackendService.$inject = ['$httpBackend', 'AccountService'];
angular.module('em.appTest').factory('MockAccountBackendService', MockAccountBackendService);
