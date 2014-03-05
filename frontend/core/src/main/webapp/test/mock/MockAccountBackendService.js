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

  function mockPutChangePassword(expectResponse) {
    $httpBackend.whenPUT(AccountService.putChangePasswordRegex).respond(function(method, url, data, headers) {
      var changePasswordResponse = getJSONFixture('passwordResponse.json');
      return expectResponse(method, url, data, headers, changePasswordResponse);
    });
  }
  
  return {
    mockAccountBackend: function(expectResponse) {
      mockGetAccount(expectResponse);
      mockPutChangePassword(expectResponse);
    }
  };
}

MockAccountBackendService.$inject = ['$httpBackend', 'AccountService'];
angular.module('em.appTest').factory('MockAccountBackendService', MockAccountBackendService);
