'use strict';

describe('PasswordController', function() {
  var $location, $routeParams, $scope, PasswordController;
  var UserSessionService;

  beforeEach(function() {
    module('em.appTest');

    inject(function($controller, _$location_, $rootScope, _$routeParams_, _UserSessionService_) {
      $scope = $rootScope.$new();
      $routeParams = _$routeParams_;
      PasswordController = $controller('PasswordController', {
        $scope: $scope,
        $routeParams: $routeParams
      });
      $location = _$location_;
      UserSessionService = _UserSessionService_;
    });

    spyOn($location, 'path');
    spyOn($location, 'search');
  });

  it('should go back to \'/my/account\'', function() {
    $scope.gotoAccountPage();
    expect($location.path).toHaveBeenCalledWith('/my/account');
    expect($location.search).toHaveBeenCalledWith({});
  });
});
