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

 function ResetController($location, $routeParams, $scope, $window, AnalyticsService, AuthenticationService,
                          BackendClientService, DetectBrowserService, UISessionService, packaging) {

  AnalyticsService.visitEntry('reset');

  var passwordResetCode = $routeParams.hex_code;
  $scope.user = {username: $routeParams.email};

  if (!passwordResetCode || !$scope.user.username) {
    $location.url($location.path());
    $location.path('/');
  }

  $scope.resetPassword = function resetPassword() {
    resetErrors();
    if ($scope.user.password) {
      $scope.resetting = true;
      AuthenticationService.postResetPassword(passwordResetCode, $scope.user.username, $scope.user.password).then(
        function(resetPasswordResponse) {
          if (resetPasswordResponse.data && resetPasswordResponse.data.count) {
            if (packaging === 'web' && DetectBrowserService.isMobile()){
              $location.url($location.path());
              $location.path('/');
            }else{
              // Authenticate using the new password
              AuthenticationService.login($scope.user).then(
                function(/*authenticationResponse*/) {
                  $location.url($location.path());
                  $location.path('/');
                }, function(error) {
                  if (BackendClientService.isOffline(error.status)) {
                    $scope.resetOffline = true;
                  } else {
                    $scope.loginFailed = true;
                  }
                }
              );
            }
            UISessionService.pushNotification({
              type: 'fyi',
              text: 'password reset successful'
            });
          }
        },
        function(errorResponse){
          if (BackendClientService.isOffline(errorResponse.status)) {
            $scope.resetOffline = true;
          } else {
            $scope.resetFailed = true;
          }
          $scope.resetting = false;
        }
      );
    }
  };

  $scope.typePassword = function(){
    resetErrors();
  }

  function resetErrors(){
    $scope.resetOffline = false;
    $scope.resetFailed = false;
    $scope.loginFailed = false;
  }

}
ResetController['$inject'] = ['$location', '$routeParams', '$scope', '$window', 'AnalyticsService',
'AuthenticationService', 'BackendClientService', 'DetectBrowserService', 'UISessionService', 'packaging'];
angular.module('em.entry').controller('ResetController', ResetController);
