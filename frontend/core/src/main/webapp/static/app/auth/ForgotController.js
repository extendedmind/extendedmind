'use strict';

function ForgotController($routeParams, $scope, $location, BackendClientService, AuthenticationService, AnalyticsService) {

  AnalyticsService.visitEntry('forgot');

  var passwordResetCode = $routeParams.hex_code;
  var email = $routeParams.email;
  $scope.user = {
    email: email
  };
  $scope.resetCodeExpires = undefined;

  $scope.showResetInstructions = function(){
    if (!passwordResetCode && !$scope.resetCodeExpires){
      return true;
    }
  };

  $scope.showResetForm = function(){
    if (passwordResetCode){
      return true;
    }
  };

  $scope.gotoLogin = function(){
    $location.url($location.path());
    $location.path('/login');
  };

  $scope.sendInstructions = function(){
    $scope.sendFailed = false;
    $scope.sendOffline = false;
    if ($scope.user.email){
      AuthenticationService.postForgotPassword($scope.user.email).then(
        function(forgotPasswordResponse){
          if (BackendClientService.isOffline(forgotPasswordResponse.status)){
            $scope.sendOffline = true;
          }else if(forgotPasswordResponse.status !== 200){
            $scope.sendFailed = true;
          }else if (forgotPasswordResponse.data){
            $scope.resetCodeExpires = forgotPasswordResponse.data.resetCodeExpires;
          }
        }
      );
    }
  };

  $scope.resetPassword = function(){
    $scope.resetOffline = false;
    $scope.resetFailed = false;
    $scope.loginFailed = false;
    if ($scope.user.password){
      AuthenticationService.postResetPassword(passwordResetCode, $scope.user.email, $scope.user.password).then(
        function(resetPasswordResponse){
          if (BackendClientService.isOffline(resetPasswordResponse.status)){
            $scope.resetOffline = true;
          }else if(resetPasswordResponse.status !== 200){
            $scope.resetFailed = true;
          }else if (resetPasswordResponse.data && resetPasswordResponse.data.count){
            // Authenticate using the new password
            AuthenticationService.login({username:$scope.user.email, password: $scope.user.password}).then(
              function(/*authenticationResponse*/) {
                $location.path('/');
                $location.search({});
              }, function(error){
                if (BackendClientService.isOffline(error.status)){
                  $scope.resetOffline = true;
                }else {
                  $scope.loginFailed = true;
                }
              }
            );
          }
        }
      );
    }
  };

}

ForgotController['$inject'] = ['$routeParams', '$scope', '$location', 'BackendClientService', 'AuthenticationService', 'AnalyticsService'];
angular.module('em.app').controller('ForgotController', ForgotController);
