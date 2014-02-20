'use strict';

function AccountController($location, $scope, AccountService) {

  AccountService.getAccount().then(function(authenticateResponse) {
    $scope.email = authenticateResponse.email;
  });
}

AccountController['$inject'] = ['$location', '$scope', 'AccountService'];
angular.module('em.app').controller('AccountController', AccountController);
