"use strict";

angular.module('emDev', ['em', 'ngMockE2E']).run(function($httpBackend) {

    var latest = $.getJSON('test/static/json/latest.json', function(data) {
    });

    $httpBackend.whenGET('/api/latest').respond(latest);

    $httpBackend.whenGET(/^\/static\//).passThrough();
});
