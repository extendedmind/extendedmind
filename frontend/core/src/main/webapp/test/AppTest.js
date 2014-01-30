/*jslint white: true */
'use strict';

angular.module('em.appTest', ['em.app', 'common', 'ngMockE2E']);

angular.module('em.appTest').run(['$httpBackend',
  function($httpBackend) {
    $httpBackend.whenGET(/^static\//).passThrough();
    $httpBackend.whenGET(/test\//).passThrough();
  }]);
