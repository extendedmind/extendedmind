'use strict';

function WaitingController($routeParams, $scope, $window) {
  $scope.user = {};

  if ($routeParams.email) {
    $scope.user.email = $routeParams.email;
  } else if ($routeParams.uuid) {
    $scope.user.uuid = $routeParams.uuid;
  }
  $scope.user.inviteQueueNumber = $routeParams.queueNumber;

  $scope.openEMBlogInNewWindow = function openBlogInNewWindow() {
    $window.open('http://extendedmind.org/');
  };
}

WaitingController['$inject'] = ['$routeParams', '$scope', '$window'];
angular.module('em.app').controller('WaitingController', WaitingController);
