'use strict';

function LaunchController($location, $scope, AuthenticationService) {
  $scope.user = {};

  $scope.launchUser = function launchUser() {
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

  function emailStatusFailure() {
  }
}

LaunchController['$inject'] = ['$location', '$scope', 'AuthenticationService'];
angular.module('em.app').controller('LaunchController', LaunchController);
