'use strict';

function PasswordController($location, $scope, AuthenticationService, BackendClientService, UserSessionService, AnalyticsService) {

  AnalyticsService.visit('password');

  $scope.changePassword = function changePassword() {
    var email = UserSessionService.getEmail();
    $scope.changePasswordOffline = false;
    $scope.changePasswordFailed = false;
    $scope.loginFailed = false;
    AuthenticationService.putChangePassword(email, $scope.user.currentPassword, $scope.user.newPassword)
    .then(function(/*changePasswordResponse*/) {
      AnalyticsService.do('changePassword');
      AuthenticationService.login({username: email, password: $scope.user.newPassword}).then(
        function(/*authenticationResponse*/) {
          $location.path('/my/account');
        }, function(error){
          if (BackendClientService.isOffline(error.status)){
            $scope.changePasswordOffline = true;
          }else {
            $scope.loginFailed = true;
          }
        });
    }, function(error){
      if (BackendClientService.isOffline(error.status)){
        AnalyticsService.error('changePassword', 'offline');
        $scope.changePasswordOffline = true;
      }else {
        AnalyticsService.error('changePassword', 'failed');
        $scope.changePasswordFailed = true;
      }
    });
  };

  $scope.gotoAccountPage = function gotoAccountPage() {
    $location.path('/my/account');
  };
}

PasswordController['$inject'] = ['$location', '$scope', 'AuthenticationService', 'BackendClientService', 'UserSessionService', 'AnalyticsService'];
angular.module('em.app').controller('PasswordController', PasswordController);
