'use strict';

function LoginController($location, $scope, UserSessionService, AuthenticationService, AnalyticsService, BackendClientService) {

  AnalyticsService.visitEntry('login');

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
      AnalyticsService.do('login');
      $location.path('/my/tasks');
    }, function(authenticateResponse) {
      if (BackendClientService.isOffline(authenticateResponse.status)){
        AnalyticsService.error('login', 'offline');
        $scope.loginOffline = true;
      }else if(authenticateResponse.status === 403){
        AnalyticsService.error('login', 'failed');
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

LoginController['$inject'] = ['$location', '$scope', 'UserSessionService', 'AuthenticationService', 'AnalyticsService', 'BackendClientService'];
angular.module('em.app').controller('LoginController', LoginController);
