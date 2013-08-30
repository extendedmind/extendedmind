/*global angular*/

( function() {'use strict';
    angular.module('em.app').controller('LoginController', ['$rootScope', '$scope', 'authenticateRequest', 'errorHandler', 'userFactory', 'userAuthenticate',

    function($rootScope, $scope, authenticateRequest, errorHandler, userFactory, userAuthenticate) {

      $scope.errorHandler = errorHandler;

      $scope.userLogin = function() {
        userFactory.setCredentials($scope.user.username, $scope.user.password);
        userFactory.setUserRemembered($scope.user.remember);

        authenticateRequest.login(function(authenticateResponse) {
          userFactory.setUserSessionData(authenticateResponse);
          $rootScope.$broadcast('event:loginSuccess');
        }, function(error) {
          $rootScope.$broadcast('event:loginRequired');
        });
      };
    }]);
  }());
