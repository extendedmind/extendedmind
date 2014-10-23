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

 function EntryController($http, $location, $rootScope, $scope, $timeout, $window,
                          AnalyticsService, AuthenticationService,
                          BackendClientService, DetectBrowserService, SwiperService,
                          UISessionService, UserSessionService, packaging) {

  AnalyticsService.visitEntry('entry');

  if (packaging === 'web' && DetectBrowserService.isMobile()){
    $scope.entryState = 'download';
  }

  $scope.swipeToSignup = function() {
    $scope.entryState = 'signup';
    $scope.user = {};
    SwiperService.swipeTo('entry/main');
    SwiperService.setEnableSwipeToNext('entry', false);
    AnalyticsService.visitEntry('signup');
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
    $scope.detailsMode = mode;
    if (!mode){
      $scope.forgotActive = true;
      SwiperService.swipeTo('entry/details');
      AnalyticsService.visitEntry('forgot');
    }else if (mode === 'privacy'){
      $http.get('http://ext.md/privacy.html').then(function(privacyResponse){
        $scope.details = {html: privacyResponse.data};
        SwiperService.swipeTo('entry/details');
        AnalyticsService.visitEntry('privacy');
      });
    }else if (mode === 'terms') {
      $http.get('http://ext.md/terms.html').then(function(termsResponse){
        $scope.details = {html: termsResponse.data};
        SwiperService.swipeTo('entry/details');
        AnalyticsService.visitEntry('terms');
      });
    }
  };

  var entryEmailMainInputFocusCallbackFunction;
  var entryEmailMainInputBlurCallbackFunction;
  $scope.registerEntryMainEmailInputCallbacks = function(focus, blur){
    entryEmailMainInputFocusCallbackFunction = focus;
    entryEmailMainInputBlurCallbackFunction = blur;
  }

  var entryPasswordMainInputBlurCallbackFunction;
  $scope.registerEntryMainPasswordInputCallbacks = function(focus, blur){
    entryPasswordMainInputBlurCallbackFunction = blur;
  }

  var entryEmailForgotInputFocusCallbackFunction;
  var entryEmailForgotInputBlurCallbackFunction;
  $scope.registerEntryForgotEmailInputCallbacks = function(focus, blur){
    entryEmailForgotInputFocusCallbackFunction = focus;
    entryEmailForgotInputBlurCallbackFunction = blur;
  }

  $scope.entrySwiperSlideChanged = function(slidePath, activeIndex){
    if (entryEmailMainInputFocusCallbackFunction && slidePath === 'entry/main'){
      entryEmailMainInputFocusCallbackFunction();
    }else if (entryEmailForgotInputFocusCallbackFunction && slidePath === 'entry/details'){
      entryEmailForgotInputFocusCallbackFunction();
    }
  }

  // LOG IN

  $scope.logIn = function() {
    if ($scope.rememberByDefault()) {
      $scope.user.remember = true;
    }
    $scope.loginFailed = false;
    $scope.entryOffline = false;
    AuthenticationService.login($scope.user).then(function() {
      AnalyticsService.do('login');
      // blur all inputs to prevent swiper from breaking
      if (entryEmailMainInputBlurCallbackFunction) entryEmailMainInputBlurCallbackFunction();
      if (entryPasswordMainInputBlurCallbackFunction) entryPasswordMainInputBlurCallbackFunction();
      $location.path('/my');

    }, function(authenticateResponse) {
      if (BackendClientService.isOffline(authenticateResponse.status)) {
        AnalyticsService.error('login', 'offline');
        $scope.entryOffline = true;
      } else if (authenticateResponse.status === 403) {
        AnalyticsService.error('login', 'failed');
        $scope.loginFailed = true;
      }
    });
  };

  $scope.rememberByDefault = function() {
    return UserSessionService.getRememberByDefault();
  };

  // SIGN UP

  $scope.signUp = function() {
    $scope.signupFailed = false;
    $scope.entryOffline = false;
    $scope.loginFailed = false;

    // Cohort is a random number between 1 and 128
    var randomCohort = Math.floor(Math.random() * 128) + 1;

    var payload = {email: $scope.user.username,
                   password: $scope.user.password,
                   cohort: randomCohort};

    AuthenticationService.signUp(payload).then(function(response) {
      AnalyticsService.doWithUuid('signUp', undefined, response.data.uuid);
      AuthenticationService.login($scope.user).then(function() {
        $location.path('/my');
      }, function(authenticateResponse) {
        if (BackendClientService.isOffline(authenticateResponse.status)) {
          $scope.entryOffline = true;
        } else if (authenticateResponse.status === 403) {
          $scope.loginFailed = true;
        }
      });
    }, function(error) {
      if (BackendClientService.isOffline(error.status)) {
        $scope.entryOffline = true;
      } else if (error.status === 400) {
        $scope.signupFailed = true;
      }
    });
  };

  // FORGOT

  $scope.sendInstructions = function() {
    $scope.sendFailed = false;
    $scope.sendOffline = false;
    if ($scope.user.username) {
      AuthenticationService.postForgotPassword($scope.user.username).then(
        function(forgotPasswordResponse) {
          if (BackendClientService.isOffline(forgotPasswordResponse.status)) {
            $scope.sendOffline = true;
          } else if (forgotPasswordResponse.status !== 200) {
            $scope.sendFailed = true;
          } else if (forgotPasswordResponse.data) {
            $scope.resetCodeExpires = forgotPasswordResponse.data.resetCodeExpires;
            UISessionService.pushNotification({
              type: 'fyi',
              text: 'instructions sent'
            });
            $scope.forgotActive = false;
          }
        }
      );
    }
  };

}

EntryController['$inject'] = ['$http', '$location', '$rootScope', '$scope', '$timeout', '$window',
                              'AnalyticsService', 'AuthenticationService',
                              'BackendClientService', 'DetectBrowserService', 'SwiperService',
                              'UISessionService', 'UserSessionService', 'packaging'];
angular.module('em.entry').controller('EntryController', EntryController);
