'use strict';

describe('AccountController', function() {
  var $location, $scope, AccountController;

  var MockUserSessionService = {
    getEmail: function() {
      return 'timo@ext.md';
    },
    setEmail: function(/*email*/) {
      return;
    },
    getCredentials: function() {
      return '';
    }
  };

  beforeEach(function() {
    module('em.appTest');

    module('em.services', function ($provide){
      $provide.value('UserSessionService', MockUserSessionService);
    });

    inject(function($controller, _$location_, $rootScope) {
      $scope = $rootScope.$new();
      AccountController = $controller('AccountController', {
        $scope: $scope
      });
      $location = _$location_;
    });

    spyOn($location, 'path');
  });

  it('should redirect to \'/my/account/password\'', function() {
    $scope.gotoChangePassword();
    expect($location.path).toHaveBeenCalledWith('/my/account/password');
  });
});
