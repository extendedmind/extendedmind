"use strict";

describe('em.controllers', function() {
  beforeEach(module('em.controllers', 'em.helpers'));

  describe('LoginController', function() {
    var $controller, $httpBackend, $scope;

    beforeEach(inject(function(_$controller_, _$httpBackend_, _$rootScope_, helperFactory) {
      $httpBackend = _$httpBackend_;

      var authenticateResponse = getJSONFixture('authenticateResponse.json');

      $httpBackend.expectPOST('/api/authenticate').respond(function(method, url, data, headers) {
        return helperFactory.expectResponse(method, url, data, headers, authenticateResponse);
      });

      $scope = _$rootScope_.$new();
      $controller = _$controller_('LoginController', {
        $scope : $scope
      });
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should return login response for user "timo@ext.md"', function() {
      $scope.user = {
        "username" : 'timo@ext.md',
        "password" : 'timopwd',
        remember : true
      };
      $scope.userLogin();
      $httpBackend.flush();
      expect($scope.error).toBe(undefined);
    });

    it('should return error response for user "na@na.com"', function() {
      $scope.user = {
        "username" : 'na@ext.md',
        "password" : 'timo',
      };
      $scope.userLogin();
      expect($scope.error).toBe(undefined);
      $httpBackend.flush();
      expect($scope.error).toBe('Forbidden');
    });
  });
});
