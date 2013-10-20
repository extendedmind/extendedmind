/*global $, angular, getJSONFixture*/

( function() {'use strict';

    var emMockHelpers = angular.module('em.mockHelpers', ['em.base64']);

    emMockHelpers.run(['$httpBackend', 'mockHttpBackendResponse',
    function($httpBackend, mockHttpBackendResponse) {

      var api_useruuid_items, authenticateResponse,

      // get
      itemsResponse, collectiveItemsResponse,

      // complete
      completeTask, completeTaskResponse,

      // delete
      deleteItem, deleteItemResponse, deleteNote, deleteNoteResponse, deleteTask, deleteTaskResponse,

      // put new
      putItem, putItemResponse, putNote, putNoteResponse, putTask, putTaskResponse,

      // existing items
      putExistingNote, putExistingNoteResponse, putExistingTask, putExistingTaskResponse,

      // uncomplete
      uncompleteTask, uncompleteTaskResponse, uuid;

      uuid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

      putItem = /\/api\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/item/;
      putNote = /\/api\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/note/;
      putTask = /\/api\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/task/;

      putExistingNote = /\/api\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/note\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
      putExistingTask = /\/api\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/task\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

      completeTask = /\/api\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/task\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/complete/;
      uncompleteTask = /\/api\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/task\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/uncomplete/;

      api_useruuid_items = new RegExp('api' + uuid + 'items');

      // delete
      deleteItem = /\/api\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/item\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
      deleteNote = /\/api\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/note\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
      deleteTask = /\/api\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/task\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

      deleteItemResponse = mockHttpBackendResponse.getDeleteItemResponse();
      deleteNoteResponse = mockHttpBackendResponse.getDeleteNoteResponse();
      deleteTaskResponse = mockHttpBackendResponse.getDeleteTaskResponse();

      authenticateResponse = mockHttpBackendResponse.getAuthenticateResponse();
      completeTaskResponse = mockHttpBackendResponse.getCompleteTaskResponse();

      // get
      itemsResponse = mockHttpBackendResponse.getItemsResponse();
      collectiveItemsResponse = mockHttpBackendResponse.getCollectiveItemsResponse();

      // put new
      putItemResponse = mockHttpBackendResponse.getPutItemResponse();
      putNoteResponse = mockHttpBackendResponse.getPutNoteResponse();
      putTaskResponse = mockHttpBackendResponse.getPutTaskResponse();

      putExistingTaskResponse = mockHttpBackendResponse.getputExistingTaskResponse();
      putExistingNoteResponse = mockHttpBackendResponse.getPutExistingNoteResponse();

      uncompleteTaskResponse = mockHttpBackendResponse.getUncompleteTaskResponse();

      $httpBackend.whenPOST('/api/authenticate').respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, authenticateResponse);
      });

      $httpBackend.whenPUT(putItem).respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, putItemResponse);
      });

      // delete
      $httpBackend.whenDELETE(deleteItem).respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, deleteItemResponse);
      });

      $httpBackend.whenDELETE(deleteNote).respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, deleteNoteResponse);
      });

      $httpBackend.whenDELETE(deleteTask).respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, deleteTaskResponse);
      });

      // tasks
      $httpBackend.whenPOST(completeTask).respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, completeTaskResponse);
      });

      $httpBackend.whenPOST(uncompleteTask).respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, uncompleteTaskResponse);
      });

      $httpBackend.whenPUT(putExistingTask).respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, putExistingTaskResponse);
      });

      $httpBackend.whenPUT(putTask).respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, putTaskResponse);
      });

      // notes
      $httpBackend.whenPUT(putExistingNote).respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, putExistingNoteResponse);
      });

      $httpBackend.whenPUT(putNote).respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, putNoteResponse);
      });

      $httpBackend.whenGET(api_useruuid_items).respond(function(method, url, data, headers) {
        var uuid = url.split('/'), key;

        for (key in authenticateResponse.collectives) {
          if (authenticateResponse.collectives.hasOwnProperty(key)) {
            if (uuid[2] === key) {
              return mockHttpBackendResponse.expectResponse(method, url, data, headers, collectiveItemsResponse);
            }
          }
        }

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
          } else if (userNamePass === 'jp@ext.md:jppwd') {
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

        // delete
        getDeleteItemResponse : function() {
          return getJSONFixture('deleteItemResponse.json');
        },
        getDeleteNoteResponse : function() {
          return getJSONFixture('deleteNoteResponse.json');
        },
        getDeleteTaskResponse : function() {
          return getJSONFixture('deleteTaskResponse.json');
        },

        // get
        getItemsResponse : function() {
          return getJSONFixture('itemsResponse.json');
        },
        getCollectiveItemsResponse : function() {
          return getJSONFixture('collectiveItemsResponse.json');
        },

        // put new
        getPutItemResponse : function() {
          return getJSONFixture('putItemResponse.json');
        },
        getPutNoteResponse : function() {
          return getJSONFixture('putNoteResponse.json');
        },
        getPutTaskResponse : function() {
          return getJSONFixture('putTaskResponse.json');
        },

        // existing items
        getPutExistingNoteResponse : function() {
          return getJSONFixture('putExistingNoteResponse.json');
        },
        getputExistingTaskResponse : function() {
          return getJSONFixture('putExistingTaskResponse.json');
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
