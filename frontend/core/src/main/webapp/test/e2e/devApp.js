"use strict";

var emDevApp = angular.module('em.devApp', ['em.app', 'ngMockE2E', 'ngResource']);

emDevApp.run(function($httpBackend, $resource) {

  // var authenticateResponse = $resource('test/json/authenticateResponse.json').query();
  var putItemResponse = $resource('test/json/putItemResponse.json').query();
  var itemsResponse = $resource('test/json/itemsResponse.json').query();

  var authenticateResponse = getJSONFixture('authenticateResponse.json');

  $httpBackend.whenPOST('/api/authenticate').respond(authenticateResponse);

  $httpBackend.whenPUT('/api/bba6363c-59ce-46b9-9709-acfd7b4be3f1/item').respond(function() {
    return [200, putItemResponse];
  });

  $httpBackend.whenGET('/api/bba6363c-59ce-46b9-9709-acfd7b4be3f1/items').respond(itemsResponse);

  $httpBackend.whenGET(/^\/static\//).passThrough();
  $httpBackend.whenGET(/^test\//).passThrough();
});
