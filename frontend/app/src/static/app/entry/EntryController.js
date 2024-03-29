/* Copyright 2013-2017 Extended Mind Technologies Oy
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

/* global angular, cordova, console */
'use strict';

function EntryController($location, $rootScope, $routeParams, $scope, $timeout,
                         AnalyticsService, AuthenticationService, BackendClientService, ContentService,
                         DetectBrowserService, HookService, PlatformService, SwiperService, UISessionService,
                         UserService, UserSessionService, packaging) {

  AnalyticsService.visit('entry','load_entry', true);

  $scope.directToEntryMain = false;
  function initializeLogin(){
    $scope.directToEntryMain = true;
    $scope.entryState = 'login';
    $scope.user = {};
    SwiperService.setInitialSlidePath('entry', 'entry/main');
    AnalyticsService.visit('entry', 'log_in', true);
  }

  function initializeSignup(){
    $scope.directToEntryMain = true;
    $scope.entryState = 'signup';
    $scope.user = {};
    SwiperService.setInitialSlidePath('entry', 'entry/main');
    AnalyticsService.visit('entry', 'sign_up', true);
  }

  $scope.isWeb = function() {
    return packaging === 'web';
  };

  // Initialize login/signup path.

  if ($scope.isWeb() && DetectBrowserService.isMobile()) {
    $scope.entryState = 'unsupported';
    $scope.mobilePlatform = true;
  }else if ($scope.isWeb() &&
            ((!DetectBrowserService.isChrome() && !DetectBrowserService.isWindowsPhone()) ||
             $location.path() === '/unsupported')) {
    $scope.entryState = 'unsupported';
  }else if ($location.path() === '/login' ||
            (($location.path() === '/entry' || $location.path() === '') && $scope.isWeb())){
    initializeLogin();
  }else if ($location.path() === '/signup' && $scope.isWeb()){
    initializeSignup();
  }

  // NAVIGATION

  $scope.activeDetails = undefined;
  $scope.swipeToDetails = function(detailsType, mode){
    $scope.activeDetails = detailsType;
    if (mode === 'privacy' || mode === 'terms'){
      ContentService.getExternalHtml(mode).then(function(response){
        $scope.details = {html: response};
        SwiperService.swipeTo('entry/details');
        AnalyticsService.visit(mode);
      });
    }else{
      SwiperService.swipeTo('entry/details');
    }
  };

  $scope.swipeToLogin = function() {
    $scope.entryState = 'login';
    $scope.user = {};
    SwiperService.swipeTo('entry/main');
    SwiperService.setEnableSwipeToNext('entry', true);
    HookService.swipeToEntryLogin($scope);
    AnalyticsService.visit('entry', 'log_in', true);
  };

  $scope.swipeToHome = function() {
    SwiperService.swipeTo('entry/home');
  };

  $scope.swipeToMain = function() {
    $scope.resetCodeExpires = undefined;
    SwiperService.swipeTo('entry/main');
  };

  $scope.isHomeSlideEnabled = function() {
    return !$scope.directToEntryMain;
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
    AnalyticsService.do('entry', 'log_in');
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
      text: 'you are now logged out of every device'
    });
    if ($scope.user && $scope.user.password) $scope.user.password = '';
  }

  $scope.rememberByDefault = function() {
    return UserSessionService.getRememberByDefault();
  };

  // SIGN UP

  $scope.signUp = function() {
    $scope.signupFailed = false;
    $scope.entryOffline = false;
    $scope.loginFailed = false;
    $scope.signingUp = true;

    // Cohort is a random number between 1 and 128
    var randomCohort = Math.floor(Math.random() * 128) + 1;

    var payload = {email: $scope.user.username,
     password: $scope.user.password,
     cohort: randomCohort};

    AuthenticationService.signUp(payload).then(signUpSuccess, signUpFailed);
  };

  function signUpSuccess(/*response*/) {
    // Clear all possible previous data to prevent problems with simultaneous other log in
    $rootScope.$emit('emException', {type: 'clearAll'});

    AuthenticationService.login($scope.user).then(
      function(/*response*/) {
        $scope.startTutorial();
      },
      function(error) {
        if (error.type === 'offline') {
          $scope.entryOffline = true;
        } else if (error.type === 'forbidden') {
          $scope.loginFailed = true;
        }
        $scope.signingUp = false;
      }
    );
  }

  function signUpFailed(error) {
    if (error.type === 'offline') {
      $scope.entryOffline = true;
    } else if (error.type === 'badRequest') {
      $scope.signupFailed = true;
    }
    $scope.signingUp = false;
  }

  // TUTORIAL

  $scope.startTutorial = function() {
    var userUUID = UserSessionService.getUserUUID();
    if (!userUUID) userUUID = UserSessionService.createFakeUserUUID();

    // Start tutorial from focus/tasks
    var newUserFeatureValues = {
      focus: { tasks: 1 }
    };

    PlatformService.getFeatureValue('timeFormat').then(
      function(timeFormat){
        if (timeFormat === '12h'){
          UserSessionService.setUIPreference('hour12', true);
        }
      },function(error) {
        console.error('could not get time format');
        console.error(error);
      }
    );
    PlatformService.getFeatureValue('firstDayOfWeek').then(
      function(firstDayOfWeek){
        if (firstDayOfWeek === 0){
          UserSessionService.setUIPreference('sundayWeek', true);
        }
      },function(error) {
        console.error('could not get first day of week');
        console.error(error);
      }
    );

    UserSessionService.setPreference('onboarded', newUserFeatureValues);
    UserService.saveAccountPreferences();
    AnalyticsService.do('entry', 'start_tutorial');
    HookService.startEntryTutorial($scope);
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

  // Add ability to hook into entry scope

  HookService.initializeEntryControllerScope($scope);

}

EntryController['$inject'] = ['$location', '$rootScope', '$routeParams', '$scope', '$timeout',
'AnalyticsService', 'AuthenticationService', 'BackendClientService', 'ContentService', 'DetectBrowserService',
'HookService', 'PlatformService', 'SwiperService', 'UISessionService', 'UserService',
'UserSessionService', 'packaging'];
angular.module('em.entry').controller('EntryController', EntryController);
