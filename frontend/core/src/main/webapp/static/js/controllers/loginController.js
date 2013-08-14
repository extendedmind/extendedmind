"use strict";

emControllers.controller('LoginController', ['$rootScope', '$scope', 'User', 'UserAuthenticate',

function($rootScope, $scope, User, UserAuthenticate) {
  $scope.userLogin = function() {
    User.setCredentials($scope.user.username, $scope.user.password);
    User.setUserRemembered($scope.user.remember);

    UserAuthenticate.userLogin(function() {
      $rootScope.$broadcast('event:loginSuccess');
    }, function(error) {
      $rootScope.$broadcast('event:loginRequired');
    });
  };
}]);
