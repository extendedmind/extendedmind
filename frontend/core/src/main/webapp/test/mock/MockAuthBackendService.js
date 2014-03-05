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
    $httpBackend.whenPOST(AuthenticationService.postInviteRequestRegex).respond(function(method, url, data) {
      var inviteRequestResponse = getJSONFixture('inviteRequestResponse.json');
      // Existing user
      var parsedData = JSON.parse(data);
      if (parsedData.email === 'jp@ext.md' || parsedData.email === 'timo@ext.md') {
        inviteRequestResponse = {
          resultType: 'user'
        };
      }
      // Invited user
      else if (parsedData.email === 'info@ext.md') {
        inviteRequestResponse.resultType = 'invite';
      }
      // Invite request
      else if (parsedData.email === 'example@example.com') {
        inviteRequestResponse.resultType = 'inviteRequest';
      }
      // New invite
      else {
        inviteRequestResponse.resultType = 'newInviteRequest';
      }
      return [200, inviteRequestResponse];
    });
  }

  function mockPutChangePassword(expectResponse) {
    $httpBackend.whenPUT(AuthenticationService.putChangePasswordRegex).respond(function(method, url, data, headers) {
      var changePasswordResponse = getJSONFixture('passwordResponse.json');
      return expectResponse(method, url, data, headers, changePasswordResponse, true);
    });
  }

  function mockPostForgotPassword() {
    $httpBackend.whenPOST(AuthenticationService.postForgotPasswordRegex).respond(function(method, url, data) {
      var forgotPasswordResponse = getJSONFixture('forgotPasswordResponse.json');
      var parsedData = JSON.parse(data);
      if (parsedData.email !== 'jp@ext.md' && parsedData.email !== 'timo@ext.md') {
        return [400, {}];
      }
      return [200, forgotPasswordResponse];
    });
  }

  function mockGetPasswordResetExpires(expectResponse) {
    $httpBackend.whenGET(AuthenticationService.getPasswordResetExpiresRegex).respond(function(method, url, data, headers) {
      var passwordResetExpiresResponse = getJSONFixture('passwordResetExpiresResponse.json');
      return expectResponse(method, url, data, headers, passwordResetExpiresResponse, true);
    });
  }

  function mockPostResetPassword(expectResponse) {
    $httpBackend.whenPOST(AuthenticationService.postResetPasswordRegex).respond(function(method, url, data, headers) {
      var resetPasswordResponse = getJSONFixture('resetPasswordResponse.json');
      return expectResponse(method, url, data, headers, resetPasswordResponse, true);
    });
  }
  
  return {
    mockAuthBackend: function(expectResponse) {
      mockAcceptInvite();
      mockAuthenticate(expectResponse);
      mockGetInvite();
      mockLogout(expectResponse);
      mockPutChangePassword(expectResponse);
      mockPostInviteRequest();
      mockPostForgotPassword();
      mockGetPasswordResetExpires(expectResponse);
      mockPostResetPassword(expectResponse);
    }
  };
}

MockAuthBackendService.$inject = ['$httpBackend', 'AuthenticationService'];
angular.module('em.appTest').factory('MockAuthBackendService', MockAuthBackendService);
