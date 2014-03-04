'use strict';

describe('AccountController', function() {
  var $location, $scope, AccountController;

  beforeEach(function() {
    module('em.appTest');

    inject(function($controller, _$location_, $rootScope) {
      $scope = $rootScope.$new();
      AccountController = $controller('AccountController', {
        $scope: $scope
      });
      $location = _$location_;
    });

    spyOn($location, 'path');
    spyOn($location, 'search');
  });

  it('should redirect to \'/my/account/change_password\'', function() {
    $scope.gotoChangePassword();
    expect($location.path).toHaveBeenCalledWith('/my/account/change_password');
    expect($location.search).toHaveBeenCalledWith({
      email: $scope.email
    });
  });

  it('should go back to \'/my/tasks\'', function() {
    $scope.gotoMainPage();
    expect($location.path).toHaveBeenCalledWith('/my/tasks');
  });
});
