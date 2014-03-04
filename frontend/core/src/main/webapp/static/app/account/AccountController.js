'use strict';

function AccountController($location, $scope, AccountService) {

  AccountService.getAccount().then(function(authenticateResponse) {
    $scope.email = authenticateResponse.email;
  });

  $scope.gotoChangePassword = function gotoChangePassword() {
    $location.path('/my/account/change_password');
    $location.search({
      email: $scope.email
    });
  };

  $scope.gotoMainPage = function gotoMainPage() {
    $location.path('/my/tasks');
  };
}

AccountController['$inject'] = ['$location', '$scope', 'AccountService'];
angular.module('em.app').controller('AccountController', AccountController);
