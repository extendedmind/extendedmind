'use strict';

var emMockHelpers = angular.module('em.mockHelpers', ['em.base64']);

emMockHelpers.run(['$httpBackend', 'mockHttpBackendResponse',
function($httpBackend, mockHttpBackendResponse) {

  var authenticateResponse = mockHttpBackendResponse.getAuthenticateResponse();
  var itemsResponse = mockHttpBackendResponse.getItemsResponse();
  var putNewItemResponse = mockHttpBackendResponse.getPutNewItemResponse();

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

emMockHelpers.factory('mockHttpBackendResponse', ['Base64',
function(Base64) {
  return {
    expectResponse : function(method, url, data, headers, responseData) {
      var parsedAuthorizationHeader = headers.Authorization.split(' ');
      var userNamePass = Base64.decode(parsedAuthorizationHeader[1]);
      var parsedUserNamePass = userNamePass.split(':');
      var userName = parsedUserNamePass[0];

      if (userNamePass === 'timo@ext.md:timopwd') {
        return [200, responseData];
      } else if (userName === 'token') {
        return [200, responseData];
      } else {
        return [403, 'Forbidden'];
      }
    },
    getAuthenticateResponse : function() {
      return getJSONFixture('authenticateResponse.json');
    },
    getItemsResponse : function() {
      return getJSONFixture('itemsResponse.json');
    },
    getPutNewItemResponse : function() {
      return getJSONFixture('putNewItemResponse.json');
    },
    clearSessionStorage : function() {
      sessionStorage.clear();
    }
  }
}]);
