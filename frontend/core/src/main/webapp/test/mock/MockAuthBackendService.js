'use strict';

function MockAuthBackendService($httpBackend, AuthenticationService) {

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

  function mockLogout(expectResponse){
    $httpBackend.whenPOST(AuthenticationService.postLogoutRegex)
    .respond(function(method, url, data, headers) {
      var logoutResponse = getJSONFixture('logoutResponse.json');
      return expectResponse(method, url, data, headers, logoutResponse);
    });
  }

  function mockPostInviteRequest() {
    $httpBackend.whenPOST(AuthenticationService.postInviteRequestRegex).respond(function() {
      return [200, 'response'];
    });
  }
  
  function mockGetInvite(){
    $httpBackend.whenGET(AuthenticationService.getInviteRegex).respond(function() {
      var inviteResponse = getJSONFixture('inviteResponse.json');
      return [200, inviteResponse];
    });
  }

  function mockAcceptInvite() {
    $httpBackend.whenPOST(AuthenticationService.acceptInviteRegex).respond(function() {
      var acceptInviteResponse = getJSONFixture('acceptInviteResponse.json');
      return [200, acceptInviteResponse];
    });
  }

  function mockGetInviteRequestQueueNumber() {
    $httpBackend.whenGET(AuthenticationService.getInviteRequestQueueNumberRegex).respond(function() {
      return [200, 155500];
    });
  }
  
  return {
    mockAuthBackend: function(expectResponse) {
      mockAuthenticate(expectResponse);
      mockLogout(expectResponse);
      mockPostInviteRequest();
      mockGetInvite();
      mockAcceptInvite();
      mockGetInviteRequestQueueNumber();
    }
  };
}

MockAuthBackendService.$inject = ['$httpBackend', 'AuthenticationService'];
angular.module('em.appTest').factory('MockAuthBackendService', MockAuthBackendService);
