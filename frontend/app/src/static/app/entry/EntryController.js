/* Copyright 2013-2015 Extended Mind Technologies Oy
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

function EntryController($http, $location, $rootScope, $routeParams, $scope, $timeout,
                         AnalyticsService, AuthenticationService, DetectBrowserService, SwiperService,
                         UISessionService, UserService, UserSessionService, packaging) {

  AnalyticsService.visitEntry('entry');

  $scope.directToLogin = false;
  function initializeLogin(){
    $scope.directToLogin = true;
    $scope.entryState = 'login';
    $scope.user = {};
    SwiperService.setInitialSlidePath('entry', 'entry/main');
    AnalyticsService.visitEntry('login');
  }

  // Initialize login path.

  if (packaging === 'web' && DetectBrowserService.isMobile()) {
    $scope.entryState = 'unsupported';
    $scope.mobilePlatform = true;
  }else if (packaging === 'web' &&
            ((!DetectBrowserService.isChrome() && !DetectBrowserService.isWindowsPhone()) ||
             $location.path() === '/unsupported')) {
    $scope.entryState = 'unsupported';
  }else if ($location.path() === '/login' ||
            (($location.path() === '/entry' || $location.path() === '') && packaging === 'web')){
    initializeLogin();
  }

  $scope.isWeb = function() {
    return packaging === 'web';
  };

  // NAVIGATION

  $scope.activeDetails = undefined;
  $scope.swipeToDetails = function(detailsType){
    $scope.activeDetails = detailsType;
    SwiperService.swipeTo('entry/details');
  };

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

  $scope.isHomeSlideEnabled = function() {
    return !$scope.directToLogin;
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

  // LOG IN / LOG OUT

  $scope.logIn = function() {
    if ($scope.rememberByDefault()) {
      $scope.user.remember = true;
    }
    $scope.loginFailed = false;
    $scope.entryOffline = false;
    $scope.loggingIn = true;

    // Clear all previous data to prevent problems with tutorial starting again after login
    $rootScope.$emit('emException', {type: 'clearAll'});

    // Force enable offline if route param offline is given
    if ($routeParams.offline === 'true'){
      UserSessionService.enableOffline(true);
    }

    AuthenticationService.login($scope.user).then(logInSuccess, function(error) {
      logInError(error, $scope.user);
    });
  };

  function logInSuccess() {
    AnalyticsService.do('login');
    // blur all inputs to prevent swiper from breaking
    if (entryEmailMainInputBlurCallbackFunction) entryEmailMainInputBlurCallbackFunction();
    if (entryPasswordMainInputBlurCallbackFunction) entryPasswordMainInputBlurCallbackFunction();
    $location.path('/my');
  }

  function logInError(error, userData) {
    if (error.type === 'offline') {
      AnalyticsService.error('login', 'offline');
      $scope.entryOffline = true;
    } else if (error.type === 'forbidden') {
       if (error.value.data && error.value.data.code === 24) {
        // Premium
        var marketUrl;
        if (packaging === 'ios-cordova') {
          marketUrl = 'itms://itunes.com/apps/extendedmind';  // TODO: $rootScope/PlatformService
        } else if (packaging === 'android-cordova') {
          marketUrl = 'market://details?id=org.extendedmind'; // TODO: $rootScope/PlatformService
        }

        var gotoMarketFn = function() {
          if (cordova && cordova.InAppBrowser) cordova.InAppBrowser.open(marketUrl, '_system');
        };

        var rejection = {
          type: 'premium',
          value: {
            confirm: gotoMarketFn,
            secondaryConfirmDeferred: clearAllLogins,
            secondaryConfirmDeferredParam: userData,
            secondaryConfirmPromise: clearAllLoginsSuccess
          }
        };
        $rootScope.$emit('emException', rejection);
        AnalyticsService.error('login', 'already logged in');
      } else {
        AnalyticsService.error('login', 'failed');
        $scope.loginFailed = true;
      }
    }
    $scope.loggingIn = false;
  }

  function clearAllLogins(userData) {
    return UserService.clear(userData);
  }

  function clearAllLoginsSuccess() {
    UISessionService.pushNotification({
      type: 'fyi',
      text: 'you are now logged out'
    });
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

  function animationEndCallback(){
    AnalyticsService.do('endAnimation');
  }

  $scope.playExtendedMindAnimation = function(){
    if (!extendedMindAudio){
      if ($scope.useHTML5Audio()){
        setupHTML5Audio(animationEndCallback);
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
          muted: false,
          setVolume: function(volume){
            $scope.theme.setVolume(volume);
          },
          readyState: 1,
          HAVE_FUTURE_DATA: 1,
          endCallback: animationEndCallback
        };
        // Start off with a very quiet volume, volume is added gradually as animation progresses
        extendedMindAudio.setVolume(0.05);
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
    AnalyticsService.do('playAnimation');
    playExtendedMindAnimation();
  };

  var audioReady = !$scope.useHTML5Audio();
  var sloganReady, logoReady, slidesReady;
  $scope.notifyAnimationReady = function(type){
    if (type === 'audio') audioReady = true;
    else if (type === 'slogan') sloganReady = true;
    else if (type === 'logo') logoReady = true;
    else if (type === 'slides') slidesReady = true;
    if (audioReady && sloganReady && logoReady && slidesReady &&
        UISessionService.getTransientUIState() !== 'loggedOut'){
      $timeout(function(){
        $scope.playExtendedMindAnimation();
      }, 1000);
    }
  };

  $scope.toggleVolume = function(clickEvent){
    extendedMindAudio.muted = !extendedMindAudio.muted;
    if (!$scope.useHTML5Audio()){
      if (extendedMindAudio.muted) $scope.theme.setVolume('0.0');
      else $scope.theme.setVolume('1.0');
    }
    var volumeElem = document.getElementById("volume");
    if (extendedMindAudio.muted){
      volumeElem.className = 'icon-volume-up';
    }else {
      volumeElem.className = 'icon-volume-mute';
    }
    if (clickEvent){
      clickEvent.stopPropagation();
      clickEvent.preventDefault();
    }
    return false;
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

EntryController['$inject'] = ['$http', '$location', '$rootScope', '$routeParams', '$scope', '$timeout',
'AnalyticsService', 'AuthenticationService', 'DetectBrowserService', 'SwiperService',
'UISessionService', 'UserService', 'UserSessionService', 'packaging'];
angular.module('em.entry').controller('EntryController', EntryController);
