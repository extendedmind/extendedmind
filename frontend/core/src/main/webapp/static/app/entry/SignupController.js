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

 function SignupController($location, $rootScope, $routeParams, $scope, $window, AuthenticationService, AnalyticsService, BackendClientService, UserSessionService) {

  AnalyticsService.visitEntry('signup');

  $scope.user = {};
  var inviteResponseCode = $routeParams.hex_code;

  if (inviteResponseCode) {
    AuthenticationService.getInvite(inviteResponseCode, $routeParams.email).then(function(inviteResponse) {
      if (inviteResponse.data.accepted) {
        $location.url($location.path());
        if ($rootScope.packaging.endsWith('cordova')) {
          $location.path('/login');
        } else {
          // Direct user to the welcome page so that it is possible to load app
          // from the invite link, when used from the web
          $location.path('/welcome');
        }
      } else {
        $scope.user.username = inviteResponse.data.email;
      }
    });
  } else {
    // No hex_code, do a normal signup
    $scope.signUpDirectly = true;
    $scope.user.username = UserSessionService.getEmail();
  }

  $scope.signUp = function signUp() {
    $scope.signupFailed = false;
    $scope.signupOffline = false;
    $scope.loginFailed = false;
    // Cohort is a random number between 1 and 128
    var randomCohort = Math.floor(Math.random() * 128) + 1;
    var payload = {email: $scope.user.username,
     password: $scope.user.password,
     cohort: randomCohort};
     if ($routeParams.bypass) {
      payload.bypass = true;
    }

    if ($scope.signUpDirectly) {
      AuthenticationService.signUp(payload).
      then(function(response) {
        AnalyticsService.doWithUuid('signUp', undefined, response.data.uuid);
        if ($rootScope.packaging.endsWith('cordova')) {
          // In apps, don't go to welcome page
          loginUser(false);
        } else {
          loginUser(true);
        }
      }, function(error) {
        if (BackendClientService.isOffline(error.status)) {
          $scope.signupOffline = true;
        } else if (error.status === 400) {
          $scope.signupFailed = true;
        }
      });

    } else {
      AuthenticationService.acceptInvite(inviteResponseCode, payload).
      then(function(response) {
        AnalyticsService.doWithUuid('acceptInvite', undefined, response.data.uuid);
        if ($rootScope.packaging.endsWith('cordova')) {
          // In apps, don't go to welcome page
          loginUser(false);
        } else {
          loginUser(true);
        }
      }, function(error) {
        if (BackendClientService.isOffline(error.status)) {
          $scope.signupOffline = true;
        } else if (error.status === 400) {
          $scope.signupFailed = true;
        }
      });
    }
  };

  function loginUser(gotoWelcomePage) {
    AuthenticationService.login($scope.user).then(function() {
      redirectUser(gotoWelcomePage);
    }, function(authenticateResponse) {
      loginError(authenticateResponse);
    });
  }

  function redirectUser(gotoWelcomePage) {
    // Clears GET parameters from the URL
    $location.url($location.path());
    if (gotoWelcomePage) {
      $location.path('/welcome');
    } else {
      $location.path('/my');
    }
  }

  function loginError(authenticateResponse) {
    if (BackendClientService.isOffline(authenticateResponse.status)) {
      $scope.signupOffline = true;
    } else if (authenticateResponse.status === 403) {
      $scope.loginFailed = true;
    }
  }

  $scope.gotoTermsOfService = function gotoTermsOfService() {
    AnalyticsService.visit('terms');
    $window.open('http://ext.md/terms.html', '_system');
  };

  $scope.gotoPrivacyPolicy = function gotoPrivacyPolicy() {
    AnalyticsService.visit('privacy');
    $window.open('http://ext.md/privacy.html', '_system');
  };
}

SignupController['$inject'] = ['$location', '$rootScope', '$routeParams', '$scope', '$window', 'AuthenticationService', 'AnalyticsService', 'BackendClientService', 'UserSessionService'];
angular.module('em.entry').controller('SignupController', SignupController);
