/*global angular */
'use strict';

function SignupController($location, $scope, $routeParams, auth, authenticateRequest, errorHandler, httpRequest) {

  $scope.user = {};
  var inviteResponseCode = $routeParams.hex_code;

  $scope.errorHandler = errorHandler;

  httpRequest.get('/api/invite/' + inviteResponseCode + '?email=' + $routeParams.email).then(function(inviteResponse) {
    if (inviteResponse.data.accepted) {
      $location.path('/login');
    } else {
      $scope.user.email = inviteResponse.data.email;
    }
  });

  function userLogin() {

    auth.login($scope.user).then(function() {
      $location.path('/my');
    }, function(authenticateResponse) {
      $scope.errorHandler.errorMessage = authenticateResponse.data;
    });
  }

  $scope.signUp = function() {
    httpRequest.post('/api/invite/' + inviteResponseCode + '/accept', {email: $scope.user.email, password: $scope.user.password}).then(function() {
      userLogin();
    });
  };
}

SignupController.$inject = ['$location', '$scope', '$routeParams', 'auth', 'authenticateRequest', 'errorHandler', 'httpRequest'];
angular.module('em.app').controller('SignupController', SignupController);
