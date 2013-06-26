"use strict";

describe('controllers', function() {
  beforeEach(module('controllers'));

  describe('LoginCtrl', function() {

    var scope, ctrl, $httpBackend;
    var users = getJSONFixture('getUsersResponse.json');

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;

      var authenticate = getJSONFixture('getAuthenticateResponse.json');

      $httpBackend.expectPOST('/api/authenticate').respond(function(method, url, data) {
        var userEmail = angular.fromJson(data).email;
        if (userEmail == 'timo@ext.md') {
          return [200, authenticate];
        } else {
          return [503, 'Invalid username/password'];
        }
      });

      scope = $rootScope.$new();
      ctrl = $controller('LoginCtrl', {
        $scope : scope
      });
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should return login response for user "timo@ext.md"', function() {
      scope.user = users[0];
      scope.userLogin();
      $httpBackend.flush();

      expect(scope.authResponse[0].token).toBe('timo-tiuraniemi');
    });

    it('should return error response for user "na@na.com"', function() {
      scope.user = {
        "email" : 'na@na.com'
      };
      scope.userLogin();
      $httpBackend.flush();

      expect(scope.authResponse).toBe('Invalid username/password');
    });
  });
});
