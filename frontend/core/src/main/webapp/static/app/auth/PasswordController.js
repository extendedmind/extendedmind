'use strict';

function PasswordController($location, $scope, AuthenticationService, UserSessionService) {
  var email = UserSessionService.getEmail();

  $scope.changePassword = function changePassword() {
    $scope.changePasswordOffline = false;
    $scope.changePasswordFailed = false;
    $scope.loginFailed = false;
    AuthenticationService.putChangePassword(email, $scope.user.currentPassword, $scope.user.newPassword)
    .then(function(changePasswordResponse) {
      AuthenticationService.login({username:email, password: $scope.user.newPassword}).then(
        function(authenticationResponse) {
          $location.path('/my/account');
        }, function(error){
          if (error.status === 404 || error.status === 502){
            $scope.changePasswordOffline = true;
          }else {
            $scope.loginFailed = true;
          }      
        }
      )
    }, function(error){
      if (error.status === 404 || error.status === 502){
        $scope.changePasswordOffline = true;
      }else {
        $scope.changePasswordFailed = true;
      }
    });
  };

  $scope.gotoAccountPage = function gotoAccountPage() {
    $location.path('/my/account');
  };
}

PasswordController['$inject'] = ['$location', '$scope', 'AuthenticationService', 'UserSessionService'];
angular.module('em.app').controller('PasswordController', PasswordController);
