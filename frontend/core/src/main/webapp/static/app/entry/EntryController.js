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

 function EntryController($http, $location, $routeParams, $scope,
                          AnalyticsService, AuthenticationService, DetectBrowserService, SwiperService,
                          UISessionService, UserService, UserSessionService, packaging) {

  AnalyticsService.visitEntry('entry');

  if (UserSessionService.getUserUUID()) {
    $scope.userAuthenticated = true;
    var userPreferences = UserSessionService.getPreferences();
    if (!userPreferences || !userPreferences.onboarded) {
      $scope.showTutorial = true;
    }
  }

  if (packaging === 'web' && DetectBrowserService.isMobile()){
    $scope.entryState = 'download';
  }

  if ($routeParams.offline === 'true'){
    UserSessionService.enableOffline(true);
  }

  $scope.swipeToNewUser = function() {
    $scope.entryState = 'newUser';
    $scope.user = {};
    SwiperService.swipeTo('entry/main');
    SwiperService.setEnableSwipeToNext('entry', false);
    AnalyticsService.visitEntry('newUser');
  };

  $scope.swipeToLogin = function() {
    $scope.entryState = 'login';
    $scope.user = {};
    SwiperService.swipeTo('entry/main');
    SwiperService.setEnableSwipeToNext('entry', true);
    AnalyticsService.visitEntry('login');
  };

  $scope.swipeToHome = function() {
    SwiperService.swipeTo('entry/home');
  };

  $scope.swipeToMain = function() {
    $scope.forgotActive = false;
    $scope.resetCodeExpires = undefined;
    SwiperService.swipeTo('entry/main');
  };

  $scope.swipeToDetails = function(mode) {
    SwiperService.swipeTo('entry/details');
  };

  var entryEmailMainInputFocusCallbackFunction;
  var entryEmailMainInputBlurCallbackFunction;
  $scope.registerEntryMainEmailInputCallbacks = function(focus, blur){
    entryEmailMainInputFocusCallbackFunction = focus;
    entryEmailMainInputBlurCallbackFunction = blur;
  };

  var entryPasswordMainInputBlurCallbackFunction;
  $scope.registerEntryMainPasswordInputCallbacks = function(focus, blur){
    entryPasswordMainInputBlurCallbackFunction = blur;
  };

  var entryEmailForgotInputFocusCallbackFunction;
  var entryEmailForgotInputBlurCallbackFunction;
  $scope.registerEntryForgotEmailInputCallbacks = function(focus, blur){
    entryEmailForgotInputFocusCallbackFunction = focus;
    entryEmailForgotInputBlurCallbackFunction = blur;
  };

  $scope.entrySwiperSlideChanged = function(slidePath/*, activeIndex*/){
    if (entryEmailMainInputFocusCallbackFunction && slidePath === 'entry/main'){
      entryEmailMainInputFocusCallbackFunction();
    }else if (entryEmailForgotInputFocusCallbackFunction && slidePath === 'entry/details'){
      entryEmailForgotInputFocusCallbackFunction();
    }
  };

  // LOG IN

  $scope.logIn = function() {
    if ($scope.rememberByDefault()) {
      $scope.user.remember = true;
    }
    $scope.loginFailed = false;
    $scope.entryOffline = false;
    AuthenticationService.login($scope.user).then(logInSuccess, logInError);
  };

  function logInSuccess() {
    AnalyticsService.do('login');
    // blur all inputs to prevent swiper from breaking
    if (entryEmailMainInputBlurCallbackFunction) entryEmailMainInputBlurCallbackFunction();
    if (entryPasswordMainInputBlurCallbackFunction) entryPasswordMainInputBlurCallbackFunction();
    $location.path('/my');
  }

  function logInError(error) {
    if (error.type === 'offline') {
      AnalyticsService.error('login', 'offline');
      $scope.entryOffline = true;
    } else if (error.type === 'forbidden') {
      AnalyticsService.error('login', 'failed');
      $scope.loginFailed = true;
    }
  }

  $scope.rememberByDefault = function() {
    return UserSessionService.getRememberByDefault();
  };

  // TUTORIAL

  $scope.skipTutorial = function() {
    var userUUID = UserSessionService.createFakeUserUUID()
    UserSessionService.setPreference('onboarded', packaging);
    UserService.saveAccountPreferences();
    AnalyticsService.doWithUuid('skipTutorial', undefined, userUUID);
    $location.path('/my');
  };
  $scope.startTutorial = function() {
    var userUUID = UserSessionService.createFakeUserUUID()
    AnalyticsService.doWithUuid('startTutorial', undefined, userUUID);
    $location.path('/my');
  };
  $scope.disableSkipTutorial = function(){
    // In the web version, disable skipping the tutorial as it is vital
    // that we inform the user that her data is stored only on current
    // browser tab
    console.log(packaging)
    if (packaging === 'web') return true;
  };

  // FORGOT

  $scope.sendInstructions = function() {
    $scope.sendFailed = false;
    $scope.entryOffline = false;
    if ($scope.user.username) {
      AuthenticationService.postForgotPassword($scope.user.username)
      .then(function(response) {
        $scope.resetCodeExpires = response.resetCodeExpires;
        UISessionService.pushNotification({
          type: 'fyi',
          text: 'instructions sent'
        });
        $scope.forgotActive = false;
      },
      function(error){
        if (error.type === 'offline') {
          $scope.entryOffline = true;
        } else {
          $scope.sendFailed = true;
        }
      });
    }
  };
}

EntryController['$inject'] = ['$http', '$location', '$routeParams', '$scope',
  'AnalyticsService', 'AuthenticationService', 'DetectBrowserService', 'SwiperService',
  'UISessionService', 'UserService', 'UserSessionService', 'packaging'];
angular.module('em.entry').controller('EntryController', EntryController);
