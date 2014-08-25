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

 function WaitingController($location, $routeParams, $scope, $window, AnalyticsService, AuthenticationService) {

  AnalyticsService.visit('waiting');

  $scope.user = {};

  if ($routeParams.email) {
    $scope.user.email = $routeParams.email;
  }
  if ($routeParams.uuid) {
    $scope.user.uuid = $routeParams.uuid;
  }
  if ($routeParams.queueNumber !== undefined) {
    $scope.user.inviteQueueNumber = $routeParams.queueNumber;
  }
  if ($routeParams.coupon) {
    $scope.coupon = true;
  }
  if ($routeParams.invite) {
    $scope.invite = true;
  }
  if ($routeParams.request) {
    $scope.request = true;
  }

  $scope.useCoupon = function() {
    $scope.invalidCoupon = false;
    AuthenticationService.postInviteRequestBypass($scope.user.uuid, $scope.user.email, $scope.user.coupon).then(
      function(inviteResponse) {
        if (inviteResponse.data) {
          $location.path('/accept/' + inviteResponse.data.code);
          $location.search({
            email: $scope.user.email,
            bypass: true
          });
        }
      }, function(/*error*/) {
        $scope.invalidCoupon = true;
      });
  };

  $scope.resent = false;
  $scope.resendInvite = function() {
    AuthenticationService.resendInvite($scope.user.uuid, $scope.user.email).then(
      function(resendResponse) {
        if (resendResponse.data) {
          $scope.resent = true;
        }
      });
  };

  $scope.openEMBlogInNewWindow = function openBlogInNewWindow() {
    AnalyticsService.visit('blog');
    $window.open('http://extendedmind.org/', '_system');
  };
}

WaitingController['$inject'] = ['$location', '$routeParams', '$scope', '$window', 'AnalyticsService', 'AuthenticationService'];
angular.module('em.app').controller('WaitingController', WaitingController);
