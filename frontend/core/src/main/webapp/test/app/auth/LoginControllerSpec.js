'use strict';

describe('LoginController', function() {
  var $scope;
  var LoginController;
  var UserSessionService;

  beforeEach(function() {
    module('em.appTest');

    inject(function($controller, $rootScope, _UserSessionService_) {
      $scope = $rootScope.$new();
      LoginController = $controller('LoginController', {
        $scope: $scope
      });
      UserSessionService = _UserSessionService_;
    });

  });

  afterEach(function() {
  });

  it('should...', function() {
  })
});
