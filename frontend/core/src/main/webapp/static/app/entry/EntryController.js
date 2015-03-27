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

/* global angular, pauseExtendedMindAnimation, extendedMindAudio, setupHTML5Audio, extendedMindAnimationDelay,
playExtendedMindAnimation, extendedMindAnimationPhase, Media, cordova */
'use strict';

function EntryController($http, $location, $routeParams, $scope,
                         AnalyticsService, AuthenticationService, DetectBrowserService, SwiperService,
                         UISessionService, UserService, UserSessionService, packaging) {

  AnalyticsService.visitEntry('entry');

  var directToLogin = false;
  function initializeLogin(){
    directToLogin = true;
    $scope.entryState = 'login';
    $scope.user = {};
    SwiperService.setInitialSlidePath('entry', 'entry/main');
    AnalyticsService.visitEntry('login');
  }

  // Initialize login path.

  if (packaging === 'web' && DetectBrowserService.isMobile()) {
    $scope.entryState = 'download';
    $scope.mobilePlatform = true;
  }else if (packaging === 'web' && !DetectBrowserService.isChrome()) {
    $scope.entryState = 'download';
  }else if ($location.path() === '/login' ||
            (($location.path() === '/' || $location.path() === '') && packaging === 'web')){
    initializeLogin();
  }

  if ($routeParams.offline === 'true'){
    UserSessionService.enableOffline(true);
  }

  $scope.swipeToLogin = function() {
    $scope.entryState = 'login';
    $scope.user = {};
    SwiperService.swipeTo('entry/main');
    SwiperService.setEnableSwipeToNext('entry', true);
    if (angular.isFunction(pauseExtendedMindAnimation)) pauseExtendedMindAnimation();
    AnalyticsService.visitEntry('login');
  };

  $scope.swipeToHome = function() {
    SwiperService.swipeTo('entry/home');
  };

  $scope.swipeToMain = function() {
    $scope.resetCodeExpires = undefined;
    SwiperService.swipeTo('entry/main');
  };

  $scope.swipeToDetails = function() {
    SwiperService.swipeTo('entry/details');
  };

  $scope.isHomeSlideEnabled = function() {
    return !directToLogin;
  };

  $scope.isEntryInputAutoFocusDisabled = function() {
    return directToLogin;
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
    $scope.loggingIn = true;
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
    $scope.loggingIn = false;
  }

  $scope.rememberByDefault = function() {
    return UserSessionService.getRememberByDefault();
  };

  // TUTORIAL

  $scope.startTutorial = function() {
    var userUUID = UserSessionService.createFakeUserUUID();
    // Start tutorial from focus/tasks
    var newUserFeatureValues = {
      focus: { tasks: 1 }
    };
    UserSessionService.setPreference('onboarded', newUserFeatureValues);
    UserService.saveAccountPreferences();
    AnalyticsService.doWithUuid('startTutorial', undefined, userUUID);
    $location.path('/my');
  };

  // FORGOT

  $scope.sendInstructions = function() {
    $scope.sendFailed = false;
    $scope.entryOffline = false;
    $scope.sendingInstructions = true;
    if ($scope.user.username) {
      AuthenticationService.postForgotPassword($scope.user.username)
      .then(function(response) {
        $scope.resetCodeExpires = response.resetCodeExpires;
        UISessionService.pushNotification({
          type: 'fyi',
          text: 'instructions sent'
        });
      },
      function(error){
        if (error.type === 'offline') {
          $scope.entryOffline = true;
        } else {
          $scope.sendFailed = true;
        }
        $scope.sendingInstructions = false;
      });
    }
  };

  function getAudioUrl(){
    if (packaging === 'android-cordova'){
      return 'file:///android_asset/www/' + $scope.urlBase + 'audio/theme.mp3';
    }else if (packaging === 'ios-cordova'){
      return $scope.urlBase + 'audio/theme.mp3';
    }
  }

  $scope.useHTML5Audio = function(){
    if (!packaging.endsWith('cordova')){
      return true;
    }
  };

  $scope.playExtendedMindAnimation = function(){
    if (!extendedMindAudio){
      if ($scope.useHTML5Audio()){
        setupHTML5Audio();
      }else if (Media){
        var src = getAudioUrl();
        $scope.theme = new Media(src, function(){
          if (extendedMindAudio !== undefined) extendedMindAudio.ended = true;
          if (packaging === 'android-cordova'){
            // TODO: Fork and improve KeepScreenOnPlugin
            cordova.exec(null, null, 'KeepScreenOn', 'CancelKeepScreenOn', ['']);
          }
        });
        extendedMindAudio = {
          ended: false,
          play: function(){
            $scope.theme.play();
          },
          pause: function(){
            $scope.theme.pause();
          },
          readyState: 1,
          HAVE_FUTURE_DATA: 1
        };
      }
    }
    if (packaging === 'android-cordova'){
      extendedMindAnimationDelay = 0.1;
      // TODO: Fork and improve KeepScreenOnPlugin
      cordova.exec(null, null, 'KeepScreenOn', 'KeepScreenOn', ['']);
    }
    else if (packaging === 'ios-cordova'){
      extendedMindAnimationDelay = 0.05;
    }

    playExtendedMindAnimation();
  };

  // Pause animation when entering background, not really working on iOS
  function pauseCallback(){
    if (extendedMindAudio && extendedMindAnimationPhase !== undefined){
      pauseExtendedMindAnimation();
    }
  }
  if (packaging.endsWith('cordova')){
    document.addEventListener('pause', pauseCallback, false);
    $scope.$on('$destroy', function() {
      document.removeEventListener('pause', pauseCallback, false);
    });
  }
}

EntryController['$inject'] = ['$http', '$location', '$routeParams', '$scope',
'AnalyticsService', 'AuthenticationService', 'DetectBrowserService', 'SwiperService',
'UISessionService', 'UserService', 'UserSessionService', 'packaging'];
angular.module('em.entry').controller('EntryController', EntryController);
