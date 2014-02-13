'use strict';

function SignupController($location, $scope, $routeParams, AuthenticationService, ErrorHandlerService) {

  $scope.user = {};
  var inviteResponseCode = $routeParams.hex_code;

  $scope.errorHandler = ErrorHandlerService;

  AuthenticationService.getInvite(inviteResponseCode, $routeParams.email).then(function(inviteResponse) {
    if (inviteResponse.data.accepted) {
      $location.path('/login');
    } else {
      $scope.user.username = inviteResponse.data.email;
    }
  });

  $scope.signUp = function() {
    AuthenticationService.signUp(inviteResponseCode, {email: $scope.user.username, password: $scope.user.password}).then(function() {
      userLogin();
    });
  };

  function userLogin() {
    AuthenticationService.login($scope.user).then(function() {
      // Clears GET parameters from the URL
      $location.url($location.path());
      $location.path('/my/tasks');
    }, function(authenticateResponse) {
      $scope.errorHandler.errorMessage = authenticateResponse.data;
    });
  }
}

SignupController['$inject'] = ['$location', '$scope', '$routeParams', 'AuthenticationService', 'ErrorHandlerService'];
angular.module('em.app').controller('SignupController', SignupController);
