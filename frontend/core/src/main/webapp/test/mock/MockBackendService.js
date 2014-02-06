/*global angular, getJSONFixture, sessionStorage */
'use strict';

function MockBackendService(MockListsBackendService, MockTagsBackendService, MockTasksBackendService, MockNotesBackendService,
                            MockItemsBackendService, MockAccountBackendService, MockAuthBackendService, base64) {
  var skipAuthenticationCheck;

  return {
    setSkipAuthenticationCheck: function() {
      skipAuthenticationCheck = true;
    },
    expectResponse: function(method, url, data, headers, responseData) {
      var parsedAuthorizationHeader, userNamePass, parsedUserNamePass, userName, response;

      parsedAuthorizationHeader = headers.Authorization.split(' ');
      userNamePass = base64.decode(parsedAuthorizationHeader[1]);
      parsedUserNamePass = userNamePass.split(':');
      userName = parsedUserNamePass[0];

      if (!skipAuthenticationCheck) {
        if (userNamePass === 'timo@ext.md:timopwd') {
          response = [200, responseData];
        } else if (userNamePass === 'jp@ext.md:jppwd') {
          response = [200, responseData];
        } else if (userName === 'token') {
          response = [200, responseData];
        } else if (userNamePass === 'example@example.com:examplePass') {
          response = [200, responseData];
        } else {
          response = [403, 'Forbidden'];
        }
      } else {
        response = [200, responseData];
        skipAuthenticationCheck = false;
      }
      return response;
    },
    mockBackend: function() {
      this.mockListsBackend();
      this.mockTagsBackend();
      this.mockTasksBackend();
      this.mockNotesBackend();
      this.mockItemsBackend();
      this.mockAccountBackend();
      this.mockAuthBackend();
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
    mockAccountBackend: function() {
      MockAccountBackendService.mockAccountBackend(this.expectResponse);
    },
    mockAuthBackend: function() {
      MockAuthBackendService.mockAuthBackend(this.expectResponse);
    }
  };
};

MockBackendService.$inject = ['MockListsBackendService', 'MockTagsBackendService', 'MockTasksBackendService', 'MockNotesBackendService',
                              'MockItemsBackendService', 'MockAccountBackendService', 'MockAuthBackendService', 'base64'];
angular.module('em.appTest').factory('MockBackendService', MockBackendService);
