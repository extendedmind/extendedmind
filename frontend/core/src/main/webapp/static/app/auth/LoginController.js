'use strict';

function LoginController($location, $scope, AuthenticationService) {

  $scope.userLogin = function() {
    $scope.loginFailed = false;
    AuthenticationService.login($scope.user).then(function() {
      $location.path('/my/tasks');
    }, function(authenticateResponse) {
      $scope.loginFailed = true;
    });
  };
}

LoginController.$inject = ['$location', '$scope', 'AuthenticationService'];
angular.module('em.app').controller('LoginController', LoginController);