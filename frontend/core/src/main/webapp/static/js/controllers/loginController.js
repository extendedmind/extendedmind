"use strict";

emControllers.controller('LoginController', ['$scope', 'UserAuthenticate',

function($scope, UserAuthenticate) {
  $scope.userLogin = function() {
    UserAuthenticate.setCredentials($scope.user.username, $scope.user.password);
    UserAuthenticate.userLogin($scope.user.remember);
  };
}]);
