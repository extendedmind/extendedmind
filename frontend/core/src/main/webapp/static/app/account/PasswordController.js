'use strict';

function PasswordController($location, $routeParams, $scope, AccountService, UserSessionService) {
  var email = $routeParams.email ? $routeParams.email : UserSessionService.getEmail();

  $scope.gotoAccountPage = function gotoAccountPage() {
    $location.path('/my/account');
    $location.search({});
  };
}

PasswordController['$inject'] = ['$location', '$routeParams', '$scope', 'AccountService', 'UserSessionService'];
angular.module('em.app').controller('PasswordController', PasswordController);
