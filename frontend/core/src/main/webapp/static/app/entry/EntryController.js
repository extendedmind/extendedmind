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

 function EntryController($location, $rootScope, $scope, $timeout, $window,
                          AnalyticsService, AuthenticationService,
                          BackendClientService, DetectBrowserService, SwiperService,
                          UserSessionService) {

  AnalyticsService.visitEntry('entry');

  if (DetectBrowserService.isMobile()){
    $scope.entryState = 'download';
  }

  $scope.swipeToSignup = function swipeToSignup() {
    $scope.entryState = 'signup';
    $scope.user = {};
    SwiperService.swipeTo('entry/main');
    AnalyticsService.visitEntry('signup');
  };

  $scope.swipeToLogin = function swipeToLogin() {
    $scope.entryState = 'login';
    $scope.user = {};
    SwiperService.swipeTo('entry/main');
    AnalyticsService.visitEntry('login');
  };

  $scope.gotoTermsOfService = function gotoTermsOfService() {
    AnalyticsService.visit('terms');
    $window.open('http://ext.md/terms.html', '_system');
  };

  $scope.gotoPrivacyPolicy = function gotoPrivacyPolicy() {
    AnalyticsService.visit('privacy');
    $window.open('http://ext.md/privacy.html', '_system');
  };

  $scope.swipeToHome = function() {
    SwiperService.swipeTo('entry/home');
  };

  $scope.swipeToMain = function() {
    SwiperService.swipeTo('entry/main');
  };

  $scope.swipeToForgot = function() {
    SwiperService.swipeTo('entry/details');
    AnalyticsService.visitEntry('forgot');
  };

  // LOG IN

  $scope.logIn = function() {
    if ($scope.rememberByDefault()) {
      $scope.user.remember = true;
    }
    $scope.loginFailed = false;
    $scope.entryOffline = false;
    AuthenticationService.login($scope.user).then(function() {
      AnalyticsService.do('login');
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

  $scope.rememberByDefault = function rememberByDefault() {
    return UserSessionService.getRememberByDefault();
  };

  // SIGN UP

  $scope.signUp = function signUp() {
    $scope.signupFailed = false;
    $scope.entryOffline = false;
    $scope.loginFailed = false;

    // Cohort is a random number between 1 and 128
    var randomCohort = Math.floor(Math.random() * 128) + 1;

    var payload = {email: $scope.user.username,
     password: $scope.user.password,
     cohort: randomCohort};
     if ($routeParams.bypass) {
      payload.bypass = true;
    }

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

  $scope.sendInstructions = function sendInstructions() {
    $scope.sendFailed = false;
    $scope.sendOffline = false;
    if ($scope.user.email) {
      AuthenticationService.postForgotPassword($scope.user.email).then(
        function(forgotPasswordResponse) {
          if (BackendClientService.isOffline(forgotPasswordResponse.status)) {
            $scope.sendOffline = true;
          } else if (forgotPasswordResponse.status !== 200) {
            $scope.sendFailed = true;
          } else if (forgotPasswordResponse.data) {
            $scope.resetCodeExpires = forgotPasswordResponse.data.resetCodeExpires;
          }
        }
        );
    }
  };

}

EntryController['$inject'] = ['$location', '$rootScope', '$scope', '$timeout', '$window',
                              'AnalyticsService', 'AuthenticationService',
                              'BackendClientService', 'DetectBrowserService', 'SwiperService',
                              'UserSessionService'];
angular.module('em.entry').controller('EntryController', EntryController);
