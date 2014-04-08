'use strict';

function SignupController($location, $scope, $routeParams, $window, AuthenticationService, AnalyticsService) {

  AnalyticsService.visitEntry('signup');

  $scope.user = {};
  var inviteResponseCode = $routeParams.hex_code;

  AuthenticationService.getInvite(inviteResponseCode, $routeParams.email).then(function(inviteResponse) {
    if (inviteResponse.data.accepted) {
      $location.path('/login');
    } else {
      $scope.user.username = inviteResponse.data.email;
    }
  });

  $scope.signUp = function() {
    $scope.signupFailed = false;
    $scope.signupOffline = false;
    $scope.loginFailed = false;
    // Cohort is a random number between 1 and 128
    var randomCohort = Math.floor(Math.random() * 128) + 1;
    AuthenticationService.acceptInvite(inviteResponseCode,
      {email: $scope.user.username,
       password: $scope.user.password,
       cohort: randomCohort}).
    then(function() {
      AnalyticsService.do('acceptInvite');
      loginUser(true);
    }, function(signupResponse) {
      if (signupResponse && (signupResponse.status === 404 ||signupResponse.status === 502)){
        $scope.signupOffline = true;
      }else if(signupResponse && (signupResponse.status === 400)){
        $scope.signupFailed = true;
      }
    });
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
      $location.path('/my/tasks');
    }
  }

  function loginError(authenticateResponse) {
    if (authenticateResponse && (authenticateResponse.status === 404 || authenticateResponse.status === 502)){
      $scope.signupOffline = true;
    }else if(authenticateResponse && (authenticateResponse.status === 403)){
      $scope.loginFailed = true;
    }
  }

  $scope.gotoTermsOfService = function() {
    AnalyticsService.visit('terms');
    $window.open('http://ext.md/terms.html', '_system');
  };

  $scope.gotoPrivacyPolicy = function() {
    AnalyticsService.visit('privacy');
    $window.open('http://ext.md/privacy.html', '_system');
  };
}

SignupController['$inject'] = ['$location', '$scope', '$routeParams', '$window', 'AuthenticationService', 'AnalyticsService'];
angular.module('em.app').controller('SignupController', SignupController);
