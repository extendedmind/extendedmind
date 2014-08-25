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

 function LaunchController($scope, AnalyticsService, AuthenticationService, BackendClientService) {

  AnalyticsService.visitEntry('launch');

  $scope.user = {};

  $scope.launchUser = function launchUser() {
    $scope.launchFailed = false;
    $scope.launchOffline = false;
    AuthenticationService.postInviteRequest($scope.user.email).then(
      function(response) {
        if (!AuthenticationService.checkEmailStatus(response, $scope.user)) {
          $scope.launchFailed = true;
        }
      },
      emailStatusFailure
      );
  };

  function emailStatusFailure(error) {
    if (BackendClientService.isOffline(error.status)) {
      $scope.launchOffline = true;
    } else {
      $scope.launchFailed = true;
    }
  }
}

LaunchController['$inject'] = ['$scope', 'AnalyticsService', 'AuthenticationService', 'BackendClientService'];
angular.module('em.app').controller('LaunchController', LaunchController);
