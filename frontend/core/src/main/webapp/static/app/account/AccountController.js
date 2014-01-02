/*jslint white: true */
'use strict';

function AccountController($location, $scope, AccountService, ErrorHandlerService) {

  $scope.errorHandler = ErrorHandlerService;

  AccountService.account().then(function(authenticateResponse) {
    $scope.email = authenticateResponse.email;
  });
}

AccountController.$inject = ['$location', '$scope', 'AccountService', 'ErrorHandlerService'];
angular.module('em.app').controller('AccountController', AccountController);
