'use strict';

function LaunchController($location, $scope, AuthenticationService) {
  $scope.user = {};

  // http://coding.smashingmagazine.com/2014/01/23/understanding-javascript-function-prototype-bind/
  $scope.launchUser = function launchUser() {
    AuthenticationService.postInviteRequest($scope.user.email).then(
      this.checkEmailStatus.bind(this),
      this.emailStatusFailure
      );
  }.bind(this);

  this.getInviteRequestUUID = function getInviteRequestUUID(uuid) {
    AuthenticationService.getInviteRequestQueueNumber(uuid).then(this.redirectTo('waiting'));
  };
  function showWaitingList(inviteRequestQueueNumberResponse) {
    $scope.inviteRequestQueueNumber = inviteRequestQueueNumberResponse.data;
  }

  this.getInvite = function getInvite(uuid) {
    AuthenticationService.getInviteWithUUID(uuid).then(this.redirectTo('waiting'));
  };

  this.redirectTo = function redirectTo(page) {
    $location.path('/' + page);
  };
}

// https://google-styleguide.googlecode.com/svn/trunk/angularjs-google-style.html
LaunchController.prototype.checkEmailStatus = function checkEmailStatus(emailStatusResponse) {
  // user in invite queue
  if (emailStatusResponse.data.inviteRequestUUID) {
    this.getInviteRequestUUID(emailStatusResponse.data.uuid);
  }
  // user can sign up
  else if (emailStatusResponse.data.inviteUUID) {
    this.getInvite(emailStatusResponse.data.inviteUUID);
  }
  // User exists.
  // Redirect to front page which redirects to login page is not logged in.
  else if (emailStatusResponse.data.user) {
    this.redirectTo('');
  }
};

LaunchController.prototype.emailStatusFailure = function emailStatusFailure() {
};

LaunchController['$inject'] = ['$location', '$scope', 'AuthenticationService'];
angular.module('em.app').controller('LaunchController', LaunchController);
