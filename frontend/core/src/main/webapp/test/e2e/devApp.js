"use strict";

var emDevApp = angular.module('em.devApp', ['em.app', 'em.mockHelpers', 'ngMockE2E']);

emDevApp.run(['$httpBackend', 'mockHttpBackendResponse',
function($httpBackend, mockHttpBackendResponse) {
  $httpBackend.whenGET(/^\/static\//).passThrough();
  $httpBackend.whenGET(/^test\//).passThrough();
}]);
