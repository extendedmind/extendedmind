'use strict';

function WaitingController($routeParams, $scope, AuthenticationService) {
  $scope.user = {};
  if ($routeParams.email) {
    $scope.user.email = $routeParams.email;
  } else if ($routeParams.uuid) {
    // getInviteRequestQueueNumber();
    $scope.user.uuid = $routeParams.uuid;
  }

  // function getInviteRequestQueueNumber() {
  //   AuthenticationService.getInviteRequestQueueNumber($routeParams.uuid).then(function(inviteRequestQueueNumberResponse) {
  //     $scope.user.inviteQueueNumber = inviteRequestQueueNumberResponse.data;
  //   });
  // }

  $scope.resendInviteEmail = function resendInviteEmail() {
  };
}

WaitingController['$inject'] = ['$routeParams', '$scope', 'AuthenticationService'];
angular.module('em.app').controller('WaitingController', WaitingController);
