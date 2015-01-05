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
    }else if (mode === 'terms') {
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
    redirectAuthenticatedUser();
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

     AuthenticationService.signUp(payload).then(signUpSuccess, signUpFailed);
   };

   function signUpSuccess(response) {
    AnalyticsService.doWithUuid('signUp', undefined, response.uuid);
    AuthenticationService.login($scope.user).then
    (redirectAuthenticatedUser,
     function(error) {
      if (error.type === 'offline') {
        $scope.entryOffline = true;
      } else if (error.type === 'forbidden') {
        $scope.loginFailed = true;
      }
    });
  }

  function signUpFailed(error) {
    if (error.type === 'offline') {
      $scope.entryOffline = true;
    } else if (error.type === 'badRequest') {
      $scope.signupFailed = true;
    }
  }

  /*
  * Go to tutorial or into the app.
  */
  function redirectAuthenticatedUser() {
    $scope.userAuthenticated = true;
    var userPreferences = UserSessionService.getPreferences();
    if (!userPreferences || !userPreferences.onboarded) {
      $scope.showTutorial = true;
    } else {
      $location.path('/my');
    }
  }

  // TUTORIAL
  $scope.skipTutorial = function() {
    UserSessionService.setPreference('onboarded', packaging);
    UserService.saveAccountPreferences();
    $location.path('/my');
  };
  $scope.startTutorial = function() {
    $location.path('/my');
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
