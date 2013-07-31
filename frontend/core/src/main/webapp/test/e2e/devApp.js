"use strict";

var emDevApp = angular.module('em.devApp', ['em.app', 'ngMockE2E']);

emDevApp.run(function($httpBackend) {

  var authenticateResponse = getJSONFixture('authenticateResponse.json');
  var putItemResponse = getJSONFixture('putItemResponse.json');
  var itemsResponse = getJSONFixture('itemsResponse.json');

  $httpBackend.whenPOST('/api/authenticate').respond(authenticateResponse);
  $httpBackend.whenPUT('/api/' + authenticateResponse.userUUID + '/item').respond(putItemResponse);
  $httpBackend.whenGET('/api/' + authenticateResponse.userUUID + '/items').respond(itemsResponse);

  $httpBackend.whenGET(/^\/static\//).passThrough();
  $httpBackend.whenGET(/^test\//).passThrough();
});
