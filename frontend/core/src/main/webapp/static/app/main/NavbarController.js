/*global angular */
'use strict';

function NavbarController($location, $scope, $window, AuthenticationService, emSwiper, TasksSlidesService, OwnerService, UserSessionService) {

  $scope.user = UserSessionService.getUserUUID();
  $scope.collectives = UserSessionService.getCollectives();
  $scope.prefix = OwnerService.getPrefix();

  $scope.logout = function() {
    AuthenticationService.logout().then(function() {
      $location.path('/login');
    });
  };

  $scope.setActiveUuid = function(uuid, collective) {
    AuthenticationService.switchActiveUUID(uuid);
    if (collective) {
      $location.path('/collective/' + uuid);
    }
  };

  $scope.addNew = function() {
    $location.path($scope.prefix + '/tasks/new');
  };

  $scope.gotoInbox = function() {
    emSwiper.gotoInbox();
  };

  $scope.gotoHome = function() {
    emSwiper.gotoHome();
  };

  $scope.gotoTasks = function() {
    emSwiper.gotoTasks();
  };

  $scope.useCollectives = function () {
    if (UserSessionService.getCollectives() && Object.keys(UserSessionService.getCollectives()).length > 1) {
      return true;
    }
  };

  $scope.goToProject = function(index) {
    emSwiper.setSlideIndex(TasksSlidesService.PROJECTS, index);
  };

}

NavbarController.$inject = ['$location', '$scope', '$window', 'AuthenticationService', 'emSwiper', 'TasksSlidesService', 'OwnerService', 'UserSessionService'];
angular.module('em.app').controller('NavbarController', NavbarController);
