/*global $, angular, getJSONFixture*/

( function() {'use strict';

    var emMockHelpers = angular.module('em.mockHelpers', ['em.base64']);

    emMockHelpers.run(['$httpBackend', 'mockHttpBackendResponse',
    function($httpBackend, mockHttpBackendResponse) {

      var authenticateResponse, itemsResponse, putNewItemResponse;

      authenticateResponse = mockHttpBackendResponse.getAuthenticateResponse();
      itemsResponse = mockHttpBackendResponse.getItemsResponse();
      putNewItemResponse = mockHttpBackendResponse.getPutItemResponse();

      $httpBackend.whenPOST('/api/authenticate').respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, authenticateResponse);
      });

      $httpBackend.whenPUT('/api/' + authenticateResponse.userUUID + '/item').respond(function(method, url, data, headers) {
        return mockHttpBackendResponse.expectResponse(method, url, data, headers, putNewItemResponse);
      });

      $httpBackend.whenGET('/api/' + authenticateResponse.userUUID + '/items').respond(function(method, url, data, headers) {
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
        getItemsResponse : function() {
          return getJSONFixture('itemsResponse.json');
        },
        getPutItemResponse : function() {
          return getJSONFixture('putItemResponse.json');
        },
        clearSessionStorage : function() {
          sessionStorage.clear();
        },
        clearCookies : function() {
          var cookies = document.cookie.split(';');

          for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
          }
        }
      };
    }]);
  }());
