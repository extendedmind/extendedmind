"use strict";

var emDevApp = angular.module('em.devApp', ['em.app', 'em.helpers', 'ngMockE2E']);

emDevApp.run(['$httpBackend', 'helperFactory',
function($httpBackend, helperFactory) {

  var authenticateResponse = getJSONFixture('authenticateResponse.json');
  var putItemResponse = getJSONFixture('putItemResponse.json');
  var itemsResponse = getJSONFixture('itemsResponse.json');

  $httpBackend.whenPOST('/api/authenticate').respond(function(method, url, data, headers) {
    return helperFactory.expectResponse(method, url, data, headers, authenticateResponse);
  });

  $httpBackend.whenPUT('/api/' + authenticateResponse.userUUID + '/item').respond(function(method, url, data, headers) {
    return helperFactory.expectResponse(method, url, data, headers, putItemResponse);
  });

  $httpBackend.whenGET('/api/' + authenticateResponse.userUUID + '/items').respond(function(method, url, data, headers) {
    return helperFactory.expectResponse(method, url, data, headers, itemsResponse);
  });

  $httpBackend.whenGET(/^\/static\//).passThrough();
  $httpBackend.whenGET(/^test\//).passThrough();

  $httpBackend.whenGET(/null/).respond(function(method, url, data, headers) {
    return [403, 'Forbidden'];
  });
}]);
