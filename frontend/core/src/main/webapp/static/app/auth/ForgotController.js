'use strict';

function ForgotController($routeParams, $scope, $location, AuthenticationService, UserSessionService) {
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
    $location.path('/login');
  };

  $scope.sendInstructions = function(){
    $scope.sendFailed = false;
    $scope.sendOffline = false;
    if ($scope.user.email){
      AuthenticationService.postForgotPassword($scope.user.email).then(
        function(forgotPasswordResponse){
          if (forgotPasswordResponse && (forgotPasswordResponse.status === 404 || forgotPasswordResponse.status === 502)){
            $scope.sendOffline = true;
          }else if(forgotPasswordResponse && (forgotPasswordResponse.status !== 200)){
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
          if (resetPasswordResponse && (resetPasswordResponse.status === 404 || resetPasswordResponse.status === 502)){
            $scope.resetOffline = true;
          }else if(resetPasswordResponse && (resetPasswordResponse.status !== 200)){
            $scope.resetFailed = true;
          }else if (resetPasswordResponse.data && resetPasswordResponse.data.count){
            // Authenticate using the new password
            AuthenticationService.login({username:$scope.user.email, password: $scope.user.password}).then(
              function(authenticationResponse) {
                $location.path('/');
                $location.search({});
              }, function(error){
                if (error.status === 404 || error.status === 502){
                  $scope.resetOffline = true;
                }else {
                  $scope.loginFailed = true;
                }      
              }
            )
          }
        }
      );
    }
  };

}

ForgotController['$inject'] = ['$routeParams', '$scope', '$location', 'AuthenticationService', 'UserSessionService'];
angular.module('em.app').controller('ForgotController', ForgotController);
