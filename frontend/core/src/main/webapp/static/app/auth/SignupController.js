'use strict';

function SignupController($location, $scope, $routeParams, $window, AuthenticationService) {

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
    AuthenticationService.signUp(inviteResponseCode,
          {email: $scope.user.username,
           password: $scope.user.password,
           cohort: randomCohort}).
      then(function() {
        userLogin();
      }, function(signupResponse) {
        if (signupResponse && (signupResponse.status === 404 ||signupResponse.status === 502)){
          $scope.signupOffline = true;
        }else if(signupResponse && (signupResponse.status === 400)){
          $scope.signupFailed = true;
        }
      });
  };

  function userLogin() {
    AuthenticationService.login($scope.user).then(function() {
      // Clears GET parameters from the URL
      $location.url($location.path());
      $location.path('/my/tasks');
    }, function(authenticateResponse) {
      if (authenticateResponse && (authenticateResponse.status === 404 || authenticateResponse.status === 502)){
        $scope.signupOffline = true;
      }else if(authenticateResponse && (authenticateResponse.status === 403)){
        $scope.loginFailed = true;
      }
    });
  }

  $scope.gotoTermsOfService = function() {
    $window.open('http://ext.md/terms.html', '_system');
  };

  $scope.gotoPrivacyPolicy = function() {
    $window.open('http://ext.md/privacy.html', '_system');
  };

}

SignupController['$inject'] = ['$location', '$scope', '$routeParams', '$window', 'AuthenticationService'];
angular.module('em.app').controller('SignupController', SignupController);
