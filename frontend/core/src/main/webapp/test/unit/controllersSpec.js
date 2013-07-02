"use strict";

describe('controllers', function() {
  beforeEach(module('controllers'));

  describe('LoginController', function() {

    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;

      var authenticate = getJSONFixture('authenticateResponse.json');

      $httpBackend.expectPOST('/api/authenticate').respond(function(method, url, data) {
        var userEmail = angular.fromJson(data).email;
        if (userEmail == 'timo@ext.md') {
          return [200, authenticate];
        } else {
          return [503, 'Invalid username/password'];
        }
      });

      scope = $rootScope.$new();
      ctrl = $controller('LoginController', {
        $scope : scope
      });
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should return login response for user "timo@ext.md"', function() {
      scope.user = {
        "email" : 'timo@ext.md'
      };
      scope.userLogin();
      expect(scope.authResponse).toBe(undefined);
      $httpBackend.flush();
      expect(scope.authResponse.token).toBe('XYlpFWpwzqHwgUD6+lovjrg7ZJGhrozCxsAVRIOmyh4=');
    });

    it('should return error response for user "na@na.com"', function() {
      scope.user = {
        "email" : 'na@ext.md'
      };
      scope.userLogin();
      expect(scope.authResponse).toBe(undefined);
      $httpBackend.flush();

      expect(scope.authResponse).toBe('Invalid username/password');
    });
  });
});
