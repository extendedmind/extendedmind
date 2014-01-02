/*global angular */
'use strict';

function NavbarController($location, $scope, $window, AuthenticationService, emSwiper, Enum, userPrefix, userSessionStorage) {

  $scope.user = userSessionStorage.getUserUUID();
  $scope.collectives = userSessionStorage.getCollectives();
  $scope.prefix = userPrefix.getPrefix();

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
    if (userSessionStorage.getCollectives() && Object.keys(userSessionStorage.getCollectives()).length > 1) {
      return true;
    }
  };

  $scope.goToProject = function(index) {
    emSwiper.setSlideIndex(Enum.PROJECTS, index);
  };

}

NavbarController.$inject = ['$location', '$scope', '$window', 'AuthenticationService', 'emSwiper', 'Enum', 'userPrefix', 'userSessionStorage'];
angular.module('em.app').controller('NavbarController', NavbarController);
