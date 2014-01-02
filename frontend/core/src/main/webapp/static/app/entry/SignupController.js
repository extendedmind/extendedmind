/*global angular */
'use strict';

function SignupController($location, $scope, $routeParams, AuthenticationService, ErrorHandlerService, BackendClientService) {

  $scope.user = {};
  var inviteResponseCode = $routeParams.hex_code;

  $scope.errorHandler = ErrorHandlerService;

  BackendClientService.get('/api/invite/' + inviteResponseCode + '?email=' + $routeParams.email).then(function(inviteResponse) {
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
    BackendClientService.post('/api/invite/' + inviteResponseCode + '/accept', {email: $scope.user.email, password: $scope.user.password}).then(function() {
      userLogin();
    });
  };
}

SignupController.$inject = ['$location', '$scope', '$routeParams', 'AuthenticationService', 'ErrorHandlerService', 'BackendClientService'];
angular.module('em.app').controller('SignupController', SignupController);
