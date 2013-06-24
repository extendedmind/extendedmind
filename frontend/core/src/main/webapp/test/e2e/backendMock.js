"use strict";

angular.module('emDev', ['em', 'ngMockE2E']).run(function($httpBackend) {

    var users = $.getJSON('test/json/getUsersResponse.json', function(users) {
    });

    var authenticate = $.getJSON('test/json/getAuthenticateResponse.json', function(authenticate) {
    });

    $httpBackend.whenGET('/api/users').respond(users);

    $httpBackend.whenPOST('/api/authenticate').respond(function(method, url, data) {
        if (data == 'timo') {
            return [200, authenticate];
        } else {
            return [503, 'Invalid username/password'];
        }
    });
    $httpBackend.whenGET(/^\/static\//).passThrough();
});
