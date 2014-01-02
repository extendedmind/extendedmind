/*jslint white: true */
'use strict';

function LoginController($location, $scope, AuthenticationService, errorHandler) {

  $scope.errorHandler = errorHandler;

  $scope.userLogin = function() {

    AuthenticationService.login($scope.user).then(function() {
      $location.path('/my');
    }, function(authenticateResponse) {
      $scope.errorHandler.errorMessage = authenticateResponse.data;
    });
  };
}

LoginController.$inject = ['$location', '$scope', 'AuthenticationService', 'errorHandler'];
angular.module('em.app').controller('LoginController', LoginController);