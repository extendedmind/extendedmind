"use strict";

emControllers.controller('LoginController', ['$location', '$scope', 'UserAuthenticate',
function($location, $scope, UserAuthenticate) {
  $scope.user = {
    "email" : 'timo@ext.md',
    "password" : 'timo'
  };
  $scope.userLogin = function() {
    UserAuthenticate.userLogin($scope.user, function(authenticateResponse) {
      $scope.authResponse = authenticateResponse;
      $location.path('/');
    }, function(error) {
      $scope.authResponse = error;
    });
  };
}]);
