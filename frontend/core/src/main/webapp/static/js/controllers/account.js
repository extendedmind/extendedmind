/*global angular*/

( function() {'use strict';

    function AccountController($location, $scope, authenticateRequest, errorHandler, userSession) {

      $scope.errorHandler = errorHandler;

      authenticateRequest.account().then(function(authenticateResponse) {
        $scope.email = authenticateResponse.email;
      });
    }


    AccountController.$inject = ['$location', '$scope', 'authenticateRequest', 'errorHandler', 'userSession'];
    angular.module('em.app').controller('AccountController', AccountController);
  }());
