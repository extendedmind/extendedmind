/*global angular*/

( function() {'use strict';

    function LoginController($location, $scope, authenticateRequest, errorHandler, userSession) {

      $scope.errorHandler = errorHandler;

      $scope.userLogin = function() {

        userSession.setCredentials($scope.user.username, $scope.user.password);

        if ($scope.user.remember) {
          userSession.setUserRemembered($scope.user.remember);
        }
        authenticateRequest.login().then(function(authenticateResponse) {
          userSession.setUserSessionData(authenticateResponse);
          $location.path('/my');
        });
      };
    }


    LoginController.$inject = ['$location', '$scope', 'authenticateRequest', 'errorHandler', 'userSession'];
    angular.module('em.app').controller('LoginController', LoginController);
  }());
