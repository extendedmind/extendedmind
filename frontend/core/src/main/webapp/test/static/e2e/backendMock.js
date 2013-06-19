"use strict";

angular.module('emDev', ['em', 'ngMockE2E']).run(function($httpBackend) {

    $httpBackend.whenGET(/^\/static\//).passThrough();
});
