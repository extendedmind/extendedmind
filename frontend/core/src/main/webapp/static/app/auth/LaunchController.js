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
      redirectToInviteWaitingPage();
    }
    // Redirect user with existing invite request to waiting page, then show queue.
    else if (inviteRequestResponse.data.resultType === 'inviteRequest') {
      redirectToInviteWaitingPage();
    }
    // Redirect invited user to waiting page, then show info text
    else if (inviteRequestResponse.data.resultType === 'invite') {
      $location.path('/waiting');
      $location.search({
        email: $scope.user.email,
        invite: true
      });
    }
    // Redirect existing user to front page.
    else if (inviteRequestResponse.data.resultType === 'user') {
      $location.path('/');
    // Redirect coupon to waiting page with possibility to give coupon
    }else if (inviteRequestResponse.data.resultType === 'inviteCoupon') {
      $location.path('/waiting');
      $location.search({
        uuid: inviteRequestResponse.data.result.uuid,
        queueNumber: inviteRequestResponse.data.queueNumber,
        email: $scope.user.email,
        coupon: true
      });
    }
    // Accept invite directly by bypassing queue
    else if (inviteRequestResponse.data.resultType === 'inviteAutomatic') {
      AuthenticationService.postInviteRequestBypass(inviteRequestResponse.data.result.uuid, $scope.user.email).then(
      function(inviteResponse){
        if (inviteResponse.data){
          $location.path('/accept/' + inviteResponse.data.code);
          $location.search({
            email: $scope.user.email,
            bypass: true
          });
        }
      }, function(/*error*/){
        $scope.launchFailed = true;
      });
    }
    function redirectToInviteWaitingPage() {
      $location.path('/waiting');
      $location.search({
        uuid: inviteRequestResponse.data.result.uuid,
        queueNumber: inviteRequestResponse.data.queueNumber,
        request: true
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
