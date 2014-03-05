'use strict';

function PasswordController($location, $routeParams, $scope, AuthenticationService, UserSessionService) {
  var email = $routeParams.email ? $routeParams.email : UserSessionService.getEmail();

  $scope.changePassword = function changePassword() {
    AuthenticationService.putChangePassword(email, $scope.user.currentPassword, $scope.user.newPassword)
    .then(function(changePasswordResponse) {
      $location.path('/my/account');
      $location.search({});
    });
  };

  $scope.gotoAccountPage = function gotoAccountPage() {
    $location.path('/my/account');
    $location.search({});
  };
}

PasswordController['$inject'] = ['$location', '$routeParams', '$scope', 'AuthenticationService', 'UserSessionService'];
angular.module('em.app').controller('PasswordController', PasswordController);
