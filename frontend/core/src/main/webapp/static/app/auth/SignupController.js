/*global angular */
'use strict';

function SignupController($location, $scope, $routeParams, AuthenticationService, ErrorHandlerService) {

  $scope.user = {};
  var inviteResponseCode = $routeParams.hex_code;

  $scope.errorHandler = ErrorHandlerService;

  AuthenticationService.getInvite(inviteResponseCode, $routeParams.email).then(function(inviteResponse) {
    if (inviteResponse.data.accepted) {
      $location.path('/login');
    } else {
      $scope.user.email = inviteResponse.data.email;
    }
  });

  function userLogin() {
    AuthenticationService.login($scope.user).then(function() {
      $location.path('/my');
    }, function(authenticateResponse) {
      $scope.errorHandler.errorMessage = authenticateResponse.data;
    });
  }

  $scope.signUp = function() {
    AuthenticationService.signup(inviteResponseCode, {email: $scope.user.email, password: $scope.user.password}).then(function() {
      userLogin();
    });
  };
}

SignupController.$inject = ['$location', '$scope', '$routeParams', 'AuthenticationService', 'ErrorHandlerService'];
angular.module('em.app').controller('SignupController', SignupController);
