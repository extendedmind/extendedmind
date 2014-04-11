'use strict';

function SignupController($location, $scope, $rootScope, $routeParams, $window, AuthenticationService, AnalyticsService) {

  AnalyticsService.visitEntry('signup');

  $scope.user = {};
  var inviteResponseCode = $routeParams.hex_code;

  AuthenticationService.getInvite(inviteResponseCode, $routeParams.email).then(function(inviteResponse) {
    if (inviteResponse.data.accepted) {
      location.url($location.path());
      if ($rootScope.packaging.endsWith('phonegap')){
        $location.path('/login');
      }else {
        // Direct user to the welcome page so that it is possible to load app
        // from the invite link, when used from the web
        $location.path('/welcome');
      }
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
    var payload = {email: $scope.user.username,
       password: $scope.user.password,
       cohort: randomCohort};
    if ($routeParams.bypass){
      payload.bypass = true;
    }

    AuthenticationService.acceptInvite(inviteResponseCode, payload).
    then(function() {
      AnalyticsService.do('acceptInvite');
      if ($rootScope.packaging.endsWith('phonegap')){
        // In PhoneGap, don't go to welcome page
        loginUser(false);
      }else{
        loginUser(true);
      }
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

SignupController['$inject'] = ['$location', '$scope', '$rootScope', '$routeParams', '$window', 'AuthenticationService', 'AnalyticsService'];
angular.module('em.app').controller('SignupController', SignupController);
