'use strict';

function WaitingController($routeParams, $scope, $window, AnalyticsService) {

  AnalyticsService.visit('waiting');

  $scope.user = {};

  if ($routeParams.email) {
    $scope.user.email = $routeParams.email;
  } else if ($routeParams.uuid) {
    $scope.user.uuid = $routeParams.uuid;
  }
  $scope.user.inviteQueueNumber = $routeParams.queueNumber;

  $scope.openEMBlogInNewWindow = function openBlogInNewWindow() {
    AnalyticsService.visit('blog');
    $window.open('http://extendedmind.org/', '_system');
  };
}

WaitingController['$inject'] = ['$routeParams', '$scope', '$window', 'AnalyticsService'];
angular.module('em.app').controller('WaitingController', WaitingController);
