/*jslint white: true */
'use strict';

function LoginController($location, $scope, auth, errorHandler) {

  $scope.errorHandler = errorHandler;

  $scope.userLogin = function() {

    auth.login($scope.user).then(function() {
      $location.path('/my');
    }, function(authenticateResponse) {
      $scope.errorHandler.errorMessage = authenticateResponse.data;
    });
  };
}

LoginController.$inject = ['$location', '$scope', 'auth', 'errorHandler'];
angular.module('em.app').controller('LoginController', LoginController);