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

 function UserEditorController($scope, AnalyticsService, AuthenticationService, BackendClientService,
                               UserService, UserSessionService) {

  $scope.isUserVerified = false;

  $scope.changePassword = function (oldPassword, newPassword) {
    $scope.userEditOffline = false;
    $scope.changePasswordFailed = false;
    AuthenticationService.putChangePassword(UserSessionService.getEmail(),
                                            oldPassword,
                                            newPassword).then(function(changePasswordResponse){
      // Need to relogin with new password
      AuthenticationService.login({username: UserSessionService.getEmail(),
                                  password: newPassword,
                                  remember: UserSessionService.isAuthenticateReplaceable()})
      .then(function(authenticationResponse){
        $scope.closeEditor();
      });
    }, function(error){
      if (BackendClientService.isOffline(error.value.status)) {
        $scope.userEditOffline = true;
      } else if (error.value.status !== 200) {
        $scope.changePasswordFailed = true;
      }
    });
  }
}
UserEditorController['$inject'] = ['$scope', 'AnalyticsService', 'AuthenticationService',
'BackendClientService', 'UserService', 'UserSessionService'];
angular.module('em.user').controller('UserEditorController', UserEditorController);
