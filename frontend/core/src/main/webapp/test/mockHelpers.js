/*global $, angular, getJSONFixture*/

( function() {'use strict';

    var emMockHelpers = angular.module('em.mockHelpers', ['em.base64']);

    emMockHelpers.run(['$httpBackend', 'mockHttpBackendResponse',
    function($httpBackend, mockHttpBackendResponse) {

      var api_useruuid_items, authenticateResponse, completeTask, completeTaskResponse, deleteItem, itemsResponse, putItemResponse, putTaskResponse, putExistingTask, putExistingTaskResponse, uncompleteTask, uncompleteTaskResponse, uuid;

      uuid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

      deleteItem = /\/api\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/item\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
      putExistingTask = /\/api\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/task\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
      completeTask = /\/api\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/task\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/complete/;
      uncompleteTask = /\/api\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/task\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/uncomplete/;

      api_useruuid_items = new RegExp('api' + uuid + 'items');

      authenticateResponse = mockHttpBackendResponse.getAuthenticateResponse();
      completeTaskResponse = mockHttpBackendResponse.getCompleteTaskResponse();
      itemsResponse = mockHttpBackendResponse.getItemsResponse();
      putItemResponse = mockHttpBackendResponse.getPutItemResponse();

      putTaskResponse = mockHttpBackendResponse.getPutTaskResponse();
      putExistingTaskResponse = mockHttpBackendResponse.getputExistingTaskResponse();

      uncompleteTaskResponse = mockHttpBackendResponse.getUncompleteTaskResponse();

      $httpBackend.whenPOST('/api/authenticate').respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, authenticateResponse);
      });

      $httpBackend.whenPUT('/api/' + authenticateResponse.userUUID + '/item').respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, putItemResponse);
      });

      $httpBackend.whenDELETE(deleteItem).respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers);
      });

      $httpBackend.whenPUT('/api/' + authenticateResponse.userUUID + '/task').respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, putTaskResponse);
      });

      $httpBackend.whenPUT(putExistingTask).respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, putExistingTaskResponse);
      });

      $httpBackend.whenGET(completeTask).respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, completeTaskResponse);
      });

      $httpBackend.whenGET(uncompleteTask).respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, uncompleteTaskResponse);
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
        getDeleteItemResponse : function() {
          return getJSONFixture('itemsResponse.json');
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
        getputExistingTaskResponse : function() {
          return getJSONFixture('putTaskResponse.json');
        },
        getUncompleteTaskResponse : function() {
          return getJSONFixture('uncompleteTaskResponse.json');
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
