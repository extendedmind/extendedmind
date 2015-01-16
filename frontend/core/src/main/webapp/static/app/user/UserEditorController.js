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

 function UserEditorController($http, $rootScope, $scope, $timeout, AnalyticsService, AuthenticationService,
                               BackendClientService, SwiperService, SynchronizeService, UISessionService,
                               UserSessionService) {

  if ($scope.mode === 'signUp'){
    $scope.user = {};
  }

  $scope.changePassword = function (oldPassword, newPassword) {
    $scope.userEditOffline = false;
    $scope.changePasswordFailed = false;
    AuthenticationService.putChangePassword(UserSessionService.getEmail(), oldPassword, newPassword)
    .then(function(){
      // Need to relogin with new password
      AuthenticationService.login({username: UserSessionService.getEmail(),
        password: newPassword,
        remember: UserSessionService.isAuthenticateReplaceable()})
      .then(function(){
        $scope.closeEditor();
      });
    }, function(error){
      if (error.type === 'offline') {
        $scope.userEditOffline = true;
      } else if (error.type === 'forbidden') {
        $scope.changePasswordFailed = true;
      }
    });
  };

  // SIGN UP

  var userEditorEmailInputFocusCallbackFunction;
  $scope.registerUserEditorEmailInputCallbacks = function(focus){
    userEditorEmailInputFocusCallbackFunction = focus;
  };

  function userEditorOpened(){
    if ($scope.mode === 'signUp' && userEditorEmailInputFocusCallbackFunction){
      userEditorEmailInputFocusCallbackFunction();
    }
  }
  $scope.registerFeatureEditorOpenedCallback(userEditorOpened);

  $scope.signUpSwiperSlideChanged = function(slidePath/*, activeIndex*/){
    if (userEditorEmailInputFocusCallbackFunction && slidePath === 'signUp/main'){
      userEditorEmailInputFocusCallbackFunction();
    }
  };

  $scope.swipeToDetails = function(mode) {
    $scope.detailsMode = mode;
    if (mode === 'privacy'){
      $http.get('http://ext.md/privacy.html').then(function(privacyResponse){
        $scope.details = {html: privacyResponse.data};
        SwiperService.swipeTo('signUp/details');
        AnalyticsService.visit('privacy');
      });
    }else if (mode === 'terms') {
      $http.get('http://ext.md/terms.html').then(function(termsResponse){
        $scope.details = {html: termsResponse.data};
        SwiperService.swipeTo('signUp/details');
        AnalyticsService.visit('terms');
      });
    }
  };
  $scope.swipeToMain = function() {
    SwiperService.swipeTo('signUp/main');
  };

  $scope.signUp = function() {
    $scope.signupFailed = false;
    $scope.userEditOffline = false;
    $scope.loginFailed = false;

    // Cohort is a random number between 1 and 128
    var randomCohort = Math.floor(Math.random() * 128) + 1;

    var payload = {email: $scope.user.username,
     password: $scope.user.password,
     cohort: randomCohort};

    AuthenticationService.signUp(payload).then(signUpSuccess, signUpFailed);
  };

  function signUpSuccess(response) {
    // Register uuid change
    var oldUUID = UserSessionService.getUserUUID();
    SynchronizeService.notifyOwnerUUIDChange(oldUUID, response.uuid);
    UISessionService.notifyOwnerUUIDChange(oldUUID, response.uuid);
    AnalyticsService.doWithUuid('signUp', oldUUID, response.uuid);
    AuthenticationService.login($scope.user).then(
      function(response) {
        // Start executing all pending requests now
        BackendClientService.executeRequests();
        $scope.closeEditor();
        UISessionService.pushDelayedNotification({
          type: 'fyi',
          text: 'sign up successful'
        });
        $timeout(function() {
          UISessionService.activateDelayedNotifications();
        }, $rootScope.EDITOR_CLOSED_FAILSAFE_TIME);
      },
      function(error) {
        if (error.type === 'offline') {
          $scope.userEditOffline = true;
        } else if (error.type === 'forbidden') {
          $scope.loginFailed = true;
        }
      }
    );
  }

  function signUpFailed(error) {
    if (error.type === 'offline') {
      $scope.signUpOffline = true;
    } else if (error.type === 'badRequest') {
      $scope.signupFailed = true;
    }
  }
}

UserEditorController['$inject'] = ['$http', '$rootScope', '$scope', '$timeout', 'AnalyticsService',
'AuthenticationService', 'BackendClientService', 'SwiperService', 'SynchronizeService', 'UISessionService',
'UserSessionService'];
angular.module('em.user').controller('UserEditorController', UserEditorController);
