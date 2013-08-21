'use strict';

emControllers.controller('LoginController', ['$rootScope', '$scope', 'userFactory', 'userAuthenticate',

function($rootScope, $scope, userFactory, userAuthenticate) {
  $scope.userLogin = function() {
    userFactory.setCredentials($scope.user.username, $scope.user.password);
    userFactory.setUserRemembered($scope.user.remember);

    userAuthenticate.login(function() {
      $rootScope.$broadcast('event:loginSuccess');
    }, function(error) {
      $rootScope.$broadcast('event:loginRequired');
    });
  };
}]);
