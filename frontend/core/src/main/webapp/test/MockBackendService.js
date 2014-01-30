/*global angular, getJSONFixture, sessionStorage */
'use strict';

function MockBackendService(MockListsBackendService) {
  
  // http://stackoverflow.com/a/105074/2659424
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  }
  function randomUUID() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
  }

  var expectResponse = function(method, url, data, headers, responseData) {
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
  }

  return {
    mockBackend: function() {
      MockListsBackendService.mockListsBackend(expectResponse);
    },
    mockListsBackend: function() {
      MockListsBackendService.mockListsBackend(expectResponse);
    }
  };
};

MockBackendService.$inject = ['MockListsBackendService'];
angular.module('em.testApp').factory('MockBackendService', MockBackendService);
