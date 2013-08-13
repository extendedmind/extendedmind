"use strict";

describe('em.controllers', function() {
  beforeEach(module('em.controllers', 'em.helpers'));

  describe('LoginController', function() {
    var $controller, $httpBackend, $rootScope, $scope;

    beforeEach(inject(function(_$controller_, _$httpBackend_, _$rootScope_, helperFactory) {
      $httpBackend = _$httpBackend_;

      var authenticateResponse = getJSONFixture('authenticateResponse.json');

      $httpBackend.expectPOST('/api/authenticate').respond(function(method, url, data, headers) {
        return helperFactory.expectResponse(method, url, data, headers, authenticateResponse);
      });

      $rootScope = _$rootScope_;
      spyOn($rootScope, "$broadcast");

      $scope = _$rootScope_.$new();
      $controller = _$controller_('LoginController', {
        $scope : $scope
      });
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should broadcast \'event:loginSuccess\' on successful login', function() {
      $scope.user = {
        username : 'timo@ext.md',
        password : 'timopwd'
      };
      $scope.userLogin();
      $httpBackend.flush();
      expect($rootScope.$broadcast).toHaveBeenCalledWith('event:loginSuccess');
    });

    it('should broadcast \'event:loginRequired\' on invalid email', function() {
      $scope.user = {
        username : 'timo@extendedmind.org',
        password : 'timopwd',
      };
      $scope.userLogin();
      expect($scope.error).toBe(undefined);
      $httpBackend.flush();
      expect($rootScope.$broadcast).toHaveBeenCalledWith('event:loginRequired');
    });

    it('should broadcast \'event:loginRequired\' on invalid password', function() {
      $scope.user = {
        username : 'timo@ext.md',
        password : 'wrong',
      };
      $scope.userLogin();
      expect($scope.error).toBe(undefined);
      $httpBackend.flush();
      expect($rootScope.$broadcast).toHaveBeenCalledWith('event:loginRequired');
    });
  });
});
