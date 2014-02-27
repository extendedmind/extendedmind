'use strict';

function MockAuthBackendService($httpBackend, AuthenticationService) {

  function mockAcceptInvite() {
    $httpBackend.whenPOST(AuthenticationService.acceptInviteRegex).respond(function() {
      var acceptInviteResponse = getJSONFixture('acceptInviteResponse.json');
      return [200, acceptInviteResponse];
    });
  }

  function mockAuthenticate(expectResponse){
    $httpBackend.whenPOST(AuthenticationService.postAuthenticateRegex)
    .respond(function(method, url, data, headers) {
      var authenticateResponse = getJSONFixture('authenticateResponse.json');
      var now = new Date();
      authenticateResponse.authenticated = now.getTime();
      authenticateResponse.expires = now.getTime() + 1000*60*60*12;
      if (data.indexOf('true') != -1){
        authenticateResponse.replaceable = now.getTime() + 1000*60*60*24*7;
      }
      return expectResponse(method, url, data, headers, authenticateResponse);
    });
  }
  
  function mockGetInvite(){
    $httpBackend.whenGET(AuthenticationService.getInviteRegex).respond(function() {
      var inviteResponse = getJSONFixture('inviteResponse.json');
      return [200, inviteResponse];
    });
  }

  function mockLogout(expectResponse){
    $httpBackend.whenPOST(AuthenticationService.postLogoutRegex)
    .respond(function(method, url, data, headers) {
      var logoutResponse = getJSONFixture('logoutResponse.json');
      return expectResponse(method, url, data, headers, logoutResponse);
    });
  }

  function mockPostInviteRequest() {
    $httpBackend.whenPOST(AuthenticationService.postInviteRequestRegex).respond(function() {
      var inviteRequestResponse = getJSONFixture('inviteRequestResponse.json');
      return [200, inviteRequestResponse];
    });
  }
  
  return {
    mockAuthBackend: function(expectResponse) {
      mockAcceptInvite();
      mockAuthenticate(expectResponse);
      mockGetInvite();
      mockLogout(expectResponse);
      mockPostInviteRequest();
    }
  };
}

MockAuthBackendService.$inject = ['$httpBackend', 'AuthenticationService'];
angular.module('em.appTest').factory('MockAuthBackendService', MockAuthBackendService);
