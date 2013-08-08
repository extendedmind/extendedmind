"use strict";

emControllers.controller('LoginController', ['$rootScope', '$scope', 'User', 'UserAuthenticate',

function($rootScope, $scope, User, UserAuthenticate) {
  $scope.userLogin = function() {
    User.setCredentials($scope.user.username, $scope.user.password);

    UserAuthenticate.userLogin(function() {
      if ($scope.user.remember) {
        User.setUserTokenCookie();
      }
      $rootScope.$broadcast('event:loginSuccess');
    }, function(error) {
    });
  };
}]);
