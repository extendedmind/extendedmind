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
  function checkEmailStatus(emailStatusResponse) {
    // user in invite queue
    if (emailStatusResponse.data.inviteRequestUUID) {
      $location.path('waiting/' + emailStatusResponse.data.inviteRequestUUID);
    }
    // user can sign up
    else if (emailStatusResponse.data.inviteUUID) {
      $location.path('waiting/' + $scope.user.email);
    }
    // User exists.
    // Redirect to front page which redirects to login page is not logged in.
    else if (emailStatusResponse.data.user) {
      $location.path('');
    }
  }

  function emailStatusFailure() {
  }
}

LaunchController['$inject'] = ['$location', '$scope', 'AuthenticationService'];
angular.module('em.app').controller('LaunchController', LaunchController);
