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

 function PasswordController($scope, AnalyticsService, AuthenticationService, BackendClientService, UserSessionService) {

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
          $scope.gotoPreviousPage();
        }, function(error) {
          if (BackendClientService.isOffline(error.status)) {
            $scope.changePasswordOffline = true;
          } else {
            $scope.loginFailed = true;
          }
        });
    }, function(error) {
      if (BackendClientService.isOffline(error.status)) {
        AnalyticsService.error('changePassword', 'offline');
        $scope.changePasswordOffline = true;
      } else {
        AnalyticsService.error('changePassword', 'failed');
        $scope.changePasswordFailed = true;
      }
    });
  };

  $scope.gotoAccountPage = function gotoAccountPage() {
    $scope.gotoPreviousPage();
  };
}

PasswordController['$inject'] = ['$scope', 'AnalyticsService', 'AuthenticationService', 'BackendClientService', 'UserSessionService'];
angular.module('em.entry').controller('PasswordController', PasswordController);
