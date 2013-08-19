'use strict';

emControllers.controller('LoginController', ['$rootScope', '$scope', 'user', 'userAuthenticate',

function($rootScope, $scope, user, userAuthenticate) {
  $scope.userLogin = function() {
    user.setCredentials($scope.user.username, $scope.user.password);
    user.setUserRemembered($scope.user.remember);

    userAuthenticate.login(function() {
      $rootScope.$broadcast('event:loginSuccess');
    }, function(error) {
      $rootScope.$broadcast('event:loginRequired');
    });
  };
}]);
