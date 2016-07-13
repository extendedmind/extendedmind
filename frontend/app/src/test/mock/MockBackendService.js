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

 function MockBackendService(MockListsBackendService, MockTagsBackendService, MockTasksBackendService,
                             MockNotesBackendService, MockItemsBackendService, MockConvertBackendService,
                             MockUserBackendService, MockAuthBackendService, MockAdminBackendService,
                             MockPublicBackendService, base64) {
  return {
    expectResponse: function(method, url, data, headers, responseData, skipAuthenticationCheck) {
      var parsedAuthorizationHeader, userNamePass, parsedUserNamePass, userName, response;
      if (!skipAuthenticationCheck) {
        parsedAuthorizationHeader = headers.Authorization.split(' ');
        userNamePass = base64.decode(parsedAuthorizationHeader[1]);
        parsedUserNamePass = userNamePass.split(':');
        userName = parsedUserNamePass[0];

        // USER WITH DATA
        if (userNamePass === 'timo@extendedmind.org:timopwd') {
          response = [200, responseData];
        }

        // USER WITH DATA - OFFLINE
        else if (userNamePass === 'timo@extendedmind.org:timopwdoffline') {
          if (responseData.token) responseData.token = 'OFFLINE';
          response = [200, responseData];
        }

        // NEW USER
        else if (userNamePass === 'jp@extendedmind.org:jiipeepwd') {
          responseData.userType = 2;
          if (responseData.token) responseData.token = 'TEST';
          var preferences = sessionStorage.getItem('preferences');

          if (preferences){
            responseData.preferences = JSON.parse(preferences);
            if (responseData.preferences.ui)
              responseData.preferences.ui = JSON.stringify(responseData.preferences.ui);
          }
          if (responseData.collectives){
            for (var uuid in responseData.collectives){
              if (responseData.collectives[uuid][2] === false){
                delete responseData.collectives[uuid];
              }
            }
          }
          response = [200, responseData];
        }
        // EMAIL UNVERIFIED USER
        else if (userNamePass === 'info@extendedmind.org:infopwd') {
          if (responseData.token){
            responseData.userType = 2;
            if (responseData.token) responseData.token = 'TEST';
            if (responseData.collectives){
              for (var uuid in responseData.collectives){
                if (responseData.collectives[uuid][2] === false){
                  delete responseData.collectives[uuid];
                }
              }
            }
            delete responseData.emailVerified;
            responseData.token = 'UNVERIFIED';
          }
          response = [200, responseData];
        }
        else if (userName === 'token') {
          response = [200, responseData];
        }
        else if (userNamePass === 'example@example.com:examplePass') {
          response = [200, responseData];
        }
        else if (userNamePass === 'lauri@extendedmind.org:lauripwd') {
          if (responseData.token){
            responseData = getJSONFixture('sharedToAuthenticateResponse.json');
            responseData.token = 'SHARED';
          }
          response = [200, responseData];
        }
        else if (userNamePass === 'premium@extendedmind.org:premium') {
          response = [403, {code: 24}]; // Backend error code for premium.
        }
        else {
          response = [403, 'Forbidden'];
        }
      } else {
        response = [200, responseData];
      }
      return response;
    },
    mockBackend: function() {
      this.mockListsBackend();
      this.mockTagsBackend();
      this.mockTasksBackend();
      this.mockNotesBackend();
      this.mockItemsBackend();
      this.mockConvertBackend();
      this.mockAccountBackend();
      this.mockAuthBackend();
      this.mockAdminBackend();
      this.mockPublicBackend();
    },
    mockListsBackend: function() {
      MockListsBackendService.mockListsBackend(this.expectResponse);
    },
    mockTagsBackend: function() {
      MockTagsBackendService.mockTagsBackend(this.expectResponse);
    },
    mockTasksBackend: function() {
      MockTasksBackendService.mockTasksBackend(this.expectResponse);
    },
    mockNotesBackend: function() {
      MockNotesBackendService.mockNotesBackend(this.expectResponse);
    },
    mockItemsBackend: function() {
      MockItemsBackendService.mockItemsBackend(this.expectResponse);
    },
    mockConvertBackend: function() {
      MockConvertBackendService.mockConvertBackend(this.expectResponse);
    },
    mockAccountBackend: function() {
      MockUserBackendService.mockUserBackend(this.expectResponse);
    },
    mockAdminBackend: function() {
      MockAdminBackendService.mockAdminBackend(this.expectResponse);
    },
    mockAuthBackend: function() {
      MockAuthBackendService.mockAuthBackend(this.expectResponse);
    },
    mockPublicBackend: function(){
      MockPublicBackendService.mockPublicBackend(this.expectResponse);
    }
  };
}

MockBackendService['$inject'] = [
'MockListsBackendService', 'MockTagsBackendService', 'MockTasksBackendService', 'MockNotesBackendService',
'MockItemsBackendService', 'MockConvertBackendService', 'MockUserBackendService', 'MockAuthBackendService',
'MockAdminBackendService', 'MockPublicBackendService', 'base64'
];
angular.module('em.appTest').factory('MockBackendService', MockBackendService);
