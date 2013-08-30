/*global angular*/

( function() {'use strict';
    angular.module('em.app').controller('LoginController', ['$rootScope', '$scope', 'authenticateRequest', 'errorHandler', 'userSession', 'userAuthenticate',

    function($rootScope, $scope, authenticateRequest, errorHandler, userSession, userAuthenticate) {

      $scope.errorHandler = errorHandler;

      $scope.userLogin = function() {
        userSession.setCredentials($scope.user.username, $scope.user.password);
        userSession.setUserRemembered($scope.user.remember);

        authenticateRequest.login(function(authenticateResponse) {
          userSession.setUserSessionData(authenticateResponse);
          $rootScope.$broadcast('event:loginSuccess');
        }, function(error) {
          $rootScope.$broadcast('event:loginRequired');
        });
      };
    }]);
  }());
