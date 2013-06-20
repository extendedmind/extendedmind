"use strict";

angular.module('emDev', ['em', 'ngMockE2E']).run(function($httpBackend) {

    var user = $.getJSON('test/static/json/user.json', function(user) {
    });

    $httpBackend.whenGET('/api/user').respond(user);

    $httpBackend.whenPOST('/api/login').respond();

    $httpBackend.whenGET(/^\/static\//).passThrough();
});
