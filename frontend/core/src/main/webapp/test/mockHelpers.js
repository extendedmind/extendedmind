/*global $, angular, getJSONFixture*/

( function() {'use strict';

    var emMockHelpers = angular.module('em.mockHelpers', ['em.base64']);

    emMockHelpers.run(['$httpBackend', 'mockHttpBackendResponse',
    function($httpBackend, mockHttpBackendResponse) {

      var api_useruuid_items, api_useruuid_task_taskuuid, authenticateResponse, completeTaskResponse, itemsResponse, putItemResponse, putTaskResponse, uuid;

      uuid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
      api_useruuid_task_taskuuid = /\/api\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/task\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
      api_useruuid_items = new RegExp('api' + uuid + 'items');

      authenticateResponse = mockHttpBackendResponse.getAuthenticateResponse();
      completeTaskResponse = mockHttpBackendResponse.getCompleteTaskResponse();
      itemsResponse = mockHttpBackendResponse.getItemsResponse();
      putItemResponse = mockHttpBackendResponse.getPutItemResponse();
      putTaskResponse = mockHttpBackendResponse.getPutTaskResponse();

      $httpBackend.whenPOST('/api/authenticate').respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, authenticateResponse);
      });

      $httpBackend.whenPUT('/api/' + authenticateResponse.userUUID + '/item').respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, putItemResponse);
      });

      $httpBackend.whenPUT('/api/' + authenticateResponse.userUUID + '/task').respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, putTaskResponse);
      });

      $httpBackend.whenGET(api_useruuid_task_taskuuid).respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, completeTaskResponse);
      });

      $httpBackend.whenGET(api_useruuid_items).respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, itemsResponse);
      });

      $httpBackend.whenGET(/null/).respond(function(method, url, data, headers) {
        return [403, 'Forbidden'];
      });
    }]);

    emMockHelpers.factory('mockHttpBackendResponse', ['base64',
    function(base64) {
      return {
        expectResponse : function(method, url, data, headers, responseData) {
          var parsedAuthorizationHeader, userNamePass, parsedUserNamePass, userName, response;

          parsedAuthorizationHeader = headers.Authorization.split(' ');
          userNamePass = base64.decode(parsedAuthorizationHeader[1]);
          parsedUserNamePass = userNamePass.split(':');
          userName = parsedUserNamePass[0];

          if (userNamePass === 'timo@ext.md:timopwd') {
            response = [200, responseData];
          } else if (userName === 'token') {
            response = [200, responseData];
          } else {
            response = [403, 'Forbidden'];
          }
          return response;
        },
        getAuthenticateResponse : function() {
          return getJSONFixture('authenticateResponse.json');
        },
        getCompleteTaskResponse : function() {
          return getJSONFixture('completeTaskResponse.json');
        },
        getItemsResponse : function() {
          return getJSONFixture('itemsResponse.json');
        },
        getPutItemResponse : function() {
          return getJSONFixture('putItemResponse.json');
        },
        getPutTaskResponse : function() {
          return getJSONFixture('putTaskResponse.json');
        },
        clearSessionStorage : function() {
          sessionStorage.clear();
        },
        clearCookies : function() {
          var cookie, cookies, eqPos, i, name;
          cookies = document.cookie.split(';');

          for ( i = 0; i < cookies.length; i += 1) {
            cookie = cookies[i];
            eqPos = cookie.indexOf("=");
            name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
          }
        }
      };
    }]);
  }());
