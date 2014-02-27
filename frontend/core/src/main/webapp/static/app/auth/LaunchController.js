'use strict';

function LaunchController($location, $scope, AuthenticationService) {
  $scope.user = {};

  // http://coding.smashingmagazine.com/2014/01/23/understanding-javascript-function-prototype-bind/
  $scope.launchUser = function launchUser() {
    AuthenticationService.postInviteRequest($scope.user.email).then(
      checkEmailStatus,
      emailStatusFailure
      );
  };

  // https://google-styleguide.googlecode.com/svn/trunk/angularjs-google-style.html
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
    // http://stackoverflow.com/a/724532
    function redirectToWaitingPage() {
      $location.path('/waiting');
      $location.search({
        uuid: inviteRequestResponse.data.result.uuid,
        queue_number: inviteRequestResponse.data.queueNumber
      });
    }
  }

  function emailStatusFailure() {
  }
}

LaunchController['$inject'] = ['$location', '$scope', 'AuthenticationService'];
angular.module('em.app').controller('LaunchController', LaunchController);
