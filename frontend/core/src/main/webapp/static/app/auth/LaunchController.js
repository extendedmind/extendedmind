'use strict';

function LaunchController($location, $scope, AuthenticationService, AnalyticsService) {

  AnalyticsService.visitEntry('launch');

  $scope.user = {};

  $scope.launchUser = function launchUser() {
    $scope.launchFailed = false;
    $scope.launchOffline = false;
    AuthenticationService.postInviteRequest($scope.user.email).then(
      function(response){
        if (!AuthenticationService.checkEmailStatus(response, $scope.user)){
          scope.launchFailed = true;
        }
      },
      emailStatusFailure
      );
  };

  function emailStatusFailure(error) {
    if (error.status === 404 || error.status === 502) {
      $scope.launchOffline = true;
    } else {
      $scope.launchFailed = true;
    }
  }
}

LaunchController['$inject'] = ['$location', '$scope', 'AuthenticationService', 'AnalyticsService'];
angular.module('em.app').controller('LaunchController', LaunchController);
