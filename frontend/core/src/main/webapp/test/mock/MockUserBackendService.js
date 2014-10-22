/* Copyright 2013-2014 Extended Mind Technologies Oy
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
    $httpBackend.whenGET(UserService.getAccountRegex)
    .respond(function(method, url, data, headers) {
      var accountResponse = getJSONFixture('accountResponse.json');
      // Overwrite response with current preferences
      accountResponse.email = UserSessionService.getEmail()
      accountResponse.preferences = UserSessionService.getTransportPreferences();
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
    $httpBackend.whenPUT(UserService.putAccountRegex)
    .respond(function(method, url, data, headers) {
      var putAccountResponse = getJSONFixture('putAccountResponse.json');
      return expectResponse(method, url, data, headers, putAccountResponse);
    });
  }

  function mockLogout(expectResponse){
    $httpBackend.whenPOST(UserService.postLogoutRegex)
    .respond(function(method, url, data, headers) {
      var logoutResponse = getJSONFixture('logoutResponse.json');
      return expectResponse(method, url, data, headers, logoutResponse);
    });
  }

  return {
    mockUserBackend: function(expectResponse) {
      mockGetAccount(expectResponse);
      mockPutAccount(expectResponse);
      mockGetTermsOfService();
      mockGetPrivacyPolicy();
      mockLogout(expectResponse);
    }
  };
}

MockUserBackendService.$inject = ['$httpBackend', 'UserService', 'UserSessionService'];
angular.module('em.appTest').factory('MockUserBackendService', MockUserBackendService);
