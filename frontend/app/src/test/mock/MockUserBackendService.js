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

 /*global angular, getJSONFixture */
'use strict';

function MockUserBackendService($httpBackend, UserService, UserSessionService) {
  var termsOfService =
  '<!DOCTYPE html>' +
  '<html><head>' +
  '<meta charset="utf-8">' +
  '<link rel="shortcut icon" href="static/favicon.ico">' +
'<style type="text/css"></style></head>' +
'<body>' +
  '<h1>Extended Mind</h1>' +
  '<h2>Terms and Conditions</h2>' +
  '<p><b>Effective Date</b></p>' +
  '<p>The Extended Mind Technologies Oy (“Extended Mind”) ....</p>' +
  '<p>By showing your consent to these terms and conditions...</p>' +
  '<h3>1. ”Effective Term”</h3>' +
  '<p>This Agreement is effective on the effective date (“the Effective Date”)...</p>' +
  '<h3>9. Restrictions</h3>' +
  '<p>You may not under any circumstances:</p>' +
  '<ul>' +
    '<li>111</li>' +
    '<li>222</li>' +
  '</ul>' +
  '<h3>9. Restrictions</h3>' +
  '<p>You may not under any circumstances:</p>' +
  '<ul>' +
    '<li>111</li>' +
    '<li>222</li>' +
  '</ul>' +
  '<h3>9. Restrictions</h3>' +
  '<p>You may not under any circumstances:</p>' +
  '<ul>' +
    '<li>111</li>' +
    '<li>222</li>' +
  '</ul>' +
  '<h3>9. Restrictions</h3>' +
  '<p>You may not under any circumstances:</p>' +
  '<ul>' +
    '<li>111</li>' +
    '<li>222</li>' +
  '</ul>' +
  '<p>Copyright © 2014 Extended Mind Technologies Oy. All rights reserved.</p>' +
'</body></html>';

  function mockGetAccount(expectResponse){
    $httpBackend.whenGET(UserService.getAccountRegex)
    .respond(function(method, url, data, headers) {
      var accountResponse = getJSONFixture('accountResponse.json');
      // Overwrite response with current preferences
      accountResponse.uuid = UserSessionService.getUserUUID();
      var userEmail = UserSessionService.getEmail();
      accountResponse.email = userEmail;
      accountResponse.preferences = UserSessionService.getTransportPreferences();
      accountResponse.sharedLists = UserSessionService.getSharedLists();
      accountResponse.emailVerified = UserSessionService.getEmailVerified();

      // EM collective has a predictable UUID but EMT does not, so use the UUID we already have
      for (var collectiveUUID in accountResponse.collectives){
        if (accountResponse.collectives.hasOwnProperty(collectiveUUID) &&
            accountResponse.collectives[collectiveUUID][2] === false){
          var existingCollectives = UserSessionService.getCollectives();
          for (var existingCollectiveUUID in existingCollectives){
            if (existingCollectives.hasOwnProperty(existingCollectiveUUID) &&
                existingCollectives[existingCollectiveUUID][2] === false){
              // This is the non-common UUID
              accountResponse.collectives[existingCollectiveUUID] =
                accountResponse.collectives[collectiveUUID];
              delete accountResponse.collectives[collectiveUUID];
              break;
            }
          }
          break;
        }
      }
      return expectResponse(method, url, data, headers, accountResponse);
    });
  }

  function mockGetTermsOfService() {
    $httpBackend.whenGET('/static/terms.html').
    respond(termsOfService);
  }

  function mockGetPrivacyPolicy() {
    $httpBackend.whenGET('/static/privacy.html').
    respond(termsOfService);
  }

  function mockPatchUser(expectResponse) {
    $httpBackend.whenPATCH(UserService.putAccountRegex)
    .respond(function(method, url, data, headers) {
      var patchUserResponse = getJSONFixture('patchUserResponse.json');
      return expectResponse(method, url, data, headers, patchUserResponse);
    });
  }

  function mockLogout(expectResponse){
    $httpBackend.whenPOST(UserService.postLogoutRegex)
    .respond(function(method, url, data, headers) {
      var logoutResponse = getJSONFixture('logoutResponse.json');
      return expectResponse(method, url, data, headers, logoutResponse);
    });
  }

  function mockResendVerification(expectResponse){
    $httpBackend.whenPOST(UserService.postResendVerificationRegex)
    .respond(function(method, url, data, headers) {
      var resendResponse = getJSONFixture('emailResendResponse.json');
      var now = Date.now();
      if (localStorage.getItem('expires')){
        localStorage.setItem('emailVerified', now);
      }
      sessionStorage.setItem('emailVerified', now);
      return expectResponse(method, url, data, headers, resendResponse);
    });
  }

  function mockDeleteAccount(expectResponse){
    $httpBackend.whenDELETE(UserService.deleteAccountRegex)
    .respond(function(method, url, data, headers) {
      var deleteAccountResponse = getJSONFixture('deleteAccountResponse.json');
      return expectResponse(method, url, data, headers, deleteAccountResponse);
    });
  }

  return {
    mockUserBackend: function(expectResponse) {
      mockGetAccount(expectResponse);
      mockPatchUser(expectResponse);
      mockGetTermsOfService();
      mockGetPrivacyPolicy();
      mockLogout(expectResponse);
      mockResendVerification(expectResponse);
      mockDeleteAccount(expectResponse);
    }
  };
}

MockUserBackendService['$inject'] = ['$httpBackend', 'UserService', 'UserSessionService'];
angular.module('em.appTest').factory('MockUserBackendService', MockUserBackendService);
