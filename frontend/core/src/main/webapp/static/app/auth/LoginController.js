'use strict';

function LoginController($location, $scope, AuthenticationService, ErrorHandlerService) {

  $scope.errorHandler = ErrorHandlerService;

  $scope.userLogin = function() {
    AuthenticationService.login($scope.user).then(function() {
      $location.path('/my/tasks');
    }, function(authenticateResponse) {
      $scope.errorHandler.errorMessage = authenticateResponse.data;
    });
  };
}

LoginController.$inject = ['$location', '$scope', 'AuthenticationService', 'ErrorHandlerService'];
angular.module('em.app').controller('LoginController', LoginController);