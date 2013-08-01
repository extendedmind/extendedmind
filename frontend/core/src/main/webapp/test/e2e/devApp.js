"use strict";

var emDevApp = angular.module('em.devApp', ['em.app', 'em.base64', 'ngMockE2E']);

emDevApp.run(function($httpBackend, Base64) {

  var authenticateResponse = getJSONFixture('authenticateResponse.json');
  var putItemResponse = getJSONFixture('putItemResponse.json');
  var itemsResponse = getJSONFixture('itemsResponse.json');

  $httpBackend.whenPOST('/api/authenticate').respond(function(method, url, data, headers) {
    // var userNamePass = sessionStorage.getItem('token');
    var parsedAuthorizationHeader = headers.Authorization.split(' ');
    var userNamePass = Base64.decode(parsedAuthorizationHeader[1]);
    var parsedUserNamePass = userNamePass.split(':');
    var userName = parsedUserNamePass[0];

    if (userNamePass === 'timo@ext.md:timopwd') {
      return [200, authenticateResponse];
    } else if (userName === 'token') {
      console.log(userName);
      return [200, authenticateResponse];
    } else {
      return [401, 'Invalid username/password'];
    }
  });

  $httpBackend.whenPUT('/api/' + authenticateResponse.userUUID + '/item').respond(putItemResponse);
  $httpBackend.whenGET('/api/' + authenticateResponse.userUUID + '/items').respond(itemsResponse);

  $httpBackend.whenGET(/^\/static\//).passThrough();
  $httpBackend.whenGET(/^test\//).passThrough();
});
