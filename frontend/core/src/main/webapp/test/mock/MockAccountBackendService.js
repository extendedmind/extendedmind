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
  
  return {
    mockAccountBackend: function(expectResponse) {
      mockGetAccount(expectResponse);
    }
  };
}

MockAccountBackendService.$inject = ['$httpBackend', 'AccountService'];
angular.module('em.appTest').factory('MockAccountBackendService', MockAccountBackendService);
