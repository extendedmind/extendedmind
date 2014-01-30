/*jslint white: true */
'use strict';

angular.module('em.testApp', ['em.app', 'common', 'ngMockE2E']);

angular.module('em.testApp').run(['$httpBackend',
  function($httpBackend) {
    $httpBackend.whenGET(/^static\//).passThrough();
    $httpBackend.whenGET(/test\//).passThrough();
  }]);
