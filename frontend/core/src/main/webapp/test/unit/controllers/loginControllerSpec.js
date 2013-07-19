"use strict";

describe('em.controllers', function() {
  beforeEach(module('em.controllers'));

  describe('LoginController', function() {
    var $controller, $httpBackend, $scope;

    beforeEach(inject(function(_$controller_, _$httpBackend_, _$rootScope_) {
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
        "email" : 'timo@ext.md',
        "password" : 'timo'
      };
      $scope.userLogin();
      $httpBackend.flush();
    });
    //
    it('should return error response for user "na@na.com"', function() {
      $scope.user = {
        "email" : 'na@ext.md',
        "password" : 'timo'
      };
      $scope.userLogin();
      $httpBackend.flush();
    });
  });
});
