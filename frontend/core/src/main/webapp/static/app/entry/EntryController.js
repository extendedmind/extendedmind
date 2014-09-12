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
                          BackendClientService, SwiperService,
                          UserSessionService) {

  AnalyticsService.visitEntry('entry');

  // DEBUG //
  $scope.DEBUG_openKeyboard = function(){
    $rootScope.packaging = 'devel-cordova';
    $rootScope.softKeyboard.height = 300;
    if (!$scope.$$phase){
      $scope.$apply();
    }
  };
  $scope.DEBUG_closeKeyboard = function(){
    $rootScope.packaging = 'devel-cordova';
    $rootScope.softKeyboard.height = 0;
    if (!$scope.$$phase) $scope.$apply();
  };
  // DEBUG //

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
  };

  // ACTIONS

  $scope.logIn = function() {
    if ($scope.rememberByDefault()) {
      $scope.user.remember = true;
    }
    $scope.loginFailed = false;
    $scope.loginOffline = false;
    AuthenticationService.login($scope.user).then(function() {
      AnalyticsService.do('login');
      $location.path('/my');
    }, function(authenticateResponse) {
      if (BackendClientService.isOffline(authenticateResponse.status)) {
        AnalyticsService.error('login', 'offline');
        $scope.loginOffline = true;
      } else if (authenticateResponse.status === 403) {
        AnalyticsService.error('login', 'failed');
        $scope.loginFailed = true;
      }
    });
  };

  $scope.rememberByDefault = function rememberByDefault() {
    return UserSessionService.getRememberByDefault();
  };

}

EntryController['$inject'] = ['$location', '$rootScope', '$scope', '$timeout', '$window',
                              'AnalyticsService', 'AuthenticationService',
                              'BackendClientService', 'SwiperService',
                              'UserSessionService'];
angular.module('em.entry').controller('EntryController', EntryController);
