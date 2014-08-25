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

 function VerifyController($location, $routeParams, $scope, AuthenticationService, AnalyticsService) {

  AnalyticsService.visitEntry('verify');

  var emailVerificationCode = $routeParams.hex_code;
  $scope.email = $routeParams.email;

  $scope.gotoService = function gotoService() {
    $location.url($location.path());
    $location.path('/my');
  };

  $scope.emailVerified = false;
  $scope.emailVerificationFailed = undefined;

  function verifyEmail() {
    AuthenticationService.postVerifyEmail(emailVerificationCode, $scope.email).then(
      function(/*verifyEmailResponse*/) {
        $scope.emailVerified = true;
      },
      function(failure) {
        $scope.emailVerificationFailed = failure;
      }
      );
  }

  // Try to verify right away
  verifyEmail();
}

VerifyController['$inject'] = ['$location', '$routeParams', '$scope', 'AuthenticationService', 'AnalyticsService'];
angular.module('em.app').controller('VerifyController', VerifyController);
