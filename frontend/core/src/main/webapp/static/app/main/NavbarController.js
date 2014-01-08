/*global angular */
'use strict';

function NavbarController($location, $scope, $window, AuthenticationService, SwiperService, TasksSlidesService, OwnerService, UserSessionService) {

  $scope.user = UserSessionService.getUserUUID();
  $scope.collectives = UserSessionService.getCollectives();
  $scope.prefix = OwnerService.getPrefix();

  $scope.logout = function() {
    AuthenticationService.logout().then(function() {
      $location.path('/login');
    });
  };

  $scope.setCollectiveActive = function(uuid) {
    AuthenticationService.switchActiveUUID(uuid);
    $location.path('/collective/' + uuid + '/' + TasksSlidesService.HOME);
  };
  
  $scope.setMyActive = function() {
    AuthenticationService.switchActiveUUID(UserSessionService.getUserUUID());
    $location.path('/my/tasks/home');
  };
  
  $scope.addNew = function() {
    $location.path($scope.prefix + '/tasks/new');
  };

  $scope.gotoInbox = function() {
    if ($location.path().indexOf("/tasks/") != -1){
      SwiperService.swipeTo(TasksSlidesService.INBOX);
    }else{
      $location.path($scope.prefix + '/' + TasksSlidesService.INBOX);
    }
  };

  $scope.gotoHome = function() {
    if ($location.path().indexOf("/tasks/") != -1){
      SwiperService.swipeTo(TasksSlidesService.HOME);
    }else{
      $location.path($scope.prefix + '/' + TasksSlidesService.HOME);
    }
  };

  $scope.gotoTasks = function() {
    if ($location.path().indexOf("/tasks/") != -1){
      SwiperService.swipeTo(TasksSlidesService.DATES);
    }else{
      $location.path($scope.prefix + '/' + TasksSlidesService.DATES);
    }
  };

  $scope.useCollectives = function () {
    if (UserSessionService.getCollectives() && Object.keys(UserSessionService.getCollectives()).length > 1) {
      return true;
    }
  };

  $scope.goToProject = function(uuid) {
    SwiperService.swipeTo(TasksSlidesService.PROJECTS + '/' + uuid);
  };

}

NavbarController.$inject = ['$location', '$scope', '$window', 'AuthenticationService', 'SwiperService', 'TasksSlidesService', 'OwnerService', 'UserSessionService'];
angular.module('em.app').controller('NavbarController', NavbarController);
