/*global angular*/

( function() {'use strict';

    function LoginController($rootScope, $scope, authenticateRequest, errorHandler, userSession) {

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
    }


    LoginController.$inject = ['$rootScope', '$scope', 'authenticateRequest', 'errorHandler', 'userSession'];
    angular.module('em.app').controller('LoginController', LoginController);
  }());
