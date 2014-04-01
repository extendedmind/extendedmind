'use strict';

function LoginController($location, $scope, UserSessionService, AuthenticationService, AnalyticsService) {

  AnalyticsService.visitLogin();

  $scope.user = {};
  $scope.isUserEmailReadOnly = false;

  if (UserSessionService.getEmail()) {
    $scope.isUserEmailReadOnly = true;
    $scope.user.username = UserSessionService.getEmail();
  }

  $scope.userLogin = function() {
    if ($scope.rememberByDefault()){
      $scope.user.remember = true;
    }
    $scope.loginFailed = false;
    $scope.loginOffline = false;
    AuthenticationService.login($scope.user).then(function() {
      $location.path('/my/tasks');
    }, function(authenticateResponse) {
      if (authenticateResponse && (authenticateResponse.status === 404 || authenticateResponse.status === 502)){
        $scope.loginOffline = true;
      }else if(authenticateResponse && (authenticateResponse.status === 403)){
        $scope.loginFailed = true;
      }
    });
  };
  $scope.rememberByDefault = function() {
    return UserSessionService.getRememberByDefault();
  };

  $scope.gotoForgot = function() {
    $location.path('/forgot');
    $location.search({email: $scope.user.username});
  };
}

LoginController['$inject'] = ['$location', '$scope', 'UserSessionService', 'AuthenticationService', 'AnalyticsService'];
angular.module('em.app').controller('LoginController', LoginController);
