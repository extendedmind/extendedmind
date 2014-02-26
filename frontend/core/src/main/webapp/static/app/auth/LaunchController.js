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

  this.redirectTo = function redirectTo(page) {
    $location.path('/' + page);
  };
}

// https://google-styleguide.googlecode.com/svn/trunk/angularjs-google-style.html
LaunchController.prototype.checkEmailStatus = function checkEmailStatus(emailStatusResponse) {
  // user in invite queue
  if (emailStatusResponse.data.inviteRequestUUID) {
    this.redirectTo('waiting/' + emailStatusResponse.data.inviteRequestUUID);
  }
  // user can sign up
  else if (emailStatusResponse.data.inviteUUID) {
    this.redirectTo('waiting');
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
