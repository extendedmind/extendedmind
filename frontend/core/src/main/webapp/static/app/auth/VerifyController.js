'use strict';

function VerifyController($location, $routeParams, $scope, AuthenticationService, AnalyticsService) {

  AnalyticsService.visitEntry('verify');

  var emailVerificationCode = $routeParams.hex_code;
  $scope.email = $routeParams.email;

  $scope.gotoService = function(){
    $location.url($location.path());
    $location.path('/my');
  };

  $scope.emailVerified = false;
  $scope.emailVerificationFailed = undefined;

  $scope.verifyEmail = function(){
    AuthenticationService.postVerifyEmail(emailVerificationCode, $scope.email).then(
      function(/*verifyEmailResponse*/){
        $scope.emailVerified = true;
      },
      function(failure){
        $scope.emailVerificationFailed = failure;
      }
      );
  };

  // Try to verify right away
  $scope.verifyEmail();
}

VerifyController['$inject'] = ['$location', '$routeParams', '$scope', 'AuthenticationService', 'AnalyticsService'];
angular.module('em.app').controller('VerifyController', VerifyController);
