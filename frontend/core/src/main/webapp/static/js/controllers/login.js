/*global angular*/

( function() {'use strict';
    angular.module('em.app').controller('LoginController', ['$rootScope', '$scope', 'errorHandler', 'userFactory', 'userAuthenticate',

    function($rootScope, $scope, errorHandler, userFactory, userAuthenticate) {

      $scope.errorHandler = errorHandler;

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
  }());
