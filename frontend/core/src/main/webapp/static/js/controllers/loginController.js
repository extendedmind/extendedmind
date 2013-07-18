"use strict";

emControllers.controller('LoginController', ['$location', '$rootScope', '$scope', 'UserAuthenticate',
function($location, $rootScope, $scope, UserAuthenticate) {

  $scope.user = {
    "email" : 'timo@ext.md',
    "password" : 'timo'
  };
  $scope.userLogin = function() {
    UserAuthenticate.userLogin($scope.user, function() {
      $rootScope.$broadcast('event:loginSuccess');
    }, function(error) {
    });
  };
}]);
