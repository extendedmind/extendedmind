/*global angular, getJSONFixture */
'use strict';

function MockAccountBackendService($httpBackend, AccountService) {
  var termsOfService =
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' +
  'Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s,' +
  'when an unknown printer took a galley of type and scrambled it to make a type specimen book.' +
  'It has survived not only five centuries, but also the leap into electronic typesetting,' +
  'remaining essentially unchanged.' +
  'It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,' +
  'and more recently with desktop publishing software' +
  'It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,' +
  'and more recently with desktop publishing software' +
  'like Aldus PageMaker including versions of Lorem Ipsum.';

  function mockGetAccount(expectResponse){
    $httpBackend.whenGET(AccountService.getAccountRegex)
    .respond(function(method, url, data, headers) {
      var accountResponse = getJSONFixture('accountResponse.json');
      return expectResponse(method, url, data, headers, accountResponse);
    });
  }

  function mockGetTermsOfService() {
    $httpBackend.whenGET('http://ext.md/terms.html').
    respond(termsOfService);
  }

  function mockGetPrivacyPolicy() {
    $httpBackend.whenGET('http://ext.md/privacy.html').
    respond(termsOfService);
  }

  function mockPutAccount(expectResponse) {
    $httpBackend.whenPUT(AccountService.putAccountRegex)
    .respond(function(method, url, data, headers) {
      var putAccountResponse = getJSONFixture('putAccountResponse.json');
      return expectResponse(method, url, data, headers, putAccountResponse);
    });
  }

  function mockLogout(expectResponse){
    $httpBackend.whenPOST(AccountService.postLogoutRegex)
    .respond(function(method, url, data, headers) {
      var logoutResponse = getJSONFixture('logoutResponse.json');
      return expectResponse(method, url, data, headers, logoutResponse);
    });
  }

  return {
    mockAccountBackend: function(expectResponse) {
      mockGetAccount(expectResponse);
      mockPutAccount(expectResponse);
      mockGetTermsOfService();
      mockGetPrivacyPolicy();
      mockLogout(expectResponse);
    }
  };
}

MockAccountBackendService.$inject = ['$httpBackend', 'AccountService'];
angular.module('em.appTest').factory('MockAccountBackendService', MockAccountBackendService);
