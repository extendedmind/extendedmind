/*global angular*/
/*jslint white: true */

( function() {'use strict';

    angular.module('em.devApp', ['em.app', 'em.mockHelpers', 'ngMockE2E']);

    angular.module('em.devApp').run(['$httpBackend', 'mockHttpBackendResponse',
        function($httpBackend, mockHttpBackendResponse) {
            $httpBackend.whenGET(/^static\//).passThrough();
            $httpBackend.whenGET(/^test\//).passThrough();
        }]);
}());
