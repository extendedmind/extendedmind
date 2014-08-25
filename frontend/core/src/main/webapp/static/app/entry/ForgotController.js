/* Copyright 2013-2014 Extended Mind Technologies Oy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 'use strict';

 function ForgotController($location, $routeParams, $scope, AnalyticsService, AuthenticationService, BackendClientService) {

  AnalyticsService.visitEntry('forgot');

  var passwordResetCode = $routeParams.hex_code;
  var email = $routeParams.email;
  $scope.user = {
    email: email
  };
  $scope.resetCodeExpires = undefined;

  $scope.showResetInstructions = function showResetInstructions() {
    if (!passwordResetCode && !$scope.resetCodeExpires) {
      return true;
    }
  };

  $scope.showResetForm = function showResetForm() {
    if (passwordResetCode) {
      return true;
    }
  };

  $scope.gotoLogin = function gotoLogin() {
    $location.url($location.path());
    $location.path('/login');
  };

  $scope.sendInstructions = function sendInstructions() {
    $scope.sendFailed = false;
    $scope.sendOffline = false;
    if ($scope.user.email) {
      AuthenticationService.postForgotPassword($scope.user.email).then(
        function(forgotPasswordResponse) {
          if (BackendClientService.isOffline(forgotPasswordResponse.status)) {
            $scope.sendOffline = true;
          } else if (forgotPasswordResponse.status !== 200) {
            $scope.sendFailed = true;
          } else if (forgotPasswordResponse.data) {
            $scope.resetCodeExpires = forgotPasswordResponse.data.resetCodeExpires;
          }
        }
        );
    }
  };

  $scope.resetPassword = function resetPassword() {
    $scope.resetOffline = false;
    $scope.resetFailed = false;
    $scope.loginFailed = false;
    if ($scope.user.password) {
      AuthenticationService.postResetPassword(passwordResetCode, $scope.user.email, $scope.user.password).then(
        function(resetPasswordResponse) {
          if (BackendClientService.isOffline(resetPasswordResponse.status)) {
            $scope.resetOffline = true;
          } else if (resetPasswordResponse.status !== 200) {
            $scope.resetFailed = true;
          } else if (resetPasswordResponse.data && resetPasswordResponse.data.count) {
            // Authenticate using the new password
            AuthenticationService.login({username:$scope.user.email, password: $scope.user.password}).then(
              function(/*authenticationResponse*/) {
                $location.path('/');
                $location.search({});
              }, function(error) {
                if (BackendClientService.isOffline(error.status)) {
                  $scope.resetOffline = true;
                } else {
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

ForgotController['$inject'] = ['$location', '$routeParams', '$scope', 'AnalyticsService', 'AuthenticationService', 'BackendClientService'];
angular.module('em.app').controller('ForgotController', ForgotController);
