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

 function EntryController($scope, AnalyticsService, AuthenticationService, BackendClientService, SwiperService) {

  AnalyticsService.visitEntry('entry');

  $scope.entryState;

  $scope.swipeToSignup = function(){
    $scope.entryState = 'signup';
    $scope.user = {};
    SwiperService.swipeTo('entry/main');
    AnalyticsService.visitEntry('signup');
  };

  $scope.swipeToLogin = function(){
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
  }

  $scope.swipeToMain = function() {
    SwiperService.swipeTo('entry/main');
  }

  $scope.swipeToForgot = function() {
    SwiperService.swipeTo('entry/details');
  }

}

EntryController['$inject'] = ['$scope', 'AnalyticsService', 'AuthenticationService', 'BackendClientService', 'SwiperService'];
angular.module('em.entry').controller('EntryController', EntryController);
