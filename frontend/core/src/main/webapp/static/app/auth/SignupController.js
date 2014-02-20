'use strict';

function SignupController($location, $scope, $routeParams, AuthenticationService) {

  $scope.user = {};
  var inviteResponseCode = $routeParams.hex_code;

  AuthenticationService.getInvite(inviteResponseCode, $routeParams.email).then(function(inviteResponse) {
    if (inviteResponse.data.accepted) {
      $location.path('/login');
    } else {
      $scope.user.username = inviteResponse.data.email;
    }
  });

  $scope.signUp = function() {
    $scope.signupFailed = false;
    $scope.loginFailed = false;
    AuthenticationService.signUp(inviteResponseCode, {email: $scope.user.username, password: $scope.user.password}).
      then(function() {
        userLogin();
      }, function(signupResponse) {
        $scope.signupFailed = true;
      });
  };

  function userLogin() {
    AuthenticationService.login($scope.user).then(function() {
      // Clears GET parameters from the URL
      $location.url($location.path());
      $location.path('/my/tasks');
    }, function(authenticateResponse) {
      $scope.loginFailed = true;
    });
  }
}

SignupController['$inject'] = ['$location', '$scope', '$routeParams', 'AuthenticationService'];
angular.module('em.app').controller('SignupController', SignupController);
