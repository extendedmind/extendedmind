'use strict';

function MockAuthBackendService($httpBackend, AuthenticationService, UUIDService) {

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
      authenticateResponse.userUUID = UUIDService.randomUUID();
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
        inviteRequestResponse = {resultType: 'signUp'};
      }
      else if (parsedData.email === 'coupon@example.com') {
        inviteRequestResponse.resultType = 'inviteCoupon';
      }
      else if (parsedData.email === 'automatic@example.com') {
        inviteRequestResponse.resultType = 'inviteAutomatic';
      }
      else if (parsedData.email === 'test@ext.md') {
        inviteRequestResponse.resultType = 'inviteRequest';
      }
      // New invite
      else {
        inviteRequestResponse.resultType = 'newInviteRequest';
      }
      return [200, inviteRequestResponse];
    });
  }


  function mockPostInviteRequestBypass() {
    $httpBackend.whenPOST(AuthenticationService.postInviteRequestBypassRegex).respond(function(method, url, data) {
      var inviteResponse = getJSONFixture('inviteResponse.json');
      var parsedData = JSON.parse(data);
      if (parsedData.coupon === '1234') {
        return [400, {}];
      }
      return [200, inviteResponse];
    });
  }

  function mockResendInvite() {
    $httpBackend.whenPOST(AuthenticationService.resendInviteRegex).respond(function(method, url, data) {
      var resendInviteResponse = getJSONFixture('resendInviteResponse.json');
      return [200, resendInviteResponse];
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

  function mockPostVerifyEmail() {
    $httpBackend.whenPOST(AuthenticationService.postVerifyEmailRegex).respond(function(method, url, data, headers) {
      var verifyEmailResponse = getJSONFixture('putAccountResponse.json');
      return [200, verifyEmailResponse];
    });
  }

  function mockPostSignUp() {
    $httpBackend.whenPOST(AuthenticationService.postSignUpRegex).respond(function(method, url, data, headers) {
      var signUpResponse = getJSONFixture('signUpResponse.json');
      return [200, signUpResponse];
    });
  }

  function mockPutChangePassword(expectResponse) {
    $httpBackend.whenPUT(AuthenticationService.putChangePasswordRegex).respond(function(method, url, data, headers) {
      var changePasswordResponse = getJSONFixture('passwordResponse.json');
      return expectResponse(method, url, data, headers, changePasswordResponse);
    });
  }

  return {
    mockAuthBackend: function(expectResponse) {
      mockAcceptInvite();
      mockAuthenticate(expectResponse);
      mockGetInvite();
      mockPostInviteRequest();
      mockPostInviteRequestBypass();
      mockResendInvite();
      mockPostForgotPassword();
      mockGetPasswordResetExpires(expectResponse);
      mockPostResetPassword(expectResponse);
      mockPostVerifyEmail();
      mockPostSignUp();
      mockPutChangePassword(expectResponse);
    }
  };
}

MockAuthBackendService.$inject = ['$httpBackend', 'AuthenticationService', 'UUIDService'];
angular.module('em.appTest').factory('MockAuthBackendService', MockAuthBackendService);
