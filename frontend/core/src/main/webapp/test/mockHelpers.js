/*global angular, getJSONFixture, sessionStorage */
'use strict';
/*
angular.module('em.mockHelpers', ['em.base64']);

angular.module('em.mockHelpers').run(['$httpBackend', 'mockHttpBackendResponse',
  function($httpBackend, mockHttpBackendResponse) {

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

    var api_useruuid_items,

    // account
    accountResponse, authenticateResponse,
    invitePostFix, inviteResponse,
    logoutResponse, signUpPostFix, signUpResponse,
    
    // get
    itemsResponse, collectiveItemsResponse,

    // complete
    completeTask, completeTaskResponse,

    // delete
    deleteItem, deleteItemResponse, deleteNote, deleteNoteResponse, deleteTask, deleteTaskResponse,

    // put new
    putItem, putItemResponse, putNote, putNoteResponse, putTask, putTaskResponse,

    // existing items
    putExistingItem, putExistingItemResponse, putExistingNote, putExistingNoteResponse, putExistingTask, putExistingTaskResponse,

    // uncomplete
    uncompleteTask, uncompleteTaskResponse, uuid;

    uuid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
    // invitePostFix = 'hex_code?email=example@example.com';
    // signUpPostFix = /^[0-9]{19}$/;
    signUpPostFix = 5170675547180559977;

    invitePostFix = '/api/invite/hex_code?email=example@example.com';

    putItem = /\/api\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/item/;
    putNote = /\/api\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/note/;
    putTask = /\/api\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/task/;

    putExistingItem = /\/api\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/item\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
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

    // account
    accountResponse = mockHttpBackendResponse.getAccountResponse();
    authenticateResponse = mockHttpBackendResponse.getAuthenticateResponse();
    inviteResponse = mockHttpBackendResponse.getInviteResponse();
    signUpResponse = mockHttpBackendResponse.getSignUpResponse();
    logoutResponse = mockHttpBackendResponse.getLogoutResponse();

    completeTaskResponse = mockHttpBackendResponse.getCompleteTaskResponse();

    // get
    itemsResponse = mockHttpBackendResponse.getItemsResponse();
    collectiveItemsResponse = mockHttpBackendResponse.getCollectiveItemsResponse();

    // put new
    putItemResponse = mockHttpBackendResponse.getPutItemResponse();
    putNoteResponse = mockHttpBackendResponse.getPutNoteResponse();
    putTaskResponse = mockHttpBackendResponse.getPutTaskResponse();

    putExistingItemResponse = mockHttpBackendResponse.getPutExistingItemResponse();
    putExistingTaskResponse = mockHttpBackendResponse.getPutExistingTaskResponse();
    putExistingNoteResponse = mockHttpBackendResponse.getPutExistingNoteResponse();

    uncompleteTaskResponse = mockHttpBackendResponse.getUncompleteTaskResponse();

    // account
    $httpBackend.whenGET(invitePostFix).respond(function(method, url, data, headers) {
      mockHttpBackendResponse.setSkipAuthenticationCheck();
      return mockHttpBackendResponse.expectResponse(method, url, data, headers, inviteResponse);
    });
    $httpBackend.whenPOST('/api/invite/' + signUpPostFix).respond(function(method, url, data, headers) {
      mockHttpBackendResponse.setSkipAuthenticationCheck();
      return mockHttpBackendResponse.expectResponse(method, url, data, headers, signUpResponse);
    });
    $httpBackend.whenGET('/api/account').respond(function(method, url, data, headers) {
      return mockHttpBackendResponse.expectResponse(method, url, data, headers, accountResponse);
    });
    $httpBackend.whenPOST('/api/authenticate').respond(function(method, url, data, headers) {
      return mockHttpBackendResponse.expectResponse(method, url, data, headers, authenticateResponse);
    });
    $httpBackend.whenPOST('/api/logout').respond(function(method, url, data, headers) {
      return mockHttpBackendResponse.expectResponse(method, url, data, headers, logoutResponse);
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

    // Items

    $httpBackend.whenPUT(putItem).respond(function(method, url, data, headers) {
      putItemResponse.uuid = randomUUID();
      return mockHttpBackendResponse.expectResponse(method, url, data, headers, putItemResponse);
    });

    $httpBackend.whenPUT(putExistingItem).respond(function(method, url, data, headers) {
      return mockHttpBackendResponse.expectResponse(method, url, data, headers, putExistingItemResponse);
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
      putTaskResponse.uuid = randomUUID();
      return mockHttpBackendResponse.expectResponse(method, url, data, headers, putTaskResponse);
    });

    // notes
    $httpBackend.whenPUT(putExistingNote).respond(function(method, url, data, headers) {
      return mockHttpBackendResponse.expectResponse(method, url, data, headers, putExistingNoteResponse);
    });

    $httpBackend.whenPUT(putNote).respond(function(method, url, data, headers) {
      putNoteResponse.uuid = randomUUID();
      return mockHttpBackendResponse.expectResponse(method, url, data, headers, putNoteResponse);
    });

    // get
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

    $httpBackend.whenGET(/null/).respond(function() {
      return [404, 'The requested resource could not be found.'];
    });
  }]);

angular.module('em.mockHelpers').factory('mockHttpBackendResponse', ['base64',
  function(base64) {

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
      // account
      getAccountResponse: function() {
        return getJSONFixture('accountResponse.json');
      },
      getAuthenticateResponse: function() {
        return getJSONFixture('authenticateResponse.json');
      },
      getInviteResponse: function() {
        return getJSONFixture('inviteResponse.json');
      },
      getSignUpResponse: function() {
        return getJSONFixture('signUpResponse.json');
      },
      getLogoutResponse: function() {
        return getJSONFixture('logoutResponse.json');
      },

      getCompleteTaskResponse: function() {
        return getJSONFixture('completeTaskResponse.json');
      },

      // delete
      getDeleteItemResponse: function() {
        return getJSONFixture('deleteItemResponse.json');
      },
      getDeleteNoteResponse: function() {
        return getJSONFixture('deleteNoteResponse.json');
      },
      getDeleteTaskResponse: function() {
        return getJSONFixture('deleteTaskResponse.json');
      },

      // get
      getItemsResponse: function() {
        return getJSONFixture('itemsResponse.json');
      },
      getCollectiveItemsResponse: function() {
        return getJSONFixture('collectiveItemsResponse.json');
      },

      // put new
      getPutItemResponse: function() {
        return getJSONFixture('putItemResponse.json');
      },
      getPutNoteResponse: function() {
        return getJSONFixture('putNoteResponse.json');
      },
      getPutTaskResponse: function() {
        return getJSONFixture('putTaskResponse.json');
      },

      // existing items
      getPutExistingItemResponse : function() {
        return getJSONFixture('putExistingItemResponse.json');
      },
      getPutExistingNoteResponse : function() {
        return getJSONFixture('putExistingNoteResponse.json');
      },
      getPutExistingTaskResponse : function() {
        return getJSONFixture('putExistingTaskResponse.json');
      },

      getUncompleteTaskResponse: function() {
        return getJSONFixture('uncompleteTaskResponse.json');
      },
      clearSessionStorage: function() {
        sessionStorage.clear();
      }
    };
  }]);
*/