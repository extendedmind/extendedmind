'use strict';

function AccountController($location, $scope, AccountService, AnalyticsService) {
  
  AnalyticsService.visit('account');

  AccountService.getAccount().then(function(authenticateResponse) {
    $scope.email = authenticateResponse.email;
  });

  $scope.gotoChangePassword = function gotoChangePassword() {
    $location.path('/my/account/password');
  };

  $scope.gotoMainPage = function gotoMainPage() {
    $location.path('/my/tasks');
  };
}

AccountController['$inject'] = ['$location', '$scope', 'AccountService', 'AnalyticsService'];
angular.module('em.app').controller('AccountController', AccountController);
