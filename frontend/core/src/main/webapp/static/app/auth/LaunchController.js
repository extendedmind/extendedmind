'use strict';

function LaunchController($location, $scope, AuthenticationService, AnalyticsService) {

  AnalyticsService.visitEntry('launch');
  
  $scope.user = {};

  $scope.launchUser = function launchUser() {
    $scope.launchFailed = false;
    $scope.launchOffline = false;
    AuthenticationService.postInviteRequest($scope.user.email).then(
      checkEmailStatus,
      emailStatusFailure
      );
  };

  function checkEmailStatus(inviteRequestResponse) {
    // Redirect user with new invite request to waiting page, then show queue.
    if (inviteRequestResponse.data.resultType === 'newInviteRequest') {
      redirectToWaitingPage();
    }
    // Redirect user with existing invite request to waiting page, then show queue.
    else if (inviteRequestResponse.data.resultType === 'inviteRequest') {
      redirectToWaitingPage();
    }
    // Redirect invited user to waiting page, then show info text
    else if (inviteRequestResponse.data.resultType === 'invite') {
      $location.path('/waiting');
      $location.search({
        email: $scope.user.email
      });
    }
    // Redirect existing user to front page.
    else if (inviteRequestResponse.data.resultType === 'user') {
      $location.path('/');
    }
    function redirectToWaitingPage() {
      $location.path('/waiting');
      $location.search({
        uuid: inviteRequestResponse.data.result.uuid,
        queueNumber: inviteRequestResponse.data.queueNumber
      });
    }
  }

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
