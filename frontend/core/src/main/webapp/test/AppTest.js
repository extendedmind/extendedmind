/* global angular */
'use strict';

// NOTE: This file starts with an uppercase A to make sure it is loaded first by
//       Jasmine maven plugin!

angular.module('em.appTest', ['em.app', 'common', 'ngMockE2E']);

angular.module('em.appTest').run(['$httpBackend',
  function($httpBackend) {
    $httpBackend.whenGET(/^static\//).passThrough();
    $httpBackend.whenGET(/test\//).passThrough();
  }]);
