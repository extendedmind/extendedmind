"use strict";

emControllers.controller('LoginController', ['$rootScope', '$scope', 'UserCookie', 'UserAuthenticate',
function($rootScope, $scope, UserCookie, UserAuthenticate) {

  $scope.user = {
    'username' : 'timo@ext.md',
    'password' : 'timopwd',
    'remember' : UserCookie.isUserRemembered()
  };

  $scope.userLogin = function() {
    UserAuthenticate.userAuthenticate($scope.user);
    UserAuthenticate.userLogin(function(success) {
      $rootScope.$broadcast('event:loginSuccess');
    }, function(error) {
      $rootScope.$broadcast('event:loginRequired');
    });
  };
}]);
