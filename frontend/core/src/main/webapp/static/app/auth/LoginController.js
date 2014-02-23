/* global angular */
'use strict';

function LoginController($location, $scope, UserSessionService, AuthenticationService) {

  $scope.userLogin = function() {
    if ($scope.rememberByDefault()){
      $scope.user.remember = true;
    }
    $scope.loginFailed = false;
    AuthenticationService.login($scope.user).then(function() {
      $location.path('/my/tasks');
    }, function(authenticateResponse) {
      $scope.loginFailed = true;
    });
  };
  $scope.rememberByDefault = function() {
    return UserSessionService.getRememberByDefault();
  };
}

LoginController.$inject = ['$location', '$scope', 'UserSessionService', 'AuthenticationService'];
angular.module('em.app').controller('LoginController', LoginController);