"use strict";

emControllers.controller('LoginController', ['$rootScope', '$scope', 'User', 'UserAuthenticate',
function($rootScope, $scope, User, UserAuthenticate) {

  $scope.user = {
    "email" : 'timo@ext.md',
    "password" : 'timopwd',
    "remember" : User.isUserRemembered()
  };

  $scope.userLogin = function() {
    if (UserAuthenticate.userAuthenticate($scope.user.email, $scope.user.password, $scope.user.remember)) {
      $rootScope.$broadcast('event:loginSuccess');
    }
  };
}]);
