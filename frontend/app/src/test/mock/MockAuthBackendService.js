/* Copyright 2013-2016 Extended Mind Technologies Oy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 'use strict';

function MockAuthBackendService($httpBackend, AuthenticationService, UUIDService) {

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
      var verifyEmailResponse = getJSONFixture('verifyEmailResponse.json');
      return [200, verifyEmailResponse];
    });
  }

  function mockPostAcceptShare() {
    $httpBackend.whenPOST(AuthenticationService.postAcceptShareRegex).respond(function(method, url, data, headers) {
      var acceptShareResponse = getJSONFixture('acceptAgreementResponse.json');
      return [200, acceptShareResponse];
    });
  }

  function mockPostSignUp() {
    $httpBackend.whenPOST(AuthenticationService.postSignUpRegex).respond(function(method, url, data, headers) {
      var signUpResponse = getJSONFixture('signUpResponse.json');
      var authenticateResponse = getJSONFixture('authenticateResponse.json');
      signUpResponse.uuid = authenticateResponse.userUUID;
      signUpResponse.modified = authenticateResponse.modified;
      return [200, signUpResponse];
    });
  }

  function mockPostChangePassword(expectResponse) {
    $httpBackend.whenPOST(AuthenticationService.postChangePasswordRegex).respond(function(method, url, data, headers) {
      var changePasswordResponse = getJSONFixture('passwordResponse.json');
      return expectResponse(method, url, data, headers, changePasswordResponse);
    });
  }

  function mockPostChangeEmail(expectResponse) {
    $httpBackend.whenPOST(AuthenticationService.postChangeEmailRegex).respond(function(method, url, data, headers) {
      var changeEmailResponse = getJSONFixture('changeEmailResponse.json');
      return expectResponse(method, url, data, headers, changeEmailResponse);
    });
  }

  return {
    mockAuthBackend: function(expectResponse) {
      mockAuthenticate(expectResponse);
      mockPostForgotPassword();
      mockGetPasswordResetExpires(expectResponse);
      mockPostResetPassword(expectResponse);
      mockPostVerifyEmail();
      mockPostAcceptShare();
      mockPostSignUp();
      mockPostChangePassword(expectResponse);
      mockPostChangeEmail(expectResponse);
    }
  };
}

MockAuthBackendService['$inject'] = ['$httpBackend', 'AuthenticationService', 'UUIDService'];
angular.module('em.appTest').factory('MockAuthBackendService', MockAuthBackendService);
