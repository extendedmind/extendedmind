"use strict";

emControllers.controller('LoginController', ['$rootScope', '$scope', 'UserCookie', 'UserAuthenticate',
function($rootScope, $scope, UserCookie, UserAuthenticate) {

  $scope.userLogin = function() {
    UserAuthenticate.userAuthenticate($scope.user);
    UserAuthenticate.userLogin(function(success) {
      console.log(success);
      $scope.success = success;
      $rootScope.$broadcast('event:loginSuccess');
    }, function(error) {
      $scope.error = error;
      $rootScope.$broadcast('event:loginRequired');
    });
  };
}]);
