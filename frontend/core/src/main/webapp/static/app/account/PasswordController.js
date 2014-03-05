'use strict';

function PasswordController($location, $scope, AccountService, UserSessionService) {
  var email = UserSessionService.getEmail();

  $scope.changePassword = function changePassword() {
    AccountService.putChangePassword(email, $scope.user.currentPassword, $scope.user.newPassword)
    .then(function(changePasswordResponse) {
      // TODO: Move this controller to auth, and authenticate using the new password
      $location.path('/login');
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

PasswordController['$inject'] = ['$location', '$scope', 'AccountService', 'UserSessionService'];
angular.module('em.app').controller('PasswordController', PasswordController);
