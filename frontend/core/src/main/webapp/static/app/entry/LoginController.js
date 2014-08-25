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

 function LoginController($location, $scope, AnalyticsService, AuthenticationService, BackendClientService, UserSessionService) {

  AnalyticsService.visitEntry('login');

  $scope.user = {};
  $scope.isUserEmailReadOnly = false;

  if (UserSessionService.getEmail()) {
    $scope.isUserEmailReadOnly = true;
    $scope.user.username = UserSessionService.getEmail();
  }

  $scope.userLogin = function userLogin() {
    if ($scope.rememberByDefault()) {
      $scope.user.remember = true;
    }
    $scope.loginFailed = false;
    $scope.loginOffline = false;
    AuthenticationService.login($scope.user).then(function() {
      AnalyticsService.do('login');
      $location.path('/my');
    }, function(authenticateResponse) {
      if (BackendClientService.isOffline(authenticateResponse.status)) {
        AnalyticsService.error('login', 'offline');
        $scope.loginOffline = true;
      } else if (authenticateResponse.status === 403) {
        AnalyticsService.error('login', 'failed');
        $scope.loginFailed = true;
      }
    });
  };
  $scope.rememberByDefault = function rememberByDefault() {
    return UserSessionService.getRememberByDefault();
  };

  $scope.gotoForgot = function gotoForgot() {
    $location.path('/forgot');
    $location.search({email: $scope.user.username});
  };
}

LoginController['$inject'] = ['$location', '$scope', 'AnalyticsService', 'AuthenticationService', 'BackendClientService', 'UserSessionService'];
angular.module('em.entry').controller('LoginController', LoginController);
