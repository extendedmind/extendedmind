/*jslint white: true */
'use strict';

function AccountController($location, $scope, AccountService, errorHandler) {

  $scope.errorHandler = errorHandler;

  AccountService.account().then(function(authenticateResponse) {
    $scope.email = authenticateResponse.email;
  });
}

AccountController.$inject = ['$location', '$scope', 'AccountService', 'errorHandler'];
angular.module('em.app').controller('AccountController', AccountController);
