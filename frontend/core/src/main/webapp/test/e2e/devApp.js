"use strict";

var emDevApp = angular.module('emDevApp', ['emApp', 'ngMockE2E']);

emDevApp.run(function($httpBackend) {

  var authenticate = $.getJSON('test/json/getAuthenticateResponse.json', function(data) {
  });

  $httpBackend.whenPOST('/api/authenticate').respond(function(method, url, data) {
    var userEmail = angular.fromJson(data).email;
    if (userEmail == 'timo@ext.md' || userEmail == 'jp@ext.md') {
      return [200, authenticate];
    } else {
      return [503, 'Invalid username/password'];
    }
  });
  $httpBackend.whenGET(/^\/static\//).passThrough();
});
