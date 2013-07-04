"use strict";

var emDevApp = angular.module('em.devApp', ['em.app', 'ngMockE2E', 'ngResource']);

emDevApp.run(function($httpBackend, $resource) {

  var authenticateResponse = $resource('test/json/authenticateResponse.json').query();
  var putItemResponse = $resource('test/json/putItemResponse.json').query();
  var itemsResponse = $resource('test/json/itemsResponse.json').query();

  $httpBackend.whenPOST('/api/authenticate').respond(function(method, url, data) {
    var userEmail = angular.fromJson(data).email;
    if (userEmail == 'timo@ext.md' || userEmail == 'jp@ext.md') {
      return [200, authenticateResponse];
    } else {
      return [503, 'Invalid username/password'];
    }
  });

  $httpBackend.whenPOST('/api/item').respond(function(method, url, data) {
    return [200, putItemResponse];
  });

  $httpBackend.whenGET('/api/items').respond(itemsResponse);

  $httpBackend.whenGET(/^\/static\//).passThrough();
  $httpBackend.whenGET(/^test\//).passThrough();
});
