/*global angular, getJSONFixture */
'use strict';

function MockAuthBackendService($httpBackend, AuthenticationService) {

  function mockAuthenticate(expectResponse){
    $httpBackend.whenPOST(AuthenticationService.authenticateRegex)
      .respond(function(method, url, data, headers) {
        var authenticateResponse = getJSONFixture('authenticateResponse.json');
        var now = new Date();
        authenticateResponse.authenticated = now.getTime();
        authenticateResponse.expires = now.getTime() + 1000*60*60*12;
        if (data.indexOf("true") != -1){
          authenticateResponse.replaceable = now.getTime() + 1000*60*60*24*7;
        }
        return expectResponse(method, url, data, headers, authenticateResponse);
      });
  }

  function mockLogout(expectResponse){
    $httpBackend.whenPOST(AuthenticationService.logoutRegex)
      .respond(function(method, url, data, headers) {
        var logoutResponse = getJSONFixture('logoutResponse.json');
        return expectResponse(method, url, data, headers, logoutResponse);
      });
  }

  
  function mockGetInvite(expectResponse){
    $httpBackend.whenGET(AuthenticationService.getInviteRegex)
      .respond(function(method, url, data, headers) {
        var inviteinviteResponseRegex = getJSONFixture('inviteResponse.json');
        return expectResponse(method, url, data, headers, inviteResponse);
      });
  }

  function mockAcceptInvite(expectResponse) {
    $httpBackend.whenPOST(AuthenticationService.acceptInviteRegex)
      .respond(function(method, url, data, headers) {
        var acceptInviteResponse = getJSONFixture('acceptInviteResponse.json');
        return expectResponse(method, url, data, headers, acceptInviteResponse);
      });
  }
  
  return {
    mockAuthBackend: function(expectResponse) {
      mockAuthenticate(expectResponse);
      mockLogout(expectResponse);
      mockGetInvite(expectResponse);
      mockAcceptInvite(expectResponse);
    }
  };
}

MockAuthBackendService.$inject = ['$httpBackend', 'AuthenticationService'];
angular.module('em.appTest').factory('MockAuthBackendService', MockAuthBackendService);
